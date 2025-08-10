# IoT Device Control Web App

A full-stack web application for controlling and monitoring IoT devices with real-time voice assistant and AI-powered chat, featuring a modern React frontend and a FastAPI backend.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Frontend](#frontend)
- [Backend](#backend)
- [Getting Started](#getting-started)
  - [Development Setup](#development-setup)
  - [Docker Deployment](#docker-deployment)
- [Project Structure](#project-structure)
- [Docker Configuration](#docker-configuration)
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
- **Docker Support:** Complete containerization with multi-stage builds and Docker Compose

---

## Architecture

+-------------------+ HTTP REST API +-------------------+
| Frontend | <-------------------------> | Backend |
| (React, Vite, | | (FastAPI, Py) |
| Tailwind CSS) | | |
+-------------------+ +-------------------+
| |
|<-----------> IoT Device Network (MQTT, etc.) <----|
| |
+-------------------+ Docker Network +-------------------+
| MySQL DB | <-------------------------> | MQTT Broker |
| (Persistent) | | (Mosquitto) |
+-------------------+ +-------------------+

text

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
- **Dependency Management:** Poetry
- **API:** RESTful endpoints for authentication, device control, user management, and voice processing
- **WebSocket:** Real-time audio and chat endpoints
- **MQTT:** Device command publishing and status updates
- **Database:** SQLAlchemy ORM for users, devices, and logs (MySQL)
- **Voice Assistant:** Google Gemini API and Google Speech Recognition integration
- **Authentication:** JWT, OTP, user management
- **Containerization:** Docker multi-stage builds with optimized images

### Key Files
- `main.py` — FastAPI app entry point, CORS, routers, MQTT
- `device_control.py` — Device command endpoints
- `voice_assistant.py` — Voice processing, Gemini, speech recognition
- `mqtt_client.py` — MQTT connection and publishing
- `models.py` — SQLAlchemy models
- `routes.py` — User, auth, and device routes
- `websocket.py` — WebSocket endpoints for chat/audio
- `config.py` — App configuration
- `pyproject.toml` — Poetry dependencies

---

## Getting Started

### Development Setup

#### Prerequisites
- **Frontend:** Node.js (v18+), npm
- **Backend:** Python 3.12+, Poetry
- **Gemini API Key:** Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

#### 1. Clone the Repository
git clone <repository-url>
cd IoT-Device-Control-Web-App

text

#### 2. Setup the Backend
Install Poetry (if not installed)
pip install poetry

Install dependencies
poetry install

Activate virtual environment
poetry shell

Add your Gemini API key to .env
GEMINI_API_KEY=your_gemini_api_key_here

Run the backend
poetry run uvicorn main:app --reload

text
- Backend runs at `http://localhost:8000`

#### 3. Setup the Frontend
cd Frontend
npm install
npm run dev

text
- Frontend runs at `http://localhost:5173`

---

### Docker Deployment

#### Prerequisites
- **Docker:** Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Docker Compose:** Included with Docker Desktop

#### Quick Start with Docker
Clone and navigate to project
git clone <repository-url>
cd IoT-Device-Control-Web-App

Start all services (backend, frontend, database, MQTT broker)
docker-compose up --build -d

Check service status
docker-compose ps

View logs
docker-compose logs -f

Stop all services
docker-compose down

text

#### Using the Deploy Script
Make script executable
chmod +x deploy.sh

Run deployment
./deploy.sh

text

#### Access the Application
- **Main Application:** `http://localhost:8000`
- **API Documentation:** `http://localhost:8000/docs`
- **MySQL Database:** `localhost:3306`
- **MQTT Broker:** `localhost:1883`

#### Docker Commands
Build only the main app
docker build -t iot-control-app .

Run single container
docker run -p 8000:8000 iot-control-app

Rebuild and restart
docker-compose up --build -d

View container logs
docker-compose logs app
docker-compose logs db
docker-compose logs mqtt-broker

Execute commands in container
docker-compose exec app poetry run python -c "print('Hello from container!')"
docker-compose exec db mysql -u root -p

Clean up everything
docker-compose down -v
docker system prune -a

text

---

## Project Structure

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
├── pyproject.toml
├── .env
├── Frontend/
│ ├── src/
│ ├── public/
│ ├── tailwind.config.js
│ ├── postcss.config.mjs
│ ├── package.json
│ └── vite.config.js
├── Dockerfile
├── .dockerignore
├── docker-compose.yml
├── mosquitto.conf
├── .env.production
├── deploy.sh
└── README.md

text

---

## Docker Configuration

The application uses a **multi-stage Docker build** for optimal performance and security:

### Build Stages
1. **Frontend Build:** Node.js Alpine image builds React app
2. **Backend Setup:** Python 3.12 slim with Poetry for dependencies
3. **Production:** Combines built frontend with FastAPI backend

### Services
- **app:** Main FastAPI + React application
- **db:** MySQL 8.0 database with persistent storage
- **mqtt-broker:** Eclipse Mosquitto MQTT broker

### Environment Variables
Set these in `.env.template`:
- `DATABASE_URL`
- `SECRET_KEY`
- `GEMINI_API_KEY`
- `MQTT_BROKER`
- `MQTT_PORT`

## Environment Setup
1. Copy the template file:
2. Update the following values in `.env.template`:
- `GEMINI_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- `SECRET_KEY` - Generate a secure random key
- `MYSQL_PASSWORD` - Set a strong database password

### Volumes & Persistence
- **mysql_data:** Database persistence
- **mosquitto_data:** MQTT data persistence
- **mosquitto_logs:** MQTT logs

### Networking
All services communicate through `iot-network` bridge for security and isolation.

---

## Troubleshooting

### Development Issues
- **Unknown at rule @tailwind:** Install the [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) VS Code extension.
- **Tailwind v4+ PostCSS error:** Ensure your `postcss.config.mjs` uses:
    ```
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

### Docker Issues
- **Build failures:** Check Docker is running, sufficient disk space, and internet connection
- **Port conflicts:** Change ports in `docker-compose.yml` if 8000, 3306, or 1883 are in use
- **Database connection errors:** Wait for database to fully initialize (30-60 seconds on first run)
- **MQTT connection issues:** Check `mosquitto.conf` and firewall settings
- **Container health checks:** Use `docker-compose logs` to diagnose service issues
- **Permission issues:** On Linux, you may need to run Docker commands with `sudo`

### Performance Optimization
- **Production deployment:** Use `.env.production` with proper database credentials
- **SSL/HTTPS:** Add Nginx reverse proxy for production
- **Scaling:** Use Docker Swarm or Kubernetes for multiple instances
- **Monitoring:** Add health checks and logging for production monitoring

---

## License

This project is licensed under the MIT License.