const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const players = {};
let gameState = {
  ball: { x: 400, y: 300, dx: 5, dy: 5 },
  paddles: {
    left: { y: 250 },
    right: { y: 250 }
  },
  scores: { left: 0, right: 0 }
};

io.on('connection', (socket) => {
  console.log('A user connected');

  if (Object.keys(players).length === 0) {
    players[socket.id] = 'left';
    socket.emit('playerAssigned', 'left');
  } else {
    socket.emit('spectator');
  }

  socket.on('paddleMove', (data) => {
    const playerSide = players[socket.id];
    if (playerSide === 'left') {
      gameState.paddles.left.y = data.y;
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    delete players[socket.id];
  });
});

function updateGame() {
  // Update ball position
  gameState.ball.x += gameState.ball.dx;
  gameState.ball.y += gameState.ball.dy;

  // Ball collision with top and bottom
  if (gameState.ball.y <= 0 || gameState.ball.y >= 600) {
    gameState.ball.dy *= -1;
  }

  // Ball collision with paddles
  if (
    (gameState.ball.x <= 20 && gameState.ball.y >= gameState.paddles.left.y && gameState.ball.y <= gameState.paddles.left.y + 100) ||
    (gameState.ball.x >= 780 && gameState.ball.y >= gameState.paddles.right.y && gameState.ball.y <= gameState.paddles.right.y + 100)
  ) {
    gameState.ball.dx *= -1;
  }

  // Score points
  if (gameState.ball.x <= 0) {
    gameState.scores.right++;
    resetBall();
  } else if (gameState.ball.x >= 800) {
    gameState.scores.left++;
    resetBall();
  }

  // AI for right paddle
  const paddleCenter = gameState.paddles.right.y + 50;
  const moveSpeed = 5;
  if (gameState.ball.y > paddleCenter + 10) {
    gameState.paddles.right.y = Math.min(500, gameState.paddles.right.y + moveSpeed);
  } else if (gameState.ball.y < paddleCenter - 10) {
    gameState.paddles.right.y = Math.max(0, gameState.paddles.right.y - moveSpeed);
  }

  io.emit('gameState', gameState);
}

function resetBall() {
  gameState.ball = { x: 400, y: 300, dx: 5 * (Math.random() > 0.5 ? 1 : -1), dy: 5 * (Math.random() > 0.5 ? 1 : -1) };
}

setInterval(updateGame, 1000 / 60); // 60 FPS

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});