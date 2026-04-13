# Multiplayer Game Server Deployment Guide

## Quick Start

### Option 1: Windows (Recommended)
```bash
deploy-game-server.bat
```

### Option 2: Linux/Mac
```bash
chmod +x deploy-game-server.sh
./deploy-game-server.sh
```

## Manual Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### 3. Start Game Server
```bash
pm2 start game-server.js --name "game-server"
```

### 4. Save PM2 Configuration
```bash
pm2 save
pm2 startup
```

## Server Management Commands

### Check Status
```bash
pm2 status
```

### View Logs
```bash
pm2 logs game-server
```

### Stop Server
```bash
pm2 stop game-server
```

### Restart Server
```bash
pm2 restart game-server
```

## Requirements

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **Port 3001** must be open
- **HTTPS** support for production

## Access

- **Game Server**: `http://localhost:3001`
- **Multiplayer Game**: `https://bloghenry.edgeone.app/multiplayer/`

## Troubleshooting

### Port Already in Use
```bash
pm2 stop game-server
pm2 start game-server.js --name "game-server" --port 3002
```

### Check Logs
```bash
pm2 logs game-server --lines 50
```

### Restart All Services
```bash
pm2 restart all
```
