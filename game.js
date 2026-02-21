const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ========================
// Game State
// ========================
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15,
  speed: 4
};

let bullets = [];
let zombies = [];
let score = 0;
let keys = {};
let mouse = { x: 0, y: 0 };

// ========================
// Keyboard Controls
// ========================
document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// ========================
// Mouse Controls
// ========================
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

canvas.addEventListener("click", () => {
  const dx = mouse.x - player.x;
  const dy = mouse.y - player.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) return; // Prevent division by zero

  bullets.push({
    x: player.x,
    y: player.y,
    vx: (dx / length) * 8,
    vy: (dy / length) * 8,
    radius: 5
  });
});

// ========================
// Spawn Zombies
// ========================
function spawnZombie() {
  const side = Math.floor(Math.random() * 4);
  let x, y;

  if (side === 0) {
    x = 0;
    y = Math.random() * canvas.height;
  } else if (side === 1) {
    x = canvas.width;
    y = Math.random() * canvas.height;
  } else if (side === 2) {
    x = Math.random() * canvas.width;
    y = 0;
  } else {
    x = Math.random() * canvas.width;
    y = canvas.height;
  }

  zombies.push({
    x,
    y,
    radius: 20,
    speed: 1.2
  });
}

setInterval(spawnZombie, 1500);

// ========================
// Update Logic
// ========================
function update() {
  // Player Movement
  if (keys["w"] || keys["arrowup"]) player.y -= player.speed;
  if (keys["s"] || keys["arrowdown"]) player.y += player.speed;
  if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
  if (keys["d"] || keys["arrowright"]) player.x += player.speed;

  // Keep player inside canvas
  player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

  // Move Bullets
  bullets.forEach((b, index) => {
    b.x += b.vx;
    b.y += b.vy;

    // Remove off-screen bullets
    if (
      b.x < 0 ||
      b.x > canvas.width ||
      b.y < 0 ||
      b.y > canvas.height
    ) {
      bullets.splice(index, 1);
    }
  });

  // Move Zombies
  zombies.forEach((z) => {
    const dx = player.x - z.x;
    const dy = player.y - z.y;
    const length = Math.hypot(dx, dy);

    if (length !== 0) {
      z.x += (dx / length) * z.speed;
      z.y += (dy / length) * z.speed;
    }
  });

  checkCollisions();
}

// ========================
// Collision Detection
// ========================
function checkCollisions() {
  for (let i = zombies.length - 1; i >= 0; i--) {
    for (let j = bullets.length - 1; j >= 0; j--) {
      const dx = zombies[i].x - bullets[j].x;
      const dy = zombies[i].y - bullets[j].y;
      const dist = Math.hypot(dx, dy);

      if (dist < zombies[i].radius + bullets[j].radius) {
        zombies.splice(i, 1);
        bullets.splice(j, 1);
        score += 10;
        break;
      }
    }
  }
}

// ========================
// Render
// ========================
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#00ffcc";
  ctx.fill();

  // Bullets
  bullets.forEach((b) => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
  });

  // Zombies
  zombies.forEach((z) => {
    ctx.beginPath();
    ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
    ctx.fillStyle = "green";
    ctx.fill();
  });

  // Score
  ctx.fillStyle = "white";
  ctx.font = "18px Orbitron";
  ctx.fillText("Score: " + score, 20, 30);
}

// ========================
// Game Loop
// ========================
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();