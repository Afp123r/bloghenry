---
title: Game Server
date: 2025/4/13 18:30:00
---

<div id="game-container">
    <h1>Tic-Tac-Toe</h1>
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
    <div id="game-status">
        <p id="status-message">Player X's turn</p>
        <button id="reset-btn">New Game</button>
    </div>
</div>

<style>
    #game-container {
        max-width: 400px;
        margin: 0 auto;
        text-align: center;
        padding: 20px;
    }

    #game-board {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin: 20px 0;
        background: #f0f0f0;
        padding: 10px;
        border-radius: 10px;
    }

    .cell {
        width: 100px;
        height: 100px;
        background: white;
        border: 2px solid #333;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2em;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .cell:hover {
        background: #f8f8f8;
        transform: scale(1.05);
    }

    .cell.x {
        color: #e74c3c;
    }

    .cell.o {
        color: #3498db;
    }

    #status-message {
        font-size: 1.2em;
        margin: 10px 0;
        font-weight: bold;
    }

    #reset-btn {
        background: #2ecc71;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1em;
        transition: background 0.3s ease;
    }

    #reset-btn:hover {
        background: #27ae60;
    }

    .winner {
        animation: pulse 0.5s ease-in-out infinite;
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
</style>

<script>
    let currentPlayer = 'X';
    let gameBoard = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;

    const cells = document.querySelectorAll('.cell');
    const statusMessage = document.getElementById('status-message');
    const resetBtn = document.getElementById('reset-btn');

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function handleCellClick(e) {
        const cell = e.target;
        const index = parseInt(cell.getAttribute('data-index'));

        if (gameBoard[index] !== '' || !gameActive) {
            return;
        }

        gameBoard[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());

        checkResult();
    }

    function checkResult() {
        let roundWon = false;
        
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameBoard[a] === '' || gameBoard[b] === '' || gameBoard[c] === '') {
                continue;
            }
            if (gameBoard[a] === gameBoard[b] && gameBoard[b] === gameBoard[c]) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusMessage.textContent = `Player ${currentPlayer} wins! 🎉`;
            gameActive = false;
            highlightWinningCells();
            return;
        }

        if (!gameBoard.includes('')) {
            statusMessage.textContent = "It's a draw! 🤝";
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusMessage.textContent = `Player ${currentPlayer}'s turn`;
    }

    function highlightWinningCells() {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameBoard[a] === gameBoard[b] && gameBoard[b] === gameBoard[c] && gameBoard[a] !== '') {
                cells[a].classList.add('winner');
                cells[b].classList.add('winner');
                cells[c].classList.add('winner');
                break;
            }
        }
    }

    function resetGame() {
        currentPlayer = 'X';
        gameBoard = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        statusMessage.textContent = `Player ${currentPlayer}'s turn`;
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winner');
        });
    }

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', resetGame);
</script>
