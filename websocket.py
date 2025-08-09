from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Depends
from typing import List
import json
import google.generativeai as genai
import os
import base64
import asyncio

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print("WebSocket client connected")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print("WebSocket client disconnected")

    async def send_message(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error sending message: {e}")
        
    async def broadcast_json(self, payload: dict):
        """Send JSON to all connected clients"""
        for connection in list(self.active_connections):  # Copy list to avoid modification during iteration
            try:
                await connection.send_text(json.dumps(payload))
            except Exception as e:
                print(f"Error broadcasting JSON: {e}")
                # Remove broken connections
                if connection in self.active_connections:
                    self.active_connections.remove(connection)

# Global Instance of the connection manager
manager = ConnectionManager()

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    from voice_assistant import handle_command, detect_intent  # Import your functions
    await manager.connect(websocket)
    
    try:
        while True:
            # Receive message from client
            raw_data = await websocket.receive_text()
            
            try:
                # Parse JSON message
                data = json.loads(raw_data)
                print(f"Received WebSocket message: {data}")
                
                # Handle different message types
                message_type = data.get("type")
                
                if message_type == "chat_message":
                    # Handle chat messages from the ChatBot component
                    user_message = data.get("message", "")
                    tone = data.get("tone", "friendly")
                    
                    print(f"Processing chat message: {user_message}")
                    
                    # Use your existing detect_intent function
                    ai_response = detect_intent(user_message, tone=tone)
                    
                    # Send response back to the client
                    response_payload = {
                        "type": "chat_response",
                        "response": ai_response,
                        "timestamp": json.dumps({"timestamp": "now"})  # You can add proper timestamp
                    }
                    
                    await websocket.send_text(json.dumps(response_payload))
                    print(f"Sent chat response: {ai_response}")
                
                elif message_type == "device_command":
                    # Handle device commands if needed
                    command = data.get("command", "")
                    device_id = data.get("device_id")
                    
                    # Process device command
                    result = f"Device {device_id} command '{command}' executed"
                    
                    response_payload = {
                        "type": "device_response",
                        "result": result,
                        "device_id": device_id
                    }
                    
                    await websocket.send_text(json.dumps(response_payload))
                
                else:
                    # Handle unknown message types
                    print(f"Unknown message type: {message_type}")
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": f"Unknown message type: {message_type}"
                    }))
                    
            except json.JSONDecodeError:
                # Handle non-JSON messages
                print(f"Received non-JSON message: {raw_data}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON format"
                }))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("WebSocket client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@router.websocket("/ws/audio")
async def audio_stream_ws(websocket: WebSocket):
    from voice_assistant import handle_command, detect_intent
    await websocket.accept()
    print("🎤 Audio WebSocket connected - Using Google Speech-to-Text + Gemini")

    audio_buffer = b""
    buffer_size = 16000 * 3  # 3 seconds of 16-bit audio at 16kHz (increased buffer size)
    
    try:
        while True:
            data = await websocket.receive_bytes()
            audio_buffer += data
            
            # Process audio buffer when it reaches sufficient size
            if len(audio_buffer) >= buffer_size:
                try:
                    # Use the voice processor for real speech recognition
                    from voice_processor import process_audio_with_speech_to_text
                    
                    # Process the audio data
                    result = process_audio_with_speech_to_text(audio_buffer)
                    
                    if result["success"]:
                        transcript = result["transcript"]
                        intent = result["intent"]
                        confidence = result["confidence"]
                        
                        print(f"🎯 SPEECH RECOGNIZED: '{transcript}' (confidence: {confidence:.2f})")
                        
                        # Send transcript to frontend
                        await websocket.send_text(json.dumps({
                            "type": "transcript",
                            "text": transcript
                        }))
                        
                        # Send AI response to frontend
                        await websocket.send_text(json.dumps({
                            "type": "ai_response",
                            "response": intent,
                            "command": transcript
                        }))
                        
                        # Handle device commands
                        handle_command(transcript)
                        
                    else:
                        # Only log actual speech recognition failures, not voice activity or frequency checks
                        error_msg = result["error"]
                        if "voice activity" not in error_msg and "frequently" not in error_msg and "Speech not recognized" not in error_msg:
                            print(f"❌ Speech recognition failed: {error_msg}")
                        
                        # Don't send error messages to frontend for normal processing
                        if "Speech not recognized" in error_msg:
                            await websocket.send_text(json.dumps({
                                "type": "error",
                                "message": "Could not understand speech"
                            }))
                    
                    # Clear buffer after processing
                    audio_buffer = b""
                    
                except Exception as e:
                    print(f"❌ Error processing audio: {e}")
                    audio_buffer = b""  # Clear buffer on error
                    
    except WebSocketDisconnect:
        print("🔌 Audio WebSocket disconnected")
    except Exception as e:
        print(f"❌ Audio WebSocket error: {e}")
        import traceback
        traceback.print_exc()

@router.websocket("/ws/audio_live")
async def gemini_audio_ws(websocket: WebSocket):
    """
    WebSocket endpoint for Gemini API integration with Google Speech-to-Text
    """
    from voice_assistant import handle_command, detect_intent
    await websocket.accept()
    print("🎤 Gemini Audio WebSocket connected - Using Google Speech-to-Text + Gemini")

    audio_buffer = b""
    buffer_size = 16000 * 3  # 3 seconds of 16-bit audio at 16kHz (increased buffer size)
    
    try:
        while True:
            data = await websocket.receive_bytes()
            audio_buffer += data
            
            # Process audio buffer when it reaches sufficient size
            if len(audio_buffer) >= buffer_size:
                try:
                    # Use the voice processor for real speech recognition
                    from voice_processor import process_audio_with_speech_to_text
                    
                    # Process the audio data
                    result = process_audio_with_speech_to_text(audio_buffer)
                    
                    if result["success"]:
                        transcript = result["transcript"]
                        intent = result["intent"]
                        confidence = result["confidence"]
                        
                        print(f"🎯 GEMINI SPEECH RECOGNIZED: '{transcript}' (confidence: {confidence:.2f})")
                        
                        # Send transcript to frontend
                        await websocket.send_text(json.dumps({
                            "type": "transcript",
                            "text": transcript
                        }))
                        
                        # Send AI response to frontend
                        await websocket.send_text(json.dumps({
                            "type": "ai_response",
                            "response": intent,
                            "command": transcript
                        }))
                        
                        # Handle device commands
                        handle_command(transcript)
                        
                    else:
                        # Only log actual speech recognition failures, not voice activity or frequency checks
                        error_msg = result["error"]
                        if "voice activity" not in error_msg and "frequently" not in error_msg and "Speech not recognized" not in error_msg:
                            print(f"❌ Speech recognition failed: {error_msg}")
                        
                        # Don't send error messages to frontend for normal processing
                        if "Speech not recognized" in error_msg:
                            await websocket.send_text(json.dumps({
                                "type": "error",
                                "message": "Could not understand speech"
                            }))
                    
                    # Clear buffer after processing
                    audio_buffer = b""
                    
                except Exception as e:
                    print(f"❌ Error processing audio with Gemini: {e}")
                    audio_buffer = b""  # Clear buffer on error
                    
    except WebSocketDisconnect:
        print("🔌 Gemini Audio WebSocket disconnected")
    except Exception as e:
        print(f"❌ Gemini Audio WebSocket error: {e}")
        import traceback
        traceback.print_exc()