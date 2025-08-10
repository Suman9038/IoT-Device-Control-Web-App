# Multi-stage build for React + FastAPI IoT Application

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Copy package files first (for better caching)
COPY Frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY Frontend/ ./

# Build the frontend
RUN npm run build

# Stage 2: Setup Python backend with Poetry
FROM python:3.12-slim AS backend

# Set environment variables for Python
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV POETRY_NO_INTERACTION=1
ENV POETRY_VENV_IN_PROJECT=1
ENV POETRY_CACHE_DIR=/tmp/poetry_cache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry

# Set work directory
WORKDIR /app

# Copy Poetry configuration files
COPY pyproject.toml ./

# Install Python dependencies
RUN poetry install --only=main && rm -rf $POETRY_CACHE_DIR

# Copy backend source code
COPY *.py ./
COPY .env ./

# Copy built frontend from previous stage
COPY --from=frontend-build /app/frontend/dist ./static

# Create directory for static files
RUN mkdir -p static

# Expose the port FastAPI will run on
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Command to run the application
CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
