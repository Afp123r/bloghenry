@echo off
REM Multiplayer Game Server Deployment Script for Windows
REM This script automatically deploys and runs the game server

echo 🎮 Starting Multiplayer Game Server Deployment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Check if PM2 is installed, install if not
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing PM2 for process management...
    npm install -g pm2
)

REM Stop existing game server if running
echo 🛑 Stopping existing game server...
pm2 stop game-server >nul 2>&1
pm2 delete game-server >nul 2>&1

REM Start game server with PM2
echo 🚀 Starting game server...
pm2 start game-server.js --name "game-server" --log-date-format "YYYY-MM-DD HH:mm:ss Z"

REM Save PM2 configuration
pm2 save
pm2 startup

echo ✅ Game server is now running!
echo.
echo 📊 Server Status:
pm2 status
echo.
echo 🌐 Server is running on: http://localhost:3001
echo 📝 Logs: pm2 logs game-server
echo 🛑 Stop server: pm2 stop game-server
echo 🔄 Restart server: pm2 restart game-server
echo.
echo 🎯 Your multiplayer game is now available at:
echo https://bloghenry.edgeone.app/multiplayer/
pause
