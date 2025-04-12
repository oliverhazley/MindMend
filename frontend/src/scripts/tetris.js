/*
  tetris.js
  - A basic Tetris placeholder with improved styling
  - You can replicate your React Tetris logic here (rotations, piece dropping, scoring, etc.)
*/

document.addEventListener("DOMContentLoaded", () => {
  console.log("tetris.js loaded: Tetris logic and UI setup.");

  let isRunning = false;
  let gameInterval = null;

  const boardEl = document.getElementById("tetrisBoard");
  const startBtn = document.getElementById("startTetrisBtn");
  const pauseBtn = document.getElementById("pauseTetrisBtn");

  // Initialize or reset the board
  function initGame() {
    if (boardEl) {
      boardEl.innerHTML = "<p class='text-gray-300'>Press Start to begin Tetris</p>";
    }
  }

  // The main game loop
  function gameLoop() {
    // Move pieces down, check collisions, etc.
    // This is a placeholder:
    console.log("Tetris tick...");
  }

  // Start the game
  function startGame() {
    if (!isRunning) {
      isRunning = true;
      if (boardEl) boardEl.innerHTML = "<p class='text-gray-300'>Game running... dropping blocks!</p>";
      gameInterval = setInterval(gameLoop, 500);
    }
  }

  // Pause the game
  function pauseGame() {
    isRunning = false;
    clearInterval(gameInterval);
    if (boardEl) boardEl.innerHTML += "<p class='text-yellow-400'>Paused.</p>";
  }

  // Event listeners
  startBtn?.addEventListener("click", startGame);
  pauseBtn?.addEventListener("click", pauseGame);

  // Initialize board
  initGame();
});
