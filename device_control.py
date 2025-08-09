from fastapi import APIRouter, Depends, HTTPException,status
from mqtt_client import publish_device_command
from sqlalchemy.orm import Session
from database import get_db
import models
from oauth2 import JWTAUTH

jwt_auth = JWTAUTH()
router = APIRouter(tags=["Device Control"])

@router.post("/device/{device_id}/command")
def control_device(device_id: int, command: str, db: Session = Depends(get_db), current_user: models.User= Depends(jwt_auth.get_current_user)):
    device= db.query(models.Device).filter(models.Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Device not found with the device id:{device_id}")
    success= publish_device_command(device_id, command)
    if not success: 
        raise HTTPException(status_code= status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to publish the command")
    
    return{"message": f"Command '{command}' sent to the device_id: '{device_id}'"}