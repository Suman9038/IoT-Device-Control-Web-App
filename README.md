# IoT Device Control Web App

A full-stack web application for controlling and monitoring IoT devices with real-time voice assistant and AI-powered chat, featuring a modern React frontend and a FastAPI backend.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Frontend](#frontend)
- [Backend](#backend)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- **Device Control & Monitoring:** Real-time control and status updates for IoT devices (LEDs, sensors, switches, etc.)
- **Voice Assistant:** Google Gemini-powered voice assistant with real-time speech-to-text, intent detection, and device command execution
- **AI Chatbot:** Natural language chat with multiple conversation tones and AI responses
- **Authentication:** Secure JWT-based login, registration, and OTP verification
- **WebSocket Communication:** Real-time updates for device status, chat, and audio streaming
- **Modern UI/UX:** Responsive, accessible, and visually appealing interface with dark mode and animations
- **Bulk Operations:** Register, update, and delete multiple devices at once
- **Statistics & Search:** Device statistics, search, and filter capabilities
- **Extensible Backend:** Modular FastAPI backend with MQTT, database, and WebSocket support

---

## Architecture

```
+-------------------+        HTTP REST API         +-------------------+
|    Frontend       | <-------------------------> |      Backend      |
|  (React, Vite,    |                             |   (FastAPI, Py)   |
|   Tailwind CSS)   |                             |                   |
+-------------------+                             +-------------------+
				|                                                   |
				|<-----------> IoT Device Network (MQTT, etc.) <----|
```

---

## Frontend

- **Framework:** React 18 (with Vite for fast builds)
- **Styling:** Tailwind CSS v4+
- **Routing:** React Router DOM
- **API Calls:** Axios
- **WebSocket:** Real-time device, chat, and audio communication
- **Authentication:** JWT, OTP, protected routes
- **Voice Assistant:** Audio capture, streaming, and TTS
- **AI Chatbot:** Gemini-powered chat with tone selection
- **Device Management:** Register, update, delete, and control devices
- **UI/UX:** Responsive, dark mode, glassmorphism, accessibility

### Key Files
- `src/main.jsx` — Entry point, renders the app
- `src/App.jsx` — Main app component
- `src/index.css` — Tailwind CSS directives
- `tailwind.config.js` — Tailwind configuration
- `postcss.config.mjs` — PostCSS config for Tailwind v4+

---

## Backend

- **Framework:** FastAPI (Python 3.12+)
- **API:** RESTful endpoints for authentication, device control, user management, and voice processing
- **WebSocket:** Real-time audio and chat endpoints
- **MQTT:** Device command publishing and status updates
- **Database:** SQLAlchemy ORM for users, devices, and logs
- **Voice Assistant:** Google Gemini API and Google Speech Recognition integration
- **Authentication:** JWT, OTP, user management
- **Extensible:** Modular routers for easy feature addition

### Key Files
- `main.py` — FastAPI app entry point, CORS, routers, MQTT
- `device_control.py` — Device command endpoints
- `voice_assistant.py` — Voice processing, Gemini, speech recognition
- `mqtt_client.py` — MQTT connection and publishing
- `models.py` — SQLAlchemy models
- `routes.py` — User, auth, and device routes
- `websocket.py` — WebSocket endpoints for chat/audio
- `config.py` — App configuration

---

## Getting Started

### Prerequisites
- **Frontend:** Node.js (v18+), npm
- **Backend:** Python 3.12+, pip
- **Gemini API Key:** Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 1. Clone the Repository
```sh
git clone <repository-url>
cd IoT-Device-Control-Web-App
```

### 2. Setup the Backend
```sh
python -m venv venv
venv\Scripts\activate  # On Windows
# Or: source venv/bin/activate  # On Linux/Mac
pip install -r requirements.txt
# Add your Gemini API key to .env
GEMINI_API_KEY=your_gemini_api_key_here
uvicorn main:app --reload
```
- Backend runs at `http://localhost:8000`

### 3. Setup the Frontend
```sh
cd Frontend
npm install
npm run dev
```
- Frontend runs at `http://localhost:5173`

---

## Project Structure

```
IoT-Device-Control-Web-App/
├── main.py
├── device_control.py
├── voice_assistant.py
├── mqtt_client.py
├── websocket.py
├── models.py
├── routes.py
├── config.py
├── database.py
├── schema.py
├── utils.py
├── oauth2.py
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── tailwind.config.js
│   ├── postcss.config.mjs
│   ├── package.json
│   └── vite.config.js
└── ...
```

---

## Troubleshooting

- **Unknown at rule @tailwind:** Install the [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) VS Code extension.
- **Tailwind v4+ PostCSS error:** Ensure your `postcss.config.mjs` uses:
	```js
	import tailwindcss from '@tailwindcss/postcss';
	import autoprefixer from 'autoprefixer';
	export default {
		plugins: [
			tailwindcss(),
			autoprefixer(),
		],
	}
	```
- **WebSocket/Audio issues:** Check backend is running, CORS is enabled, and WebSocket URLs are correct.
- **Authentication issues:** Clear browser storage, check backend endpoints, verify email/OTP setup.
- **Device commands not working:** Check device status, MQTT broker, and permissions.
- **Gemini API errors:** Ensure your API key is set in `.env` and you have internet access.

---

## License

This project is licensed under the MIT License.
