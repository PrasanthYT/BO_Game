const canvas = document.getElementById("gameCanvas");
const scoreDetails = document.querySelector(".score-details");
const ctx = canvas.getContext("2d");

// Canvas size
canvas.width = 800;
canvas.height = 500;

// Paddle
const paddle = {
  width: 100,
  height: 10,
  x: canvas.width / 2 - 50,
  y: canvas.height - 20,
  dx: 0,
  speed: 3,
};

// Ball
const ball = {
  x: paddle.x + paddle.width / 2,
  y: paddle.y - 10,
  radius: 8,
  speed: 2,
  dx: 2,
  dy: -2,
  moving: false, // Start ball only when a key is pressed
};

// Bricks
const brick = {
  row: 5,
  column: 8,
  width: 75,
  height: 20,
  gap: 15,
  offsetX: 45,
  offsetY: 60,
};
let bricks = [];

// Game variables
let lives = 3;
let score = 0;

// Create bricks
function createBricks() {
  bricks = [];
  for (let r = 0; r < brick.row; r++) {
    bricks[r] = [];
    const totalRowWidth = brick.column * (brick.width + brick.gap) - brick.gap;
    const rowOffsetX = (canvas.width - totalRowWidth) / 2;

    for (let c = 0; c < brick.column; c++) {
      bricks[r][c] = {
        x: rowOffsetX + c * (brick.width + brick.gap),
        y: brick.offsetY + r * (brick.height + brick.gap),
        visible: true,
      };
    }
  }
}

function checkBrickCollision() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      const currentBrick = bricks[r][c];
      if (currentBrick.visible) {
        if (
          ball.x + ball.radius > currentBrick.x &&
          ball.x - ball.radius < currentBrick.x + brick.width &&
          ball.y + ball.radius > currentBrick.y &&
          ball.y - ball.radius < currentBrick.y + brick.height
        ) {
          ball.dy *= -1;
          currentBrick.visible = false;
          score += 10;
        }
      }
    }
  }
}

// Draw paddle
function drawPaddle() {
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8);
  ctx.stroke();
  ctx.fillStyle = "#000";
  ctx.fill();
}

// Draw ball
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.closePath();
}

// Draw bricks
function drawBricks() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      if (bricks[r][c].visible) {
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.roundRect(
          bricks[r][c].x,
          bricks[r][c].y,
          brick.width,
          brick.height,
          8
        );
        ctx.stroke();
      }
    }
  }
}

// Draw lives
function drawLives() {
  ctx.font = "16px 'Space Grotesk', serif";
  ctx.fillStyle = "#000";
  ctx.fillText(`Lives: ${lives}`, canvas.width - 80, 20);
}

// Draw score
function drawScore() {
  ctx.font = "16px 'Space Grotesk', serif";
  ctx.fillStyle = "#000";
  ctx.fillText(`Score: ${score}`, 10, 20);
}

// Draw everything
function draw() {
  ctx.fillStyle = "#fff"; // Set canvas background color
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawPaddle();
  drawBall();
  drawLives();
  drawScore();
}

// Move paddle
function movePaddle() {
  // Update paddle position
  paddle.x += paddle.dx;

  // Wall collision for paddle
  if (paddle.x < 0) {
    paddle.x = 0;
  }
  if (paddle.x + paddle.width > canvas.width) {
    paddle.x = canvas.width - paddle.width;
  }

  // Update ball position if it's not moving
  if (!ball.moving) {
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius; // Position ball just above paddle
  }
}

// Move ball
function moveBall() {
  if (!ball.moving) return;

  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision
  if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
    ball.dx *= -1;
  }
  if (ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }

  // Paddle collision
  if (
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width &&
    ball.y + ball.radius > paddle.y
  ) {
    ball.dy *= -1;
  }

  // Check brick collisions
  checkBrickCollision();

  // Bottom collision
  if (ball.y + ball.radius > canvas.height) {
    lives--;
    if (lives > 0) {
      resetBall();
    } else {
      scoreDetails.textContent = `Game Over! Final Score: ${score}`;
      scoreDetails.style.display = "block";
      ball.moving = false;

      // Hide ball and stop game
      ball.radius = 0;
      paddle.width = 0;

      document.getElementById("play-again-button").style.display = "block";
      document.getElementById("play-again-button").onclick = function () {
        document.location.reload();
      };

      // Remove event listeners
      const clearEvents = () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
      };
      clearEvents();

      // Stop animation
      window.cancelAnimationFrame(requestID);
    }
  }
}

// Reset ball and paddle
function resetBall() {
  ball.x = paddle.x + paddle.width / 2;
  ball.y = paddle.y - 10;
  ball.moving = false;
  ball.dx = 2;
  ball.dy = -2;
}

// Check if all bricks are destroyed
function checkWin() {
  const allBricksDestroyed = bricks.every((row) =>
    row.every((brick) => !brick.visible)
  );
  if (allBricksDestroyed) {
    scoreDetails.textContent = `You Win! Final Score: ${score}`;
    scoreDetails.style.display = "block";
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - 10;
    ball.moving = false;
    document.getElementById("play-again-button").style.display = "block";
    document.getElementById("play-again-button").onclick = function () {
      document.location.reload();
    };
  }
}

// Game loop
function update() {
  movePaddle();
  moveBall();
  draw();
  checkWin();
  requestAnimationFrame(update);
}

// Keyboard events
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") paddle.dx = paddle.speed;
  if (e.key === "ArrowLeft") paddle.dx = -paddle.speed;

  // Start ball movement
  if (e.key === " ") {
    ball.moving = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") paddle.dx = 0;
});

// Initialize game
createBricks(); // Make sure bricks are created
lives = 3; // Reset lives
score = 0; // Reset score
update();

function github_open() {
  window.open("https://github.com/PrasanthYT/BO_Game", "_blank");
}
