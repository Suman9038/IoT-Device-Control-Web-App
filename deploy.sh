#!/bin/bash

echo " Starting IoT Control App Deployment..."

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Remove old images (optional)
echo "Cleaning up old images..."
docker system prune -f

# Build and start
echo "Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Health check
echo "Checking application health..."
if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    echo " Application is running successfully!"
    echo " Access your app at: http://localhost:8000"
    echo " API Documentation: http://localhost:8000/docs"
else
    echo " Application failed to start. Check logs:"
    docker-compose logs
fi

echo " Container Status:"
docker-compose ps
