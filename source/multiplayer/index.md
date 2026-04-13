---
title: Multiplayer Game Server
date: 2025/4/13 19:30:00
---

{% raw %}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multiplayer Tic-Tac-Toe</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        #multiplayer-game {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1, h2, h3 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 20px;
        }
        #player-info {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        #player-info input {
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            min-width: 200px;
        }
        button {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s ease;
        }
        button:hover {
            background: #2980b9;
        }
        button:disabled {
            background: #bdc3c7;
            cursor: not-allowed;
        }
        #room-input {
            text-align: center;
            margin: 20px 0;
        }
        #room-input input {
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            margin-right: 10px;
        }
        #current-room {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
        }
        .player-item {
            background: white;
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .player-symbol {
            font-weight: bold;
            font-size: 18px;
            padding: 5px 10px;
            border-radius: 3px;
        }
        .player-x {
            color: #e74c3c;
            background: #ffe6e6;
        }
        .player-o {
            color: #3498db;
            background: #e6f3ff;
        }
        #available-rooms {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
        }
        .room-item {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid #ddd;
        }
        .room-info {
            flex: 1;
        }
        .room-code {
            font-weight: bold;
            color: #2c3e50;
        }
        .room-status {
            font-size: 14px;
            color: #7f8c8d;
        }
        #game-board {
            display: grid;
            grid-template-columns: repeat(3, 120px);
            gap: 10px;
            margin: 20px auto;
            background: #34495e;
            padding: 10px;
            border-radius: 10px;
            width: fit-content;
        }
        .cell {
            width: 120px;
            height: 120px;
            background: white;
            border: none;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }
        .cell:hover:not(.disabled) {
            background: #f8f9fa;
            transform: scale(1.05);
        }
        .cell.disabled {
            cursor: not-allowed;
            opacity: 0.8;
        }
        .cell.x {
            color: #e74c3c;
        }
        .cell.o {
            color: #3498db;
        }
        .cell.winner {
            background: #f1c40f;
            animation: pulse 0.5s ease-in-out infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        #game-status {
            margin: 20px 0;
        }
        #status-message {
            font-size: 1.2em;
            font-weight: bold;
            color: #2c3e50;
            margin: 10px 0;
        }
        #turn-indicator {
            font-size: 1em;
            color: #7f8c8d;
        }
        #game-controls {
            margin-top: 20px;
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        #chat-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            max-height: 300px;
            display: flex;
            flex-direction: column;
        }
        #chat-messages {
            flex: 1;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            margin-bottom: 10px;
            background: white;
            min-height: 200px;
        }
        .chat-message {
            margin-bottom: 10px;
            padding: 8px;
            border-radius: 5px;
            background: #e9ecef;
        }
        .chat-player {
            font-weight: bold;
            color: #2c3e50;
        }
        .chat-text {
            margin-top: 5px;
        }
        .chat-time {
            font-size: 12px;
            color: #6c757d;
            float: right;
        }
        #chat-input {
            display: flex;
            gap: 10px;
        }
        #chat-input input {
            flex: 1;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }
        #stats-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .modal-content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 400px;
            width: 90%;
            text-align: center;
        }
        .modal-content h3 {
            margin-top: 0;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
        }
        .stat-item {
            text-align: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }
        .stat-label {
            font-size: 12px;
            color: #6c757d;
            margin-top: 5px;
        }
        .waiting-indicator {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-left: 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
            #game-board {
                grid-template-columns: repeat(3, 100px);
            }
            .cell {
                width: 100px;
                height: 100px;
                font-size: 2.5em;
            }
            #player-info {
                flex-direction: column;
                align-items: center;
            }
            #player-info input {
                width: 100%;
                max-width: 300px;
            }
        }
    </style>
</head>
<body>
    <div id="multiplayer-game">
        <div id="lobby-section">
            <h1>Multiplayer Tic-Tac-Toe</h1>
            <div id="player-info">
                <input type="text" id="player-name" placeholder="Enter your name" maxlength="20">
                <button id="join-random">Join Random Game</button>
                <button id="create-room">Create Room</button>
            </div>
            
            <div id="room-input" style="display: none;">
                <input type="text" id="room-code" placeholder="Enter room code">
                <button id="join-room">Join Room</button>
                <button id="cancel-join">Cancel</button>
            </div>
            
            <div id="current-room" style="display: none;">
                <h3>Room: <span id="room-id"></span></h3>
                <div id="players-list"></div>
                <button id="leave-room">Leave Room</button>
            </div>
            
            <div id="available-rooms">
                <h3>Available Rooms</h3>
                <div id="rooms-list"></div>
            </div>
        </div>

        <div id="game-section" style="display: none;">
            <div id="game-header">
                <h2>Multiplayer Tic-Tac-Toe</h2>
                <div id="game-status">
                    <p id="status-message">Waiting for players...</p>
                    <p id="turn-indicator"></p>
                </div>
            </div>
            
            <div id="game-board">
                <div class="cell" data-index="0"></div>
                <div class="cell" data-index="1"></div>
                <div class="cell" data-index="2"></div>
                <div class="cell" data-index="3"></div>
                <div class="cell" data-index="4"></div>
                <div class="cell" data-index="5"></div>
                <div class="cell" data-index="6"></div>
                <div class="cell" data-index="7"></div>
                <div class="cell" data-index="8"></div>
            </div>
            
            <div id="game-controls">
                <button id="reset-game">New Game</button>
                <button id="back-to-lobby">Back to Lobby</button>
                <button id="show-stats">Show Stats</button>
            </div>
            
            <div id="chat-section">
                <h3>Chat</h3>
                <div id="chat-messages"></div>
                <div id="chat-input">
                    <input type="text" id="message-input" placeholder="Type a message..." maxlength="100">
                    <button id="send-message">Send</button>
                </div>
            </div>
            
            <div id="stats-modal" style="display: none;">
                <div class="modal-content">
                    <h3>Your Statistics</h3>
                    <div id="stats-display"></div>
                    <button id="close-stats">Close</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        class GitHubMultiplayerGame {
            constructor() {
                this.currentRoom = null;
                this.playerName = '';
                this.playerSymbol = null;
                this.gameState = null;
                this.stats = this.loadStats();
                this.lastSync = Date.now();
                
                this.initializeElements();
                this.bindEvents();
                this.loadAvailableRooms();
                this.startPolling();
            }

            initializeElements() {
                // Lobby elements
                this.playerNameInput = document.getElementById('player-name');
                this.joinRandomBtn = document.getElementById('join-random');
                this.createRoomBtn = document.getElementById('create-room');
                this.roomInputSection = document.getElementById('room-input');
                this.roomCodeInput = document.getElementById('room-code');
                this.joinRoomBtn = document.getElementById('join-room');
                this.cancelJoinBtn = document.getElementById('cancel-join');
                this.currentRoomSection = document.getElementById('current-room');
                this.roomIdDisplay = document.getElementById('room-id');
                this.playersList = document.getElementById('players-list');
                this.leaveRoomBtn = document.getElementById('leave-room');
                this.availableRoomsSection = document.getElementById('available-rooms');
                this.roomsList = document.getElementById('rooms-list');
                
                // Game elements
                this.lobbySection = document.getElementById('lobby-section');
                this.gameSection = document.getElementById('game-section');
                this.statusMessage = document.getElementById('status-message');
                this.turnIndicator = document.getElementById('turn-indicator');
                this.cells = document.querySelectorAll('.cell');
                this.resetGameBtn = document.getElementById('reset-game');
                this.backToLobbyBtn = document.getElementById('back-to-lobby');
                
                // New elements
                this.showStatsBtn = document.getElementById('show-stats');
                this.statsModal = document.getElementById('stats-modal');
                this.statsDisplay = document.getElementById('stats-display');
                this.closeStatsBtn = document.getElementById('close-stats');
                this.chatMessages = document.getElementById('chat-messages');
                this.messageInput = document.getElementById('message-input');
                this.sendMessageBtn = document.getElementById('send-message');
            }

            bindEvents() {
                // Lobby events
                this.joinRandomBtn.addEventListener('click', () => this.joinRandomGame());
                this.createRoomBtn.addEventListener('click', () => this.showRoomInput());
                this.joinRoomBtn.addEventListener('click', () => this.joinSpecificRoom());
                this.cancelJoinBtn.addEventListener('click', () => this.hideRoomInput());
                this.leaveRoomBtn.addEventListener('click', () => this.leaveRoom());
                
                // Game events
                this.cells.forEach(cell => {
                    cell.addEventListener('click', (e) => this.handleCellClick(e));
                });
                this.resetGameBtn.addEventListener('click', () => this.resetGame());
                this.backToLobbyBtn.addEventListener('click', () => this.backToLobby());
                
                // New feature events
                this.showStatsBtn.addEventListener('click', () => this.showStats());
                this.closeStatsBtn.addEventListener('click', () => this.hideStats());
                this.sendMessageBtn.addEventListener('click', () => this.sendMessage());
                this.messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.sendMessage();
                    }
                });
            }

            startPolling() {
                // Poll for room updates every 3 seconds
                setInterval(() => {
                    if (this.currentRoom) {
                        this.syncRoom();
                    } else {
                        this.loadAvailableRooms();
                    }
                }, 3000);
            }

            async syncRoom() {
                try {
                    const response = await this.fetchGitHubData();
                    const room = response.rooms.find(r => r.roomId === this.currentRoom);
                    if (room && JSON.stringify(room) !== JSON.stringify(this.gameState)) {
                        this.gameState = room;
                        this.updateGameState();
                    }
                } catch (error) {
                    console.error('Sync error:', error);
                }
            }

            async fetchGitHubData() {
                // Use localStorage as fallback for GitHub API issues
                const localData = localStorage.getItem('multiplayerRooms');
                if (localData) {
                    const data = JSON.parse(localData);
                    // Only use local data if it's recent (within 1 minute)
                    if (Date.now() - data.lastUpdate < 60000) {
                        return data;
                    }
                }
                
                // Try GitHub API
                try {
                    const url = `https://api.github.com/repos/Afp123r/bloghenry/contents/multiplayer-rooms.json`;
                    const response = await fetch(url, {
                        headers: {
                            'Accept': 'application/vnd.github.v3+json',
                        }
                    });
                    
                    if (!response.ok) {
                        // If file doesn't exist, create initial data
                        return { rooms: [], lastUpdate: Date.now() };
                    }
                    
                    const data = await response.json();
                    const content = atob(data.content);
                    return JSON.parse(content);
                } catch (error) {
                    console.error('GitHub API error:', error);
                    // Fallback to empty data
                    return { rooms: [], lastUpdate: Date.now() };
                }
            }

            async saveGitHubData(data) {
                try {
                    // Save to localStorage as backup
                    localStorage.setItem('multiplayerRooms', JSON.stringify(data));
                    
                    // Try GitHub API (will fail in browser due to CORS, but localStorage works)
                    const url = `https://api.github.com/repos/Afp123r/bloghenry/contents/multiplayer-rooms.json`;
                    const content = btoa(JSON.stringify(data));
                    
                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `token ${this.getGitHubToken()}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: `Update multiplayer rooms - ${new Date().toISOString()}`,
                            content: content
                        })
                    });
                    
                    if (!response.ok) {
                        console.log('GitHub save failed, using localStorage only');
                    }
                } catch (error) {
                    console.error('Save error:', error);
                    // Fallback to localStorage
                    localStorage.setItem('multiplayerRooms', JSON.stringify(data));
                }
            }

            getGitHubToken() {
                // For demo purposes - localStorage fallback
                return localStorage.getItem('github_token') || 'demo_token';
            }

            async joinRandomGame() {
                const name = this.playerNameInput.value.trim();
                if (!name) {
                    alert('Please enter your name');
                    return;
                }
                
                this.playerName = name;
                
                try {
                    const data = await this.fetchGitHubData();
                    const availableRoom = data.rooms.find(room => room.playerCount < 2);
                    
                    if (availableRoom) {
                        await this.joinRoom(availableRoom.roomId);
                    } else {
                        await this.createRoom();
                    }
                } catch (error) {
                    console.error('Join random error:', error);
                    alert('Failed to join game. Please try again.');
                }
            }

            showRoomInput() {
                this.roomInputSection.style.display = 'block';
            }

            hideRoomInput() {
                this.roomInputSection.style.display = 'none';
                this.roomCodeInput.value = '';
            }

            async joinSpecificRoom() {
                const name = this.playerNameInput.value.trim();
                const roomCode = this.roomCodeInput.value.trim();
                
                if (!name) {
                    alert('Please enter your name');
                    return;
                }
                
                if (!roomCode) {
                    alert('Please enter a room code');
                    return;
                }
                
                this.playerName = name;
                await this.joinRoom(roomCode);
                this.hideRoomInput();
            }

            async createRoom() {
                const name = this.playerNameInput.value.trim();
                if (!name) {
                    alert('Please enter your name');
                    return;
                }
                
                this.playerName = name;
                const roomId = this.generateRoomCode();
                
                try {
                    const data = await this.fetchGitHubData();
                    
                    const newRoom = {
                        roomId: roomId,
                        playerCount: 1,
                        gameActive: false,
                        players: [{
                            id: 'player1',
                            name: name,
                            symbol: 'X'
                        }],
                        board: ['', '', '', '', '', '', '', '', '', ''],
                        currentPlayer: 'X',
                        winner: null,
                        startTime: Date.now(),
                        lastUpdate: Date.now(),
                        messages: []
                    };
                    
                    data.rooms.push(newRoom);
                    data.lastUpdate = Date.now();
                    
                    await this.saveGitHubData(data);
                    await this.joinRoom(roomId);
                } catch (error) {
                    console.error('Create room error:', error);
                    alert('Failed to create room. Please try again.');
                }
            }

            async joinRoom(roomId) {
                try {
                    const data = await this.fetchGitHubData();
                    const room = data.rooms.find(r => r.roomId === roomId);
                    
                    if (!room) {
                        alert('Room not found');
                        return;
                    }
                    
                    if (room.playerCount >= 2) {
                        alert('Room is full');
                        return;
                    }
                    
                    this.currentRoom = roomId;
                    this.playerSymbol = room.playerCount === 0 ? 'X' : 'O';
                    
                    // Add player to room
                    room.playerCount++;
                    room.players.push({
                        id: this.playerSymbol === 'X' ? 'player2' : 'player1',
                        name: this.playerName,
                        symbol: this.playerSymbol
                    });
                    room.lastUpdate = Date.now();
                    
                    await this.saveGitHubData(data);
                    this.showCurrentRoom();
                    this.gameState = room;
                    this.updateGameState();
                    
                    // Start game if room is full
                    if (room.playerCount === 2) {
                        room.gameActive = true;
                        room.startTime = Date.now();
                        this.showGame();
                        await this.saveGitHubData(data);
                    }
                } catch (error) {
                    console.error('Join room error:', error);
                    alert('Failed to join room. Please try again.');
                }
            }

            showCurrentRoom() {
                this.roomIdDisplay.textContent = this.currentRoom;
                this.currentRoomSection.style.display = 'block';
                this.availableRoomsSection.style.display = 'none';
            }

            async leaveRoom() {
                if (this.currentRoom) {
                    try {
                        const data = await this.fetchGitHubData();
                        const room = data.rooms.find(r => r.roomId === this.currentRoom);
                        
                        if (room) {
                            // Remove player from room
                            room.playerCount--;
                            room.players = room.players.filter(p => p.name !== this.playerName);
                            room.lastUpdate = Date.now();
                            
                            if (room.playerCount === 0) {
                                // Remove empty room
                                data.rooms = data.rooms.filter(r => r.roomId !== this.currentRoom);
                            }
                            
                            await this.saveGitHubData(data);
                        }
                    } catch (error) {
                        console.error('Leave room error:', error);
                    }
                }
                
                this.currentRoom = null;
                this.currentRoomSection.style.display = 'none';
                this.availableRoomsSection.style.display = 'block';
                this.gameSection.style.display = 'none';
                this.lobbySection.style.display = 'block';
                this.loadAvailableRooms();
            }

            async loadAvailableRooms() {
                try {
                    const data = await this.fetchGitHubData();
                    
                    // Filter out old rooms (older than 10 minutes)
                    const now = Date.now();
                    data.rooms = data.rooms.filter(room => 
                        now - room.lastUpdate < 600000 // 10 minutes
                    );
                    
                    this.displayAvailableRooms(data.rooms);
                } catch (error) {
                    console.error('Load rooms error:', error);
                    this.roomsList.innerHTML = '<p>Failed to load rooms</p>';
                }
            }

            displayAvailableRooms(rooms) {
                this.roomsList.innerHTML = '';
                
                if (rooms.length === 0) {
                    this.roomsList.innerHTML = '<p>No available rooms</p>';
                    return;
                }
                
                rooms.forEach(room => {
                    const roomElement = document.createElement('div');
                    roomElement.className = 'room-item';
                    
                    const playerCount = room.playerCount;
                    const status = room.gameActive ? 'Game in progress' : 'Waiting for players';
                    
                    roomElement.innerHTML = `
                        <div class="room-info">
                            <div class="room-code">${room.roomId}</div>
                            <div class="room-status">${playerCount}/2 players - ${status}</div>
                        </div>
                        <button onclick="game.joinRoomFromList('${room.roomId}')" 
                                ${playerCount >= 2 ? 'disabled' : ''}>
                            ${playerCount >= 2 ? 'Full' : 'Join'}
                        </button>
                    `;
                    
                    this.roomsList.appendChild(roomElement);
                });
            }

            async joinRoomFromList(roomId) {
                const name = this.playerNameInput.value.trim();
                if (!name) {
                    alert('Please enter your name');
                    return;
                }
                
                this.playerName = name;
                await this.joinRoom(roomId);
            }

            updateGameState() {
                if (!this.gameState) return;
                
                // Update players list
                this.updatePlayersList();
                
                // Show game if active
                if (this.gameState.gameActive || this.gameState.winner) {
                    this.showGame();
                }
                
                // Update game board
                this.updateGameBoard();
                
                // Update status
                this.updateStatus();
                
                // Load chat messages
                this.loadChatMessages();
            }

            updatePlayersList() {
                this.playersList.innerHTML = '';
                
                this.gameState.players.forEach(player => {
                    const playerElement = document.createElement('div');
                    playerElement.className = 'player-item';
                    
                    const isCurrentPlayer = player.symbol === this.playerSymbol;
                    
                    playerElement.innerHTML = `
                        <span>${player.name} ${isCurrentPlayer ? '(You)' : ''}</span>
                        <span class="player-symbol player-${player.symbol.toLowerCase()}">${player.symbol}</span>
                    `;
                    
                    this.playersList.appendChild(playerElement);
                });
            }

            showGame() {
                this.lobbySection.style.display = 'none';
                this.gameSection.style.display = 'block';
            }

            updateGameBoard() {
                this.cells.forEach((cell, index) => {
                    const value = this.gameState.board[index];
                    cell.textContent = value;
                    cell.className = 'cell';
                    
                    if (value) {
                        cell.classList.add(value.toLowerCase());
                        cell.classList.add('disabled');
                    }
                    
                    if (this.gameState.winningLine && this.gameState.winningLine.includes(index)) {
                        cell.classList.add('winner');
                    }
                });
            }

            updateStatus() {
                if (!this.gameState || !this.gameState.players) return;
                
                if (this.gameState.winner) {
                    if (this.gameState.winner === 'draw') {
                        this.statusMessage.textContent = "It's a draw! 🤝";
                    } else {
                        const winner = this.gameState.players.find(p => p.symbol === this.gameState.winner);
                        if (winner) {
                            this.statusMessage.textContent = `${winner.name} wins! 🎉`;
                            this.updateStats(winner.symbol === this.playerSymbol ? 'win' : 'lose');
                        }
                    }
                    this.turnIndicator.textContent = '';
                } else if (this.gameState.gameActive) {
                    const currentPlayer = this.gameState.players.find(p => p.symbol === this.gameState.currentPlayer);
                    if (currentPlayer) {
                        this.statusMessage.textContent = 'Game in progress';
                        this.turnIndicator.textContent = `${currentPlayer.name}'s turn (${this.gameState.currentPlayer})`;
                    }
                } else {
                    this.statusMessage.textContent = 'Waiting for players...';
                    this.turnIndicator.textContent = `${this.gameState.players.length}/2 players joined`;
                }
            }

            handleCellClick(e) {
                const index = parseInt(e.target.getAttribute('data-index'));
                
                if (!this.gameState || !this.gameState.gameActive) return;
                if (this.gameState.board[index] !== '') return;
                
                const currentPlayer = this.gameState.players.find(p => p.symbol === this.gameState.currentPlayer);
                if (!currentPlayer || currentPlayer.symbol !== this.playerSymbol) return;
                
                this.makeMove(index);
            }

            async makeMove(position) {
                this.gameState.board[position] = this.gameState.currentPlayer;
                this.gameState.lastUpdate = Date.now();
                
                // Check for winner
                const winner = this.checkWinner();
                if (winner) {
                    this.gameState.winner = winner;
                    this.gameState.gameActive = false;
                } else {
                    // Switch player
                    this.gameState.currentPlayer = this.gameState.currentPlayer === 'X' ? 'O' : 'X';
                }
                
                try {
                    const data = await this.fetchGitHubData();
                    const room = data.rooms.find(r => r.roomId === this.currentRoom);
                    if (room) {
                        Object.assign(room, this.gameState);
                        await this.saveGitHubData(data);
                    }
                } catch (error) {
                    console.error('Save move error:', error);
                }
                
                this.updateGameState();
            }

            checkWinner() {
                const board = this.gameState.board;
                const lines = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
                    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
                    [0, 4, 8], [2, 4, 6] // Diagonals
                ];
                
                for (const line of lines) {
                    const [a, b, c] = line;
                    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
                        this.gameState.winningLine = line;
                        return board[a];
                    }
                }
                
                // Check for draw
                if (board.every(cell => cell !== '')) {
                    return 'draw';
                }
                
                return null;
            }

            async resetGame() {
                if (!this.gameState) return;
                
                this.gameState.board = ['', '', '', '', '', '', '', '', '', ''];
                this.gameState.currentPlayer = 'X';
                this.gameState.winner = null;
                this.gameState.winningLine = null;
                this.gameState.gameActive = true;
                this.gameState.startTime = Date.now();
                this.gameState.lastUpdate = Date.now();
                
                try {
                    const data = await this.fetchGitHubData();
                    const room = data.rooms.find(r => r.roomId === this.currentRoom);
                    if (room) {
                        Object.assign(room, this.gameState);
                        await this.saveGitHubData(data);
                    }
                } catch (error) {
                    console.error('Reset game error:', error);
                }
                
                this.updateGameState();
            }

            backToLobby() {
                this.gameSection.style.display = 'none';
                this.lobbySection.style.display = 'block';
                this.chatMessages.innerHTML = '';
                this.loadAvailableRooms();
            }

            async sendMessage() {
                const message = this.messageInput.value.trim();
                if (!message) return;
                
                const messageData = {
                    player: this.playerName,
                    message: message,
                    timestamp: Date.now()
                };
                
                try {
                    // Add message to room
                    if (this.gameState) {
                        if (!this.gameState.messages) {
                            this.gameState.messages = [];
                        }
                        this.gameState.messages.push(messageData);
                        this.gameState.lastUpdate = Date.now();
                        
                        const data = await this.fetchGitHubData();
                        const room = data.rooms.find(r => r.roomId === this.currentRoom);
                        if (room) {
                            Object.assign(room, this.gameState);
                            await this.saveGitHubData(data);
                        }
                        
                        this.displayChatMessage(messageData);
                    }
                } catch (error) {
                    console.error('Send message error:', error);
                }
                
                this.messageInput.value = '';
            }

            loadChatMessages() {
                if (!this.gameState || !this.gameState.messages) return;
                
                this.chatMessages.innerHTML = '';
                this.gameState.messages.forEach(message => {
                    this.displayChatMessage(message);
                });
            }

            displayChatMessage(messageData) {
                const messageElement = document.createElement('div');
                messageElement.className = 'chat-message';
                
                const time = new Date(messageData.timestamp).toLocaleTimeString();
                messageElement.innerHTML = `
                    <div class="chat-player">${messageData.player}:</div>
                    <div class="chat-text">${messageData.message}</div>
                    <div class="chat-time">${time}</div>
                `;
                
                this.chatMessages.appendChild(messageElement);
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }

            showStats() {
                this.displayStats(this.stats);
                this.statsModal.style.display = 'flex';
            }

            displayStats(stats) {
                if (!stats) return;
                
                this.statsDisplay.innerHTML = `
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${stats.gamesPlayed || 0}</div>
                            <div class="stat-label">Games Played</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${stats.wins || 0}</div>
                            <div class="stat-label">Wins</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${stats.losses || 0}</div>
                            <div class="stat-label">Losses</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${stats.draws || 0}</div>
                            <div class="stat-label">Draws</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${Math.round((stats.wins || 0) / Math.max(stats.gamesPlayed || 1, 1) * 100)}%</div>
                            <div class="stat-label">Win Rate</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${Math.round((stats.avgGameTime || 0) / 1000)}s</div>
                            <div class="stat-label">Avg Game Time</div>
                        </div>
                    </div>
                `;
                
                this.statsModal.style.display = 'flex';
            }

            hideStats() {
                this.statsModal.style.display = 'none';
            }

            updateStats(result) {
                if (result === 'win') {
                    this.stats.wins++;
                } else if (result === 'lose') {
                    this.stats.losses++;
                } else if (result === 'draw') {
                    this.stats.draws++;
                }
                
                this.stats.gamesPlayed++;
                
                const gameTime = Date.now() - this.gameState.startTime;
                this.stats.avgGameTime = Math.round((this.stats.avgGameTime * (this.stats.gamesPlayed - 1) + gameTime) / this.stats.gamesPlayed);
                
                this.saveStats();
            }

            generateRoomCode() {
                return 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }

            saveStats() {
                localStorage.setItem('multiplayerStats', JSON.stringify(this.stats));
            }

            loadStats() {
                const saved = localStorage.getItem('multiplayerStats');
                return saved ? JSON.parse(saved) : {
                    gamesPlayed: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    avgGameTime: 0
                };
            }
        }

        // Initialize game when page loads
        let game;
        document.addEventListener('DOMContentLoaded', () => {
            game = new GitHubMultiplayerGame();
        });
    </script>
</body>
</html>
{% endraw %}
