from pydantic import BaseModel , EmailStr
from typing import Optional,Union,List
from datetime import datetime


# User Schema
class UserCreate(BaseModel) :
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel) :
    email: EmailStr
    password: str

class UserResponse(BaseModel) :
    id: int
    username: str
    created_at: datetime

    class config :
        orm_mode= True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

# Device schema
class DeviceCreate(BaseModel) :
    device_name: str
    device_type: str

class DeviceResponse(BaseModel) :
    id: int
    device_name: str
    device_type: str
    device_status: str
    last_seen: datetime
    owner_id: int

    class config :
        orm_mode= True

class DeleteMultipleDevice(BaseModel):
    device_ids: List[int]

class DeviceUpdate(BaseModel):
    device_name: Optional[str] = None
    device_type: Optional[str] = None
    device_status: Optional[str] = None

class DeviceUpdateStatus(BaseModel):
    device_status: str


# OTP verifictaion schema
class OTPVerify(BaseModel) :
    email: EmailStr
    otp_code: str


# Token Schema
class Token(BaseModel) :
    access_token: str
    type: str

class TokenData(BaseModel) :
    user_id: Optional[int] = None  