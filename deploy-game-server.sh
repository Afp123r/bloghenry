#!/bin/bash

# Multiplayer Game Server Deployment Script
# This script automatically deploys and runs the game server

echo "🎮 Starting Multiplayer Game Server Deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if PM2 is installed, install if not
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 for process management..."
    npm install -g pm2
fi

# Stop existing game server if running
echo "🛑 Stopping existing game server..."
pm2 stop game-server 2>/dev/null || true
pm2 delete game-server 2>/dev/null || true

# Start the game server with PM2
echo "🚀 Starting game server..."
pm2 start game-server.js --name "game-server" --log-date-format "YYYY-MM-DD HH:mm:ss Z"

# Save PM2 configuration
pm2 save
pm2 startup

echo "✅ Game server is now running!"
echo ""
echo "📊 Server Status:"
pm2 status
echo ""
echo "🌐 Server is running on: http://localhost:3001"
echo "📝 Logs: pm2 logs game-server"
echo "🛑 Stop server: pm2 stop game-server"
echo "🔄 Restart server: pm2 restart game-server"
echo ""
echo "🎯 Your multiplayer game is now available at:"
echo "https://bloghenry.edgeone.app/multiplayer/"
