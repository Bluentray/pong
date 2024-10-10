const socket = io();
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

let playerSide;

socket.on('playerAssigned', (side) => {
  playerSide = side;
  console.log(`You are the ${side} player`);
});

socket.on('spectator', () => {
  console.log('You are a spectator. The game is already in progress.');
});

socket.on('gameState', (gameState) => {
  drawGame(gameState);
});

function drawGame(gameState) {
  // Clear the canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the ball
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(gameState.ball.x, gameState.ball.y, 10, 0, Math.PI * 2);
  ctx.fill();

  // Draw the paddles
  ctx.fillRect(0, gameState.paddles.left.y, 20, 100);
  ctx.fillRect(780, gameState.paddles.right.y, 20, 100);

  // Draw the scores
  ctx.font = '30px Arial';
  ctx.fillText(gameState.scores.left, 100, 50);
  ctx.fillText(gameState.scores.right, 700, 50);

  // Draw player labels
  ctx.font = '20px Arial';
  ctx.fillText('Player', 50, 580);
  ctx.fillText('AI', 750, 580);
}

canvas.addEventListener('mousemove', (event) => {
  if (playerSide === 'left') {
    const rect = canvas.getBoundingClientRect();
    const y = event.clientY - rect.top - 50; // 50 is half the paddle height
    socket.emit('paddleMove', { y: Math.max(0, Math.min(500, y)) });
  }
});