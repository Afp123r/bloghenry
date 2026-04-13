const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// Game state storage
const games = new Map();
const waitingPlayers = new Map();

// Game class
class TicTacToeGame {
    constructor(roomId) {
        this.roomId = roomId;
        this.players = [];
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.winner = null;
        this.winningLine = null;
        this.gameHistory = [];
        this.startTime = null;
        this.moveCount = 0;
    }

    addPlayer(playerId, playerName) {
        if (this.players.length >= 2) return false;
        
        const symbol = this.players.length === 0 ? 'X' : 'O';
        this.players.push({
            id: playerId,
            name: playerName,
            symbol: symbol
        });
        
        if (this.players.length === 2) {
            this.gameActive = true;
        }
        
        return true;
    }

    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
        if (this.players.length < 2) {
            this.gameActive = false;
        }
    }

    makeMove(position, playerId) {
        if (!this.gameActive || this.board[position] !== '') return false;
        
        const player = this.players.find(p => p.id === playerId);
        if (!player || player.symbol !== this.currentPlayer) return false;
        
        // Record move in history
        this.gameHistory.push({
            player: player.symbol,
            position: position,
            timestamp: Date.now()
        });
        
        this.board[position] = this.currentPlayer;
        this.moveCount++;
        
        if (this.checkWinner()) {
            this.gameActive = false;
            this.winner = player;
            this.recordGameEnd();
        } else if (this.board.every(cell => cell !== '')) {
            this.gameActive = false;
            this.winner = 'draw';
            this.recordGameEnd();
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
        
        return true;
    }

    recordGameEnd() {
        const duration = this.startTime ? Date.now() - this.startTime : 0;
        const result = this.winner === 'draw' ? 'draw' : 'win';
        
        // Update player statistics
        this.players.forEach(player => {
            const isWinner = this.winner !== 'draw' && this.winner.id === player.id;
            player.stats = player.stats || {
                gamesPlayed: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                totalMoves: 0,
                avgGameTime: 0
            };
            
            player.stats.gamesPlayed++;
            player.stats.totalMoves += Math.floor(this.moveCount / 2);
            
            if (result === 'draw') {
                player.stats.draws++;
            } else if (isWinner) {
                player.stats.wins++;
            } else {
                player.stats.losses++;
            }
            
            if (duration > 0) {
                player.stats.avgGameTime = (player.stats.avgGameTime + duration) / 2;
            }
        });
    }

    checkWinner() {
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winningLine = condition;
                return true;
            }
        }
        
        return false;
    }

    reset() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = this.players.length === 2;
        this.winner = null;
        this.winningLine = null;
        this.gameHistory = [];
        this.startTime = Date.now();
        this.moveCount = 0;
    }

    getState() {
        return {
            roomId: this.roomId,
            players: this.players,
            board: this.board,
            currentPlayer: this.currentPlayer,
            gameActive: this.gameActive,
            winner: this.winner,
            winningLine: this.winningLine
        };
    }
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Create or join a game room
    socket.on('joinGame', (data) => {
        const { playerName, roomId } = data;
        let game;

        if (roomId && games.has(roomId)) {
            game = games.get(roomId);
        } else {
            const newRoomId = roomId || `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            game = new TicTacToeGame(newRoomId);
            games.set(newRoomId, game);
        }

        if (game.addPlayer(socket.id, playerName)) {
            socket.join(game.roomId);
            socket.gameRoom = game.roomId;
            
            // Send game state to all players in the room
            io.to(game.roomId).emit('gameState', game.getState());
            
            // Notify room assignment
            socket.emit('roomJoined', { roomId: game.roomId });
            
            console.log(`${playerName} joined room ${game.roomId}`);
        } else {
            socket.emit('error', { message: 'Room is full' });
        }
    });

    // Chat system
    socket.on('sendMessage', (data) => {
        const { message } = data;
        const game = games.get(socket.gameRoom);
        
        if (game) {
            const player = game.players.find(p => p.id === socket.id);
            if (player) {
                const chatMessage = {
                    player: player.name,
                    message: message,
                    timestamp: Date.now()
                };
                io.to(socket.gameRoom).emit('chatMessage', chatMessage);
            }
        }
    });

    // Get player statistics
    socket.on('getStats', () => {
        const game = games.get(socket.gameRoom);
        if (game) {
            const player = game.players.find(p => p.id === socket.id);
            if (player && player.stats) {
                socket.emit('playerStats', player.stats);
            }
        }
    });

    // Handle player moves
    socket.on('makeMove', (data) => {
        const { position } = data;
        
        if (!socket.gameRoom || !games.has(socket.gameRoom)) {
            socket.emit('error', { message: 'Not in a game room' });
            return;
        }

        const game = games.get(socket.gameRoom);
        
        if (game.makeMove(position, socket.id)) {
            io.to(socket.gameRoom).emit('gameState', game.getState());
        } else {
            socket.emit('error', { message: 'Invalid move' });
        }
    });

    // Handle game reset
    socket.on('resetGame', () => {
        if (!socket.gameRoom || !games.has(socket.gameRoom)) return;
        
        const game = games.get(socket.gameRoom);
        game.reset();
        io.to(socket.gameRoom).emit('gameState', game.getState());
    });

    // Handle player disconnect
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        
        if (socket.gameRoom && games.has(socket.gameRoom)) {
            const game = games.get(socket.gameId);
            game.removePlayer(socket.id);
            
            if (game.players.length === 0) {
                games.delete(socket.gameRoom);
            } else {
                io.to(socket.gameRoom).emit('gameState', game.getState());
            }
        }
    });
});

// Serve multiplayer game HTML
app.get('/multiplayer-game', (req, res) => {
  res.send(`
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

    <script src="/socket.io/socket.io.js"></script>
    <script>
        class MultiplayerGame {
            constructor() {
                this.socket = null;
                this.currentRoom = null;
                this.playerName = '';
                this.playerSymbol = null;
                this.gameState = null;
                
                this.initializeElements();
                this.bindEvents();
                this.connectToServer();
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

            connectToServer() {
                this.socket = io();
                
                this.socket.on('connect', () => {
                    console.log('Connected to game server');
                    this.loadAvailableRooms();
                });

                this.socket.on('roomJoined', (data) => {
                    this.currentRoom = data.roomId;
                    this.showCurrentRoom();
                });

                this.socket.on('gameState', (state) => {
                    this.gameState = state;
                    this.updateGameState();
                });

                this.socket.on('chatMessage', (message) => {
                    this.displayChatMessage(message);
                });

                this.socket.on('playerStats', (stats) => {
                    this.displayStats(stats);
                });

                this.socket.on('error', (data) => {
                    alert(data.message);
                });

                this.socket.on('disconnect', () => {
                    alert('Disconnected from game server');
                    this.backToLobby();
                });
            }

            joinRandomGame() {
                const name = this.playerNameInput.value.trim();
                if (!name) {
                    alert('Please enter your name');
                    return;
                }
                
                this.playerName = name;
                this.socket.emit('joinGame', { playerName: name });
            }

            showRoomInput() {
                this.roomInputSection.style.display = 'block';
            }

            hideRoomInput() {
                this.roomInputSection.style.display = 'none';
                this.roomCodeInput.value = '';
            }

            joinSpecificRoom() {
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
                this.socket.emit('joinGame', { playerName: name, roomId: roomCode });
                this.hideRoomInput();
            }

            showCurrentRoom() {
                this.roomIdDisplay.textContent = this.currentRoom;
                this.currentRoomSection.style.display = 'block';
                this.availableRoomsSection.style.display = 'none';
            }

            leaveRoom() {
                if (this.socket) {
                    this.socket.disconnect();
                }
                this.currentRoom = null;
                this.currentRoomSection.style.display = 'none';
                this.availableRoomsSection.style.display = 'block';
                this.gameSection.style.display = 'none';
                this.lobbySection.style.display = 'block';
                this.connectToServer();
            }

            loadAvailableRooms() {
                fetch('/api/rooms')
                    .then(response => response.json())
                    .then(rooms => {
                        this.displayAvailableRooms(rooms);
                    })
                    .catch(error => {
                        console.error('Error loading rooms:', error);
                    });
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
                    
                    roomElement.innerHTML = \`
                        <div class="room-info">
                            <div class="room-code">\${room.roomId}</div>
                            <div class="room-status">\${playerCount}/2 players - \${status}</div>
                        </div>
                        <button onclick="game.joinRoomFromList('\${room.roomId}')" 
                                \${playerCount >= 2 ? 'disabled' : ''}>
                            \${playerCount >= 2 ? 'Full' : 'Join'}
                        </button>
                    \`;
                    
                    this.roomsList.appendChild(roomElement);
                });
            }

            joinRoomFromList(roomId) {
                const name = this.playerNameInput.value.trim();
                if (!name) {
                    alert('Please enter your name');
                    return;
                }
                
                this.playerName = name;
                this.socket.emit('joinGame', { playerName: name, roomId: roomId });
            }

            updateGameState() {
                if (!this.gameState) return;
                
                // Update players list
                this.updatePlayersList();
                
                // Check if game should be shown
                if (this.gameState.gameActive || this.gameState.winner) {
                    this.showGame();
                }
                
                // Update game board
                this.updateGameBoard();
                
                // Update status
                this.updateStatus();
            }

            updatePlayersList() {
                this.playersList.innerHTML = '';
                
                this.gameState.players.forEach(player => {
                    const playerElement = document.createElement('div');
                    playerElement.className = 'player-item';
                    
                    const isCurrentPlayer = player.id === this.socket.id;
                    this.playerSymbol = isCurrentPlayer ? player.symbol : this.playerSymbol;
                    
                    playerElement.innerHTML = \`
                        <span>\${player.name} \${isCurrentPlayer ? '(You)' : ''}</span>
                        <span class="player-symbol player-\${player.symbol.toLowerCase()}">\${player.symbol}</span>
                    \`;
                    
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
                    
                    // Highlight winning cells
                    if (this.gameState.winningLine && this.gameState.winningLine.includes(index)) {
                        cell.classList.add('winner');
                    }
                });
            }

            updateStatus() {
                if (this.gameState.winner) {
                    if (this.gameState.winner === 'draw') {
                        this.statusMessage.textContent = "It's a draw! 🤝";
                    } else {
                        const winner = this.gameState.players.find(p => p.id === this.gameState.winner.id);
                        this.statusMessage.textContent = \`\${winner.name} wins! 🎉\`;
                    }
                    this.turnIndicator.textContent = '';
                } else if (this.gameState.gameActive) {
                    const currentPlayer = this.gameState.players.find(p => p.symbol === this.gameState.currentPlayer);
                    this.statusMessage.textContent = 'Game in progress';
                    this.turnIndicator.textContent = \`\${currentPlayer.name}'s turn (\${this.gameState.currentPlayer})\`;
                } else {
                    this.statusMessage.textContent = 'Waiting for players...';
                    this.turnIndicator.textContent = \`\${this.gameState.players.length}/2 players joined\`;
                }
            }

            handleCellClick(e) {
                const index = parseInt(e.target.getAttribute('data-index'));
                
                if (!this.gameState || !this.gameState.gameActive) return;
                if (this.gameState.board[index] !== '') return;
                
                const currentPlayer = this.gameState.players.find(p => p.symbol === this.gameState.currentPlayer);
                if (!currentPlayer || currentPlayer.id !== this.socket.id) return;
                
                this.socket.emit('makeMove', { position: index });
            }

            resetGame() {
                if (this.socket) {
                    this.socket.emit('resetGame');
                }
            }

            backToLobby() {
                this.gameSection.style.display = 'none';
                this.lobbySection.style.display = 'block';
                this.chatMessages.innerHTML = '';
                this.loadAvailableRooms();
            }

            sendMessage() {
                const message = this.messageInput.value.trim();
                if (!message) return;
                
                this.socket.emit('sendMessage', { message });
                this.messageInput.value = '';
            }

            displayChatMessage(messageData) {
                const messageElement = document.createElement('div');
                messageElement.className = 'chat-message';
                
                const time = new Date(messageData.timestamp).toLocaleTimeString();
                messageElement.innerHTML = \`
                    <div class="chat-player">\${messageData.player}:</div>
                    <div class="chat-text">\${messageData.message}</div>
                    <div class="chat-time">\${time}</div>
                \`;
                
                this.chatMessages.appendChild(messageElement);
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }

            showStats() {
                this.socket.emit('getStats');
            }

            displayStats(stats) {
                if (!stats) return;
                
                this.statsDisplay.innerHTML = \`
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">\${stats.gamesPlayed || 0}</div>
                            <div class="stat-label">Games Played</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">\${stats.wins || 0}</div>
                            <div class="stat-label">Wins</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">\${stats.losses || 0}</div>
                            <div class="stat-label">Losses</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">\${stats.draws || 0}</div>
                            <div class="stat-label">Draws</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">\${Math.round((stats.wins || 0) / Math.max(stats.gamesPlayed || 1, 1) * 100)}%</div>
                            <div class="stat-label">Win Rate</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">\${Math.round(stats.avgGameTime / 1000)}s</div>
                            <div class="stat-label">Avg Game Time</div>
                        </div>
                    </div>
                \`;
                
                this.statsModal.style.display = 'flex';
            }

            hideStats() {
                this.statsModal.style.display = 'none';
            }
        }

        // Initialize game when page loads
        let game;
        document.addEventListener('DOMContentLoaded', () => {
            game = new MultiplayerGame();
            
            // Refresh rooms list periodically
            setInterval(() => {
                if (game && !game.currentRoom) {
                    game.loadAvailableRooms();
                }
            }, 5000);
        });
    </script>
</body>
</html>
  `);
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// API endpoint to get available rooms
app.get('/api/rooms', (req, res) => {
    console.log('API /api/rooms called');
    const rooms = Array.from(games.values()).map(game => ({
        roomId: game.roomId,
        playerCount: game.players.length,
        gameActive: game.gameActive
    }));
    console.log('Rooms data:', rooms);
    res.json(rooms);
});

// Start server
server.listen(PORT, () => {
    console.log(`Game server running on port ${PORT}`);
    console.log(`Available at: http://localhost:${PORT}`);
});
