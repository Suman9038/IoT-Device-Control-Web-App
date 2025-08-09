# Gemini Voice Assistant Integration

This project now uses Google Gemini API combined with Speech Recognition for real-time voice processing, providing a powerful and responsive voice assistant experience.

## 🚀 Features

- **Real-time Speech-to-Text (STT)**: Uses Google Speech Recognition API (free tier)
- **Advanced Intent Detection**: Powered by Google Gemini API
- **No Wake Word Required**: Always listening, just like Alexa
- **Fast Response Times**: Optimized for real-time interaction
- **Device Control**: Seamless integration with IoT devices
- **Natural Language Processing**: Advanced conversation capabilities

## 📋 Prerequisites

1. **Gemini API Key**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Python 3.12+**: Required for the backend
3. **Node.js 18+**: Required for the frontend
4. **Internet Connection**: Required for speech recognition and Gemini API

## 🔧 Setup

### 1. Environment Variables

Create a `.env` file in the root directory:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Install Dependencies

```bash
# Backend dependencies
pip install -r requirements.txt

# Frontend dependencies
cd iot-voice-assistant-frontend
npm install
```

### 3. Test the Integration

```bash
# Test Gemini API
python test_gemini.py

# Test Voice Processor
python test_voice_processor.py
```

## 🎤 How It Works

### Backend (Python)

1. **WebSocket Endpoint**: `/ws/audio_live` receives PCM16 audio from frontend
2. **Speech Recognition**: Converts audio to text using Google Speech Recognition
3. **Gemini API**: Processes text for intent detection and natural language understanding
4. **Device Control**: Executes IoT commands via MQTT

### Frontend (React)

1. **Audio Capture**: Records microphone input as PCM16 data
2. **WebSocket Connection**: Streams audio to backend in real-time
3. **Response Handling**: Displays transcripts and assistant responses
4. **Text-to-Speech**: Uses browser's speech synthesis for responses

## 🎯 Voice Commands

### Device Control
- "Turn on the light" → `turn_on`
- "Turn off the light" → `turn_off`
- "Blink the LED" → `blink`
- "Check temperature" → `read_temperature`
- "Check soil moisture" → `read_soil_moisture`

### General Conversation
- Ask questions, tell jokes, have casual conversations
- The assistant responds naturally and conversationally

## 🔄 API Flow

```
User Speech → Frontend Audio Capture → WebSocket → Backend → Speech Recognition → Gemini API → Intent Detection → Device Control → Response → Frontend TTS
```

## 🛠️ Configuration

### Model Selection

The system uses:
- **Speech Recognition**: Google Speech Recognition API (free tier)
- **Intent Detection**: Gemini 2.5 Flash model

### Audio Settings

- **Sample Rate**: 16kHz
- **Channels**: Mono
- **Format**: PCM16
- **Buffer Size**: 1 second chunks

## 🚨 Troubleshooting

### Common Issues

1. **API Key Not Set**
   ```
   ❌ GEMINI_API_KEY environment variable not set!
   ```
   Solution: Add your API key to the `.env` file

2. **WebSocket Connection Failed**
   ```
   WebSocket connection to 'ws://localhost:8000/ws/audio_live' failed
   ```
   Solution: Ensure the backend server is running

3. **Speech Recognition Errors**
   ```
   ❌ Speech recognition failed: Speech not recognized
   ```
   Solution: Check internet connection and speak clearly

4. **Audio Processing Errors**
   ```
   ❌ Error processing audio
   ```
   Solution: Check microphone permissions and audio settings

### Testing

Run the test scripts to verify everything is working:

```bash
python test_gemini.py
python test_voice_processor.py
```

## 📈 Performance

- **Latency**: ~1-2 seconds response time
- **Accuracy**: High accuracy with Google's speech recognition
- **Reliability**: Robust error handling and fallbacks
- **Cost**: Free tier for speech recognition, pay-per-use for Gemini API

## 🔮 Future Enhancements

- [ ] Local speech recognition for offline use
- [ ] Gemini TTS integration for better voice synthesis
- [ ] Multi-language support
- [ ] Custom wake word training
- [ ] Voice activity detection
- [ ] Noise cancellation
- [ ] Voice biometrics

## 📚 Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Google Speech Recognition](https://cloud.google.com/speech-to-text)
- [Speech Recognition Python Library](https://pypi.org/project/SpeechRecognition/)
- [WebSocket API Reference](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
