FROM node:20-slim

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy project files
COPY . .

# Install Node dependencies
# Root
RUN npm install
# Client
RUN cd client && npm install
# Server
RUN cd server && npm install

# Build frontend
RUN cd client && npm run build

# Setup Python environment
WORKDIR /app/ai-api-server
RUN python3 -m venv venv
ENV PATH="/app/ai-api-server/venv/bin:$PATH"
RUN pip install -r requirements.txt

# Go back to root
WORKDIR /app

# Expose port (Node server)
EXPOSE 3001

# Make start script executable
RUN chmod +x start.sh

CMD ["./start.sh"]
