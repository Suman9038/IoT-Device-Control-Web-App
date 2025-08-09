import paho.mqtt.client as mqtt
from config import settings
from sqlalchemy.orm import Session
from database import Sessionlocal
import models
import asyncio
import threading
from websocket import manager
from arduino import turn_on_led, turn_off_led, blink_led, read_temperature, read_soil_moisture


# Mqtt Broker Configuration :
BROKER = settings.MQTT_BROKER # add your broker 
PORT = settings.MQTT_PORT # add your port
TOPIC = settings.MQTT_TOPIC # add you custom topic
QOS = 1

# DB Dependency
def get_db():
    db = Sessionlocal()
    try : 
        yield db
    finally :
        db.close()

# On Connect Handeler 
def on_connect(client, userdata, flag, rc):
    if rc == 0 :
        print("MQTT Connected")
        client.subscribe(f"{TOPIC}/+/status", qos= QOS)
        client.subscribe(f"{TOPIC}/+/command", qos=QOS)
    else :
        print(f"MQTT Connection Failed with code {rc}")

def on_message(client, userdata, msg):
    print(f"MQTT msg: {msg.topic} -> {msg.payload.decode()}")
    topic_parts = msg.topic.split("/")
    if len(topic_parts) == 3 :
        device_id = topic_parts[1]
        action = topic_parts[2]
        message = msg.payload.decode()

        if action == "status":
            try :
                db = Sessionlocal()
                device = db.query(models.Device).filter(models.Device.id == device_id).first()
                if device :
                    device.device_status = message
                    db.commit()
                    print(f"Device {device_id} status updated to '{message}'")
                    asyncio.create_task(manager.send_message(f"Device {device_id} status changed to: {message}"))
            except Exception as e:
                print("Database Error while updating the device status", str(e))
            finally:
                db.close()

        elif action == "command":
            handle_device_command(device_id, message)

def handle_device_command(device_id: str, command: str):
    print(f"Handling command: {command} for Device ID: {device_id}")

    if command == "turn_on":
        turn_on_led()
    elif command == "turn_off":
        turn_off_led()
    elif command == "blink":
        blink_led()
    elif command == "read_temperature":
        temperature = read_temperature()
        if temperature is not None:
            temp_topic = f"{TOPIC}/{device_id}/temperature"
            client.publish(temp_topic, str(temperature), qos=QOS)
            print(f" Published temperature {temperature}°C to {temp_topic}")
            asyncio.create_task(manager.send_message(f"Temperature: {temperature}°C"))
        else:
            print("Temperature not ready or sensor error")
    elif command == "read_soil_moisture":
        moisture = read_soil_moisture()
        if moisture is not None:
            moisture_topic = f"{TOPIC}/{device_id}/moisture"
            client.publish(moisture_topic, str(moisture), qos= QOS)
            print(f" Soil Moisture from device {device_id}: {moisture}%")
            asyncio.create_task(manager.send_message(f"Soil Moisture: {moisture}%"))
        else:
            print("Soil Moisture Sensor not ready or sensor error")
    else:
        print(" Unknown command received")
# MQTT Client Setup
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

def connect_mqtt():
    client.connect(BROKER,PORT)
    thread = threading.Thread(target = client.loop_forever)
    thread.daemon = True
    thread.start()
    print("MQTT Loop Started in Background")


# MQTT Publish
def publish_device_command(device_id: int, command: str):
    topic = f"{TOPIC}/{device_id}/command"
    result = client.publish(topic, command, qos= QOS)
    staus = result[0]

    if staus == 0:
        print(f"Published '{command}' to '{topic}'")
        return True
    else :
        print(f"Failed to publish to '{topic}'")
        return False