from jose import JWTError, jwt
from datetime import datetime,timedelta
from config import settings
import schema,models,database
from fastapi import Depends,HTTPException,status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")



class JWTAUTH : 
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES


    def create_acces_token(self,data: dict) :
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes= self.access_token_expire_minutes)
        to_encode.update({"exp" : expire})  
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm = self.algorithm)

        return encoded_jwt

    def verify_access_token(self, token : str , credential_exception) :
        try : 
            decode_jwt = jwt.decode(token, self.secret_key , algorithms= self.algorithm)
            user_id = decode_jwt.get("user_id")
            if not id :
                raise credential_exception
            token_data = schema.TokenData(user_id=user_id)
        except JWTError :
            raise credential_exception
        
        return token_data

    # def fetched_logged_in_user(self, token: str = Depends(oauth2_scheme)) :
    #     credential_exception = HTTPException(status_code= status.HTTP_401_UNAUTHORIZED,
    #                                         detail=f"Could not validate the credentials",
    #                                         headers={"WWW-Authenticate": "Bearer"})
        
    #     return self.verify_access_token(token,credential_exception)
    

    def get_current_user(self, token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
        credential_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

        payload = self.verify_access_token(token, credential_exception)
        user_id = payload.user_id

        if user_id is None:
            raise credential_exception

        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user is None:
            raise credential_exception

        return user