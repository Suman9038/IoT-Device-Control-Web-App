import queue
import sounddevice as sd
import json, os
from mqtt_client import publish_device_command
from rapidfuzz import fuzz
import google.generativeai as genai
import asyncio
import websockets
import base64
import wave
import io

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Print available models for reference
print("Available Gemini models:")
for model_info in genai.list_models():
    if "live" in model_info.name.lower() or "bidi" in str(model_info.supported_generation_methods).lower():
        print(f"  {model_info.name} - {model_info.display_name} - {model_info.supported_generation_methods}")

# Use a standard model since bidi_generate_content is not available
model = genai.GenerativeModel("gemini-2.5-flash")

q = queue.Queue()

# --------- AUDIO STREAM ---------
samplerate = 16000
device = None

# --------- GEMINI API FUNCTIONS ---------
async def process_audio_with_gemini(audio_data):
    """
    Process audio with Gemini API for text-based processing
    For now, we'll use a simplified approach since direct audio processing isn't available
    """
    try:
        # For now, we'll return a placeholder response
        # In a real implementation, you would convert audio to text first
        return "I heard your voice command. Please try speaking clearly."
        
    except Exception as e:
        print(f"Error processing audio with Gemini: {e}")
        return "Sorry, I'm having trouble processing your request right now."

def detect_intent(user_input, tone="friendly"):
    """
    Detect intent using Gemini for text-based commands
    """
    prompt = f"""
You are Jarvis, an intelligent voice assistant for a smart IoT system.

🎯 Your primary job is to detect user *intent*. If the user wants to control a device, respond ONLY with one of these exact action labels:
- turn_on
- turn_off
- blink
- read_temperature
- read_soil_moisture

If the user's message is general (not an IoT command), respond naturally and helpfully with a polite, friendly tone in a complete sentence.

Examples:
User: Could you switch on the light?
Jarvis: turn_on

User: Who created you?
Jarvis: I was created by developers using artificial intelligence technologies.

User: How's the weather today?
Jarvis: I'm not connected to the internet for weather updates right now, but it's always good to check your local forecast!

User: Tell me a joke
Jarvis: Why don't skeletons fight each other? Because they don't have the guts! 😄

Now process this input and respond accordingly:

User: {user_input}
Jarvis:
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error with Gemini API: {e}")
        return "I'm having trouble processing your request right now."

# --------- COMMAND HANDLER ---------
def handle_command(command):
    command = command.lower()
    print(f"Processing command: {command}")

    ai_response = detect_intent(command)
    print(f"🤖 Gemini response: {ai_response}")

    # Handle device control commands
    if ai_response in ["turn_on", "turn_off", "blink", "read_temperature", "read_soil_moisture"]:
        actions = {
            "turn_on": ("Turning on the device", "turn_on"),
            "turn_off": ("Turning off the device", "turn_off"),
            "blink": ("Blinking the LED", "blink"),
            "read_temperature": ("Getting temperature now", "read_temperature"),
            "read_soil_moisture": ("Checking soil moisture", "read_soil_moisture"),
        }
        speak(actions[ai_response][0])
        publish_device_command(1, actions[ai_response][1])
    else:
        # General chatbot response
        speak(ai_response)

# --------- GEMINI TTS FUNCTION ---------
def speak(text):
    """
    Use Gemini TTS to speak the response
    """
    print(f"Speaking: {text}")
    try:
        # For now, we'll use a simple text-to-speech approach
        # In a full implementation, you would use Gemini's TTS capabilities
        # or integrate with a TTS service that works with the audio stream
        
        # This is a placeholder - in the WebSocket implementation,
        # the TTS will be handled by the frontend receiving the text response
        print(f"🎤 TTS Response: {text}")
        
    except Exception as e:
        print(f"Error with TTS: {e}")

# --------- AUDIO CALLBACK ---------
def audio_callback(indata, frames, time, status):
    if status:
        print(status)
    q.put(bytes(indata))

# --------- MAIN LOOP ---------
def listen_and_recognize():
    print("Voice assistant started. Always listening for commands.")
    print("No wake word needed - just speak naturally!")

    with sd.InputStream(samplerate=samplerate, device=device,
                        channels=1, callback=audio_callback, blocksize=8000, dtype='int16'):
        while True:
            data = q.get()
            # Process audio with Gemini API
            asyncio.run(process_audio_with_gemini(data))

def process_audio_file(file_path):
    """Process an audio file and recognize commands using Gemini."""
    try:
        with wave.open(file_path, "rb") as wf:
            if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
                raise ValueError("Audio file must be WAV format, mono, 16-bit, 16000hz samples.")
            
            # Read all audio data
            audio_data = wf.readframes(wf.getnframes())
            
            # Process with Gemini
            response = asyncio.run(process_audio_with_gemini(audio_data))
            print(f"Recognized from file: {response}")
            
            # Handle the response
            handle_command(response)
            return response
            
    except Exception as e:
        print(f"Error processing audio file: {e}")
        return f"Error: {e}"

if __name__ == "__main__":
    try:
        listen_and_recognize()
    except KeyboardInterrupt:
        print("Exiting voice assistant.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        sd.stop()
