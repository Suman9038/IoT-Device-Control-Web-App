# IoT Web App Controller Frontend

A modern, responsive React frontend for the IoT Device Control Web App with voice assistant capabilities, real-time device management, and AI-powered chat functionality.

## 🚀 Features

### 🔐 Authentication & Security
- **JWT-based Authentication** with OTP verification
- **Secure Login/Register** with email validation
- **OTP Verification** with countdown timer and resend functionality
- **Protected Routes** with automatic redirects
- **Token Management** with automatic refresh

### 🏠 Device Management
- **Real-time Device Control** via WebSocket connections
- **Device Registration** with type selection (LED, Sensor, Switch, Other)
- **Bulk Operations** - select and delete multiple devices
- **Device Status Monitoring** - online/offline status tracking
- **Device Commands** - send specific commands to devices
- **Search & Filter** - find devices by name or type
- **Device Statistics** - view total, online, and offline device counts

### 🎤 Voice Assistant
- **Real-time Voice Processing** via WebSocket audio streaming
- **Wake Word Detection** - "Jarvis" activation
- **Voice Command Recognition** with AI response generation
- **Audio File Upload** - process pre-recorded voice commands
- **Text-to-Speech** - hear Jarvis responses
- **Connection Status** - real-time audio connection monitoring

### 💬 AI Chatbot
- **Real-time Chat** via WebSocket text messaging
- **Multiple Conversation Tones** - friendly, professional, casual, enthusiastic, helpful
- **AI-powered Responses** using backend Gemini integration
- **Message History** with automatic scrolling
- **Connection Status** - real-time chat connection monitoring

### 🎨 Modern UI/UX
- **Dark Theme** with glassmorphism effects
- **Responsive Design** - works on desktop, tablet, and mobile
- **Smooth Animations** - CSS transitions and micro-interactions
- **Toast Notifications** - success, error, info, and warning messages
- **Loading States** - spinners and skeleton screens
- **Accessibility** - keyboard navigation and screen reader support

## 🛠️ Technology Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **WebSocket** - Real-time bidirectional communication
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **Context API** - State management

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iot-voice-assistant-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_WS_BASE_URL=ws://localhost:8000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### API Configuration
The frontend connects to the backend API at `http://localhost:8000` by default. Update the constants in `src/utils/constants.js` if needed:

```javascript
export const API_BASE_URL = 'http://localhost:8000';
export const WS_BASE_URL = 'ws://localhost:8000';
export const WS_TEXT_URL = `${WS_BASE_URL}/ws`;
export const WS_AUDIO_URL = `${WS_BASE_URL}/ws/audio`;
```

### WebSocket Endpoints
- **Text WebSocket**: `/ws` - For chat messages and device commands
- **Audio WebSocket**: `/ws/audio` - For real-time voice processing

## 🚀 Usage

### Authentication Flow
1. **Register** - Create a new account with email and password
2. **Login** - Enter credentials to receive OTP
3. **Verify OTP** - Enter 6-digit code sent to email
4. **Access Dashboard** - Full access to all features

### Device Management
1. **Add Device** - Click "+ Add Device" to register new IoT devices
2. **Control Devices** - Toggle power, send commands, view status
3. **Bulk Operations** - Select multiple devices for batch operations
4. **Search & Filter** - Find specific devices quickly

### Voice Assistant
1. **Connect** - Ensure audio WebSocket connection is established
2. **Activate** - Say "Jarvis" to wake up the assistant
3. **Give Commands** - Speak naturally to control devices
4. **Upload Audio** - Process pre-recorded voice files

### AI Chatbot
1. **Select Tone** - Choose conversation style (friendly, professional, etc.)
2. **Send Messages** - Type questions or commands
3. **Get AI Responses** - Receive intelligent responses from Jarvis
4. **Clear Chat** - Start fresh conversations

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── chat/           # Chatbot components
│   ├── common/         # Reusable UI components
│   ├── dashboard/      # Device management components
│   └── voice/          # Voice assistant components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API and WebSocket services
├── styles/             # CSS and styling
└── utils/              # Utility functions and constants
```

## 🔌 Backend Integration

### API Endpoints
- **Authentication**: `/register/user`, `/login`, `/verify-otp`
- **User Management**: `/user/me`, `/user/update_profile`
- **Device Management**: `/device/*`, `/register/device`
- **Voice Processing**: `/api/voice-command`
- **Device Control**: `/device/{id}/command`

### WebSocket Messages
- **Chat**: `chat_message` → `chat_response`
- **Device Commands**: `device_command` → `device_response`
- **Voice**: Audio streaming with real-time processing
- **Status Updates**: Connection status and error handling

## 🎯 Key Features

### Real-time Communication
- **WebSocket Connections** for instant updates
- **Automatic Reconnection** with exponential backoff
- **Connection Status Monitoring** with visual indicators
- **Error Handling** with user-friendly messages

### Device Control
- **MQTT Integration** via backend for IoT device communication
- **Command Routing** to specific devices
- **Status Synchronization** between frontend and backend
- **Bulk Operations** for efficient device management

### Voice Processing
- **Vosk Speech Recognition** for accurate voice commands
- **Wake Word Detection** with "Jarvis" activation
- **Real-time Audio Streaming** for immediate response
- **AI Integration** for intelligent command processing

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Ensure backend server is running
   - Check WebSocket URLs in constants
   - Verify CORS configuration

2. **Audio Not Working**
   - Check microphone permissions
   - Ensure HTTPS for production (required for audio)
   - Verify audio WebSocket connection

3. **Authentication Issues**
   - Clear browser storage
   - Check backend authentication endpoints
   - Verify email configuration for OTP

4. **Device Commands Not Working**
   - Check device status (online/offline)
   - Verify MQTT broker connection
   - Check device permissions

### Development Tips

1. **Enable Debug Logging**
   ```javascript
   // In browser console
   localStorage.setItem('debug', 'true');
   ```

2. **Check WebSocket Status**
   ```javascript
   // In browser console
   console.log(window.websocketService?.getConnectionStatus());
   ```

3. **Test API Endpoints**
   ```bash
   curl -X GET http://localhost:8000/
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Backend Team** - For the comprehensive API and WebSocket implementation
- **Vosk** - For speech recognition capabilities
- **Gemini AI** - For intelligent conversation responses
- **MQTT** - For IoT device communication

---

**Built with ❤️ for smart homes and IoT enthusiasts**
