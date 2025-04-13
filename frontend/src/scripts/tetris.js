document.addEventListener("DOMContentLoaded", () => {
  // DOM Refs
  const canvas = document.getElementById("tetrisBoard");
  const ctx = canvas.getContext("2d");
  const nextCanvas = document.getElementById("nextPiece");
  const nextCtx = nextCanvas.getContext("2d");

  const scoreEl = document.getElementById("score");

  const startBtn = document.getElementById("startTetrisBtn");
  const pauseResumeBtn = document.getElementById("pauseResumeBtn");
  const restartBtn = document.getElementById("restartTetrisBtn");

  // Board config (smaller for better fit)
  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 16; // => 160 x 320
  let board = [];

  // Game state
  let isRunning = false;
  let isPaused = false;
  let gameInterval = null;
  let score = 0;

  // Current piece data
  let curPiece = null;
  let nextPiece = null;
  let curX = 0, curY = 0;

  // TETRIS shapes
  const SHAPES = [
    [],
    [[1,1,1,1]],
    [[1,1],[1,1]],
    [[0,1,0],[1,1,1]],
    [[0,1,1],[1,1,0]],
    [[1,1,0],[0,1,1]],
    [[1,0,0],[1,1,1]],
    [[0,0,1],[1,1,1]],
  ];
  const COLORS = [
    '#000',
    '#1E90FF',
    '#FFD700',
    '#40E0D0',
    '#32CD32',
    '#FF6347',
    '#8A2BE2',
    '#FFA500',
  ];

  // CREATE empty board
  function createBoard() {
    board = [];
    for(let y=0; y<ROWS; y++){
      board.push(new Array(COLS).fill(0));
    }
  }

  // DRAW board
  function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let y=0; y<ROWS; y++){
      for(let x=0; x<COLS; x++){
        const val= board[y][x];
        if(val) drawBlock(x,y,val);
      }
    }
  }

  function drawBlock(x,y,colorIdx) {
    ctx.fillStyle = COLORS[colorIdx];
    ctx.fillRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE,BLOCK_SIZE);
    ctx.strokeStyle= '#151721';
    ctx.strokeRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE,BLOCK_SIZE);
  }

  // RANDOM piece
  function randomPiece(){
    const t= Math.floor(Math.random()*(SHAPES.length-1))+1;
    return { shape: SHAPES[t], color: t };
  }

  // NEXT piece preview
  function drawPreview(){
    nextCtx.clearRect(0,0,nextCanvas.width,nextCanvas.height);
    const shape= nextPiece.shape;
    const offsetX= Math.floor((4 - shape[0].length)/2);
    shape.forEach((row, sy)=>{
      row.forEach((val, sx)=>{
        if(val){
          nextCtx.fillStyle= COLORS[nextPiece.color];
          nextCtx.fillRect((sx+offsetX)*20, sy*20,20,20);
          nextCtx.strokeStyle='#151721';
          nextCtx.strokeRect((sx+offsetX)*20, sy*20,20,20);
        }
      });
    });
  }

  function spawnPiece(){
    curPiece= nextPiece || randomPiece();
    nextPiece= randomPiece();
    drawPreview();
    curX=3; curY=0;
    if(collide(curPiece.shape, curX, curY)) {
      endGame();
      alert('Game Over!');
    }
  }

  function collide(shape, offX, offY){
    return shape.some((row, sy)=>
      row.some((val, sx)=>{
        if(!val) return false;
        const nx= offX+ sx, ny= offY+ sy;
        if(nx<0||nx>=COLS||ny<0||ny>=ROWS) return true;
        if(board[ny][nx]) return true;
        return false;
      })
    );
  }

  function merge() {
    curPiece.shape.forEach((row, sy)=>{
      row.forEach((val, sx)=>{
        if(val) board[curY+sy][curX+sx]= curPiece.color;
      });
    });
  }

  // TICK => drop down
  function tick() {
    if(!isRunning || isPaused)return;
    if(!moveDown()){
      placePiece();
    }
    drawAll();
  }

  function moveDown(){
    if(!collide(curPiece.shape, curX, curY+1)){
      curY++;
      return true;
    }
    return false;
  }

  function placePiece(){
    merge();
    clearLines();
    spawnPiece();
  }

  function clearLines(){
    let lines=0;
    for(let y=ROWS-1; y>=0; y--){
      if(board[y].every(cell=>cell!==0)){
        board.splice(y,1);
        board.unshift(Array(COLS).fill(0));
        lines++;
        y++;
      }
    }
    if(lines>0){
      score+= lines*100;
      scoreEl.textContent= score;
    }
  }

  function hardDrop(){
    while(!collide(curPiece.shape, curX, curY+1)){
      curY++;
    }
    placePiece();
  }

  function moveHorizontal(dx){
    if(!collide(curPiece.shape, curX+dx, curY)){
      curX+= dx;
    }
  }

  function rotatePiece(){
    const old= curPiece.shape;
    const rotated = old[0].map((_,i)=> old.map(row=> row[i]).reverse());
    curPiece.shape= rotated;
    if(collide(rotated, curX, curY)){
      curPiece.shape= old;
    }
  }

  function drawPiece(){
    curPiece.shape.forEach((row,sy)=>{
      row.forEach((val,sx)=>{
        if(val) drawBlock(curX+sx, curY+sy, curPiece.color);
      });
    });
  }

  function drawAll(){
    drawBoard();
    drawPiece();
  }

  // START
  function startGame(){
    if(isRunning)return;
    isRunning=true;
    isPaused=false;

    // UI changes
    startBtn.classList.add('hidden');
    pauseResumeBtn.classList.remove('hidden');
    pauseResumeBtn.textContent= 'Pause';
    restartBtn.classList.remove('hidden');

    createBoard();
    score=0; scoreEl.textContent= score;
    nextPiece= randomPiece();
    spawnPiece();
    drawAll();
    gameInterval= setInterval(tick,500);
  }

  // TOGGLE PAUSE
  function togglePause(){
    if(!isRunning) return;
    if(!isPaused){
      // Pause
      isPaused=true;
      clearInterval(gameInterval);
      pauseResumeBtn.textContent='Continue';
    } else {
      // Resume
      isPaused=false;
      pauseResumeBtn.textContent='Pause';
      gameInterval= setInterval(tick,500);
    }
  }

  function endGame(){
    isRunning=false;
    isPaused=false;
    clearInterval(gameInterval);
  }

  function restartGame(){
    endGame();
    // re-show correct UI
    startGame();
  }

  // HOOKS
  startBtn.addEventListener('click', startGame);
  pauseResumeBtn.addEventListener('click', togglePause);
  restartBtn.addEventListener('click', restartGame);

  // PREVENT ARROW SCROLL
  document.addEventListener('keydown', e=>{
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
      e.preventDefault();
    }
    if(!isRunning||isPaused) return;

    switch(e.key){
      case 'ArrowLeft': moveHorizontal(-1); break;
      case 'ArrowRight': moveHorizontal(1); break;
      case 'ArrowUp': rotatePiece(); break;
      case 'ArrowDown': hardDrop(); break;
    }
    drawAll();
  }, {passive:false});

  // TOUCH
  let touchX=0, touchY=0;
  canvas.addEventListener('touchstart',(e)=>{
    e.preventDefault();
    if(!isRunning||isPaused)return;
    const t=e.changedTouches[0];
    touchX=t.clientX; touchY=t.clientY;
  },{passive:false});
  canvas.addEventListener('touchmove',(e)=> e.preventDefault(),{passive:false});
  canvas.addEventListener('touchend',(e)=>{
    e.preventDefault();
    if(!isRunning||isPaused)return;
    const t=e.changedTouches[0];
    const dx= t.clientX-touchX;
    const dy= t.clientY-touchY;
    if(Math.abs(dx)> Math.abs(dy)){
      if(dx>30) moveHorizontal(1);
      else if(dx< -30) moveHorizontal(-1);
    } else {
      if(dy>30) hardDrop();
      else if(dy< -30) rotatePiece();
    }
    drawAll();
  },{passive:false});
});
