#!/bin/bash

# Start Python server in background
echo "Starting Python AI Server..."
cd ai-api-server
# Activate venv if strictly needed, but adding to PATH in Dockerfile is usually enough.
# We will rely on PATH being set in Dockerfile.
uvicorn main:app --host 0.0.0.0 --port 8000 &

# Wait a bit for Python server to start (optional but good practice)
sleep 5

# Start Node server
echo "Starting Node Server..."
cd ../server
npm start
