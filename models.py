from datetime import datetime, timedelta
from database import Base
from sqlalchemy import String,Integer,Column,Boolean,ForeignKey
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.sql.expression import text
from sqlalchemy.orm import relationship


class User(Base) :
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, nullable=False, index=True)
    username = Column(String(225), unique=True, nullable=False, index=True)
    email = Column(String(225), unique=True , nullable=False, index=True)
    password = Column(String(225), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default=text("now()"))


    # Realationships
    devices = relationship("Device", back_populates="owner")
    otps = relationship("OTP", back_populates="user")

class Device(Base) :
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, nullable=False, index=True)
    device_name = Column(String(225), nullable=False, index= True)
    device_type = Column(String(225) , nullable= False, index=True)
    device_status = Column(String(100), default="offline")
    last_seen = Column(TIMESTAMP, server_default=text("now()"))
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationship with User table  
    owner = relationship("User", back_populates="devices")


class OTP(Base) :
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    otp_code = Column(String(6), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default=text("now()"))
    expires_at = Column(TIMESTAMP, nullable=False)

    # Relationship with User table
    user = relationship("User", back_populates="otps")