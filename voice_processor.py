"""
Voice Processing Service using Speech Recognition + Gemini API
"""

import os
import wave
import io
import base64
import speech_recognition as sr
import google.generativeai as genai
import numpy as np
import time

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

class VoiceProcessor:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 300  # Lower threshold for better sensitivity
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.5  # Shorter pause threshold
        self.last_processing_time = 0
        self.min_processing_interval = 2.0  # Minimum 2 seconds between processing attempts
        
    def has_voice_activity(self, audio_data):
        """
        Check if audio data contains voice activity (not just silence)
        """
        try:
            # Convert bytes to numpy array
            audio_array = np.frombuffer(audio_data, dtype=np.int16)
            
            # Calculate RMS (Root Mean Square) to detect voice activity
            rms = np.sqrt(np.mean(audio_array.astype(np.float32) ** 2))
            
            # Threshold for voice activity (adjust based on your microphone)
            voice_threshold = 500  # Adjust this value based on your setup
            
            return rms > voice_threshold
            
        except Exception as e:
            print(f"Error in voice activity detection: {e}")
            return True  # Default to True if detection fails
    
    def process_audio_data(self, audio_data):
        """
        Process raw PCM16 audio data and convert to text using speech_recognition
        """
        try:
            # Check if enough time has passed since last processing
            current_time = time.time()
            if current_time - self.last_processing_time < self.min_processing_interval:
                return {
                    "success": False,
                    "error": "Processing too frequently",
                    "transcript": "",
                    "confidence": 0.0
                }
            
            # Check for voice activity
            if not self.has_voice_activity(audio_data):
                return {
                    "success": False,
                    "error": "No voice activity detected",
                    "transcript": "",
                    "confidence": 0.0
                }
            
            # Update last processing time
            self.last_processing_time = current_time
            
            # Convert PCM16 bytes to audio data
            # Create a WAV file in memory
            with io.BytesIO() as wav_io:
                with wave.open(wav_io, 'wb') as wav_file:
                    wav_file.setnchannels(1)  # Mono
                    wav_file.setsampwidth(2)  # 16-bit
                    wav_file.setframerate(16000)  # 16kHz
                    wav_file.writeframes(audio_data)
                
                wav_io.seek(0)
                
                # Use speech_recognition to process the audio
                with sr.AudioFile(wav_io) as source:
                    # Adjust for ambient noise
                    self.recognizer.adjust_for_ambient_noise(source, duration=0.1)
                    audio = self.recognizer.record(source)
                    
                    # Try Google Speech Recognition (free tier)
                    try:
                        transcript = self.recognizer.recognize_google(audio)
                        confidence = 0.8  # Google doesn't provide confidence in free tier
                        return {
                            "success": True,
                            "transcript": transcript.strip(),
                            "confidence": confidence
                        }
                    except sr.UnknownValueError:
                        return {
                            "success": False,
                            "error": "Speech not recognized",
                            "transcript": "",
                            "confidence": 0.0
                        }
                    except sr.RequestError as e:
                        return {
                            "success": False,
                            "error": f"Could not request results: {e}",
                            "transcript": "",
                            "confidence": 0.0
                        }
            
        except Exception as e:
            print(f"Error in speech recognition: {e}")
            return {
                "success": False,
                "error": str(e),
                "transcript": "",
                "confidence": 0.0
            }
    
    def detect_intent(self, text):
        """
        Use Gemini to detect intent from transcribed text
        """
        try:
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

User: {text}
Jarvis:
            """
            
            response = model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            print(f"Error in intent detection: {e}")
            return "I'm having trouble processing your request right now."
    
    def process_voice_command(self, audio_data):
        """
        Complete voice processing pipeline: Audio → Text → Intent → Response
        """
        # Step 1: Convert audio to text
        speech_result = self.process_audio_data(audio_data)
        
        if not speech_result["success"]:
            # Don't log every "no voice activity" or "processing too frequently" error
            if "voice activity" not in speech_result["error"] and "frequently" not in speech_result["error"]:
                print(f"Speech recognition failed: {speech_result['error']}")
            return {
                "success": False,
                "error": speech_result["error"],
                "transcript": "",
                "intent": "",
                "response": "Sorry, I couldn't understand what you said."
            }
        
        transcript = speech_result["transcript"]
        confidence = speech_result["confidence"]
        
        print(f"🎯 Recognized: '{transcript}' (confidence: {confidence:.2f})")
        
        # Step 2: Detect intent using Gemini
        intent = self.detect_intent(transcript)
        
        return {
            "success": True,
            "transcript": transcript,
            "confidence": confidence,
            "intent": intent,
            "response": intent
        }

# Global instance
voice_processor = VoiceProcessor()

def process_audio_with_speech_to_text(audio_data):
    """
    Convenience function to process audio data
    """
    return voice_processor.process_voice_command(audio_data)
