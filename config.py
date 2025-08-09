from dotenv import load_dotenv
import os 
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings) :
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    SENDGRID_API_KEY: str
    SENDGRID_SENDER_EMAIL: str
    MQTT_BROKER: str
    MQTT_PORT: int
    MQTT_TOPIC: str

    class Config:
       env_nested_delimiter = "__"


settings= Settings(_env_file=os.path.join(os.getcwd(), "IoT-Device-Control-Web-App/.env"))
# print("Loaded from .env:", settings.DATABASE_URL)