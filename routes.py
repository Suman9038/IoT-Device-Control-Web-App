from fastapi import APIRouter,Depends,status,HTTPException,File, UploadFile
from sqlalchemy.orm import Session
import models,schema,utils,shutil,tempfile
from database import get_db
from typing import List
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from datetime import datetime
from oauth2 import JWTAUTH
from voice_assistant import process_audio_file


jwt_auth = JWTAUTH()

# Public Routes 
router = APIRouter()

# Devices Routes
@router.post("/register/device", response_model=schema.DeviceResponse, status_code = status.HTTP_201_CREATED)
def create_device(device: schema.DeviceCreate , db: Session=Depends(get_db), current_user: models.User= Depends(jwt_auth.get_current_user)) :
    new_device= models.Device(
        device_name = device.device_name,
        device_type = device.device_type,
        owner_id = current_user.id
    )
    db.add(new_device)
    db.commit()
    db.refresh(new_device)

    return new_device

@router.get("/device/get_device",response_model= List[schema.DeviceResponse]) 
def get_device(db: Session = Depends(get_db), current_user: models.User= Depends(jwt_auth.get_current_user)) :
    devices=db.query(models.Device).all()

    return devices

@router.get("/device/get_device/{device_id}", response_model=schema.DeviceResponse)
def get_device_by_id(device_id: int, db: Session = Depends(get_db), current_user: models.User= Depends(jwt_auth.get_current_user)) :
    get_one_device = db.query(models.Device).filter(models.Device.id==device_id).first()

    if not get_one_device :
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail=f"The Device with this {id} is not there in database kindly resgister new device first")
    
    return get_one_device

@router.put("/device/update_device/{device_id}", response_model= schema.DeviceResponse)
def update_device_by_id(device_id: str, update_device: schema.DeviceUpdate, db: Session = Depends(get_db), current_user: models.User= Depends(jwt_auth.get_current_user)):
    update_one_device = db.query(models.Device).filter(models.Device.id == device_id).first()

    if not update_one_device: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"The device with this {device_id} is not in the database. Kindly check the device id or register new device first")
    for key, value in update_device.dict(exclude_unset= True).items():
        setattr(update_one_device, key, value) # Whatever the client will update that things will only get updated rest will remain same
    db.commit()
    db.refresh(update_one_device)
    return update_one_device

@router.patch("/device/update_status/{device_id}")
def update_device_status(device_id: int, status_data: schema.DeviceUpdateStatus, db: Session = Depends(get_db), current_user: models.User= Depends(jwt_auth.get_current_user)):
    device = db.query(models.Device).filter(models.Device.id == device_id).first()

    if not device:
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail=f"The device with this {device_id} is not in the database. Kindly check the device id or register new device first")
    
    device.device_status = status_data.device_status
    db.commit()
    db.refresh(device)
    return device
 
@router.delete("/device/delete_device/{device_id}")
def delete_device(device_id: int, db: Session = Depends(get_db), current_user: models.User= Depends(jwt_auth.get_current_user)):
    delete_one_device = db.query(models.Device).filter(models.Device.id == device_id).first()

    if not delete_one_device: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"The device with this {device_id} is not in the database. Kindly check the device id or register new device first")    
    db.delete(delete_one_device)
    db.commit()
    return {"message": "Device deleted successfully"}


@router.delete("/device/device_multiple_devices")
def delete_device_in_bulk(playload: schema.DeleteMultipleDevice, db: Session = Depends(get_db), current_user: models.User= Depends(jwt_auth.get_current_user)):
    devices_to_delete = db.query(models.Device).filter(models.Device.id.in_(playload.device_ids)).all()
    
    if not devices_to_delete:
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail=f"No matching device found for provided ids in the database")
    
    for device in devices_to_delete:
        db.delete(device)
    db.commit()

    return {"message": f"{len(devices_to_delete)} device(s) deleted successfully."}

@router.get("/api/voice-command")
async def voice_command_handler(file: UploadFile = File(...)):
    """
    Endpoint to handle voice commands.
    The file should be an audio file containing the voice command.
    """
    if file.content_type != "audio/wav":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a WAV audio file.")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_file_path = temp_file.name
    try :
        recognized_command = process_audio_file(temp_file_path)
        return {"message": "Voice command processed successfully", "command": recognized_command}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing voice command: {str(e)}")

# User Authentication Routes
@router.post("/register/user", response_model=schema.UserResponse)
def userSingup(user: schema.UserCreate , db: Session= Depends(get_db)) :
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user :
        raise HTTPException(status_code=400, detail=f"Email : {user.email} is already registerd")
    
    hashed_password = utils.hash(user.password)
    new_user = models.User(
        username = user.username,
        email = user.email,
        password = hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login")
def userLogin(user_credentials : schema.UserLogin , db: Session = Depends(get_db)): 
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()

    if not user : 
        raise HTTPException(status_code= status.HTTP_403_FORBIDDEN, detail= f"Invalid credentials")
    
    if not utils.verify_password(user_credentials.password , user.password) :
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Invalid Credentials")
    
    # Login requires OTP - Generate and send OTP
    otp_code = utils.generate_otp()
    expires_at = utils.get_otp_expiry()

    # Saving the OTP in DB
    new_otp = models.OTP(
        user_id = user.id,
        otp_code = otp_code,
        expires_at = expires_at
    )
    db.add(new_otp)
    db.commit()

    if not utils.send_otp_to_email(user.email, otp_code) :
        raise HTTPException(status_code= status.HTTP_500_INTERNAL_SERVER_ERROR , detail= f"Failed to send the OTP to email")
    
    return{"message" : "OTP sent to your registered email."}

@router.put("/user/update_profile", response_model= schema.UserResponse)
def update_user_profile(user_update: schema.UserUpdate, db: Session = Depends(get_db), current_user: models.User= Depends(jwt_auth.get_current_user)):
    # Check if email is being updated and if it's already taken by another user
    if user_update.email and user_update.email != current_user.email:
        existing_user = db.query(models.User).filter(models.User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail=f"Email {user_update.email} is already registered")
    
    # Update fields
    for key, value in user_update.dict(exclude_unset=True).items():
        if key == 'password' and value:
            # Hash the password before storing
            setattr(current_user, key, utils.hash(value))
        else:
            setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/user/me", response_model= schema.UserResponse)
def get_current_user_detail(db: Session = Depends(get_db), current_user: models.User= Depends(jwt_auth.get_current_user)):
    return current_user


@router.post("/verify-otp")
def verifying_otp(otp_data: schema.OTPVerify, db:Session = Depends(get_db)):
    """Fetching user / user id from the email"""
    user = db.query(models.User).filter(models.User.email == otp_data.email).first()
    if not user :
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail= f"User Not Found.")
    
    # OTP checking for the user fetched
    otp_record = db.query(models.OTP).filter(
        models.OTP.user_id == user.id,
        models.OTP.otp_code == otp_data.otp_code
    ).order_by(models.OTP.created_at.desc()).first()

    if not otp_record :
        raise HTTPException(status_code= status.HTTP_400_BAD_REQUEST, detail=f"Invalid OTP.")
    
    # OTP expiry check
    if datetime.utcnow() > otp_record.expires_at :
        raise HTTPException(status_code= status.HTTP_400_BAD_REQUEST, detail= f"OTP expired.")
    
    # Making JWT token with user_id
    access_token = jwt_auth.create_acces_token({"user_id": user.id})

    return{
        "access_token": access_token,
        "token_type": "bearer"
    }
