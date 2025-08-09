from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base,engine
import models
from routes import router
from device_control import router as mqtt_router
from mqtt_client import connect_mqtt
from websocket import router as websocket_router

Base.metadata.create_all(bind = engine)

app = FastAPI()
origins = [
    "http://localhost:5173",
    "http://localhost:3000",  # React frontend during development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,
    allow_methods=["*"],    # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],    # Allow all headers (Authorization, Content-Type, etc.)
)

# Include all the routes
app.include_router(router)
app.include_router(mqtt_router)
app.include_router(websocket_router)

# Start MQTT client on app start
connect_mqtt()

@app.get("/")
def root():
    return {"message": "Welcome to the IoT device control web app"}
