#!/bin/bash

# Jarvis IoT Voice Assistant - Development Startup Script
# This script helps you start both the backend and frontend for development

echo "🚀 Starting Jarvis IoT Voice Assistant Development Environment"
echo "================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and npm are installed${NC}"

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the frontend directory${NC}"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "../" ] || [ ! -f "../main.py" ]; then
    echo -e "${YELLOW}⚠️  Backend not found in parent directory. Starting frontend only.${NC}"
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    npm install
    
    echo -e "${BLUE}🚀 Starting frontend development server...${NC}"
    echo -e "${YELLOW}⚠️  Note: Backend must be running separately for full functionality${NC}"
    npm run dev
    exit 0
fi

# Check if Python is installed (for backend)
if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3 first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python 3 is installed${NC}"

# Check if pip is installed
if ! command_exists pip3; then
    echo -e "${RED}❌ pip3 is not installed. Please install pip3 first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ pip3 is installed${NC}"

# Check if ports are available
echo -e "${BLUE}🔍 Checking port availability...${NC}"

if port_in_use 8000; then
    echo -e "${YELLOW}⚠️  Port 8000 is already in use. Backend may already be running.${NC}"
fi

if port_in_use 5173; then
    echo -e "${YELLOW}⚠️  Port 5173 is already in use. Frontend may already be running.${NC}"
fi

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# Check if backend dependencies are installed
echo -e "${BLUE}📦 Checking backend dependencies...${NC}"
cd ..

if [ ! -f "pyproject.toml" ] && [ ! -f "requirements.txt" ]; then
    echo -e "${YELLOW}⚠️  Backend dependencies not found. Please install them manually.${NC}"
    echo -e "${BLUE}💡 You can install them using: pip install -r requirements.txt${NC}"
    cd iot-voice-assistant-frontend
    echo -e "${BLUE}🚀 Starting frontend only...${NC}"
    npm run dev
    exit 0
fi

# Try to install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
if [ -f "pyproject.toml" ]; then
    pip3 install poetry
    poetry install
elif [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt
fi

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Failed to install backend dependencies. Starting frontend only.${NC}"
    cd iot-voice-assistant-frontend
    echo -e "${BLUE}🚀 Starting frontend development server...${NC}"
    npm run dev
    exit 0
fi

echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Start backend in background
echo -e "${BLUE}🚀 Starting backend server...${NC}"
cd ..
python3 main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! port_in_use 8000; then
    echo -e "${RED}❌ Backend failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Backend server started on http://localhost:8000${NC}"

# Start frontend
echo -e "${BLUE}🚀 Starting frontend development server...${NC}"
cd iot-voice-assistant-frontend
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Check if frontend started successfully
if ! port_in_use 5173; then
    echo -e "${RED}❌ Frontend failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Frontend server started on http://localhost:5173${NC}"

echo ""
echo -e "${GREEN}🎉 Development environment started successfully!${NC}"
echo "================================================================"
echo -e "${BLUE}📱 Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}🔧 Backend:${NC} http://localhost:8000"
echo -e "${BLUE}📚 API Docs:${NC} http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "• Press Ctrl+C to stop both servers"
echo "• Backend logs will appear in the terminal"
echo "• Frontend will auto-reload on file changes"
echo "• Check the README for more information"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping development servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Development servers stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
echo -e "${BLUE}⏳ Development servers are running. Press Ctrl+C to stop.${NC}"
wait
