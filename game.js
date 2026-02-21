const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ================= STATE =================
let level = 1;
let zombiesToSpawn = 6;
let score = 0;
let gameRunning = true;

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15,
  speed: 4,
  hp: 100,
  maxHp: 100
};

let bullets = [];
let zombies = [];
let keys = {};
let mouse = { x: 0, y: 0 };

// ================= INPUT =================
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

canvas.addEventListener("click", () => {
  if (!gameRunning) {
    restartGame();
    return;
  }

  const dx = mouse.x - player.x;
  const dy = mouse.y - player.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) return;

  bullets.push({
    x: player.x,
    y: player.y,
    vx: (dx / length) * 9,
    vy: (dy / length) * 9,
    radius: 4,
    damage: 1
  });
});

// ================= LEVEL =================
function startLevel() {
  for (let i = 0; i < zombiesToSpawn; i++) {
    spawnZombie();
  }
}

function nextLevel() {
  level++;
  zombiesToSpawn += 4;
  startLevel();
}

// ================= ZOMBIES =================
function spawnZombie() {
  const side = Math.floor(Math.random() * 4);
  let x, y;

  if (side === 0) { x = 0; y = Math.random() * canvas.height; }
  else if (side === 1) { x = canvas.width; y = Math.random() * canvas.height; }
  else if (side === 2) { x = Math.random() * canvas.width; y = 0; }
  else { x = Math.random() * canvas.width; y = canvas.height; }

  zombies.push({
    x,
    y,
    radius: 18,
    speed: 1.5 + level * 0.35,
    hp: 1 + Math.floor(level / 2)
  });
}

// ================= UPDATE =================
function update() {
  if (!gameRunning) return;

  // Player movement
  if (keys["w"] || keys["arrowup"]) player.y -= player.speed;
  if (keys["s"] || keys["arrowdown"]) player.y += player.speed;
  if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
  if (keys["d"] || keys["arrowright"]) player.x += player.speed;

  // Boundaries
  player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

  // Bullets
  bullets.forEach((b, i) => {
    b.x += b.vx;
    b.y += b.vy;
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(i, 1);
    }
  });

  // Zombies
  zombies.forEach((z, i) => {
    const dx = player.x - z.x;
    const dy = player.y - z.y;
    const dist = Math.hypot(dx, dy);

    z.x += (dx / dist) * z.speed;
    z.y += (dy / dist) * z.speed;

    if (dist < player.radius + z.radius) {
      player.hp -= 0.4;
      if (player.hp <= 0) {
        player.hp = 0;
        gameRunning = false;
      }
    }
  });

  checkCollisions();

  if (zombies.length === 0) nextLevel();
}

// ================= COLLISIONS =================
function checkCollisions() {
  for (let i = zombies.length - 1; i >= 0; i--) {
    for (let j = bullets.length - 1; j >= 0; j--) {
      const dx = zombies[i].x - bullets[j].x;
      const dy = zombies[i].y - bullets[j].y;
      const dist = Math.hypot(dx, dy);

      if (dist < zombies[i].radius + bullets[j].radius) {
        zombies[i].hp -= bullets[j].damage;
        bullets.splice(j, 1);

        if (zombies[i].hp <= 0) {
          zombies.splice(i, 1);
          score += 10;
        }
        break;
      }
    }
  }
}

// ================= UI =================
function drawHUD() {
  ctx.fillStyle = "#00ffcc";
  ctx.font = "18px Orbitron";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("Level: " + level, canvas.width - 130, 30);
}

function drawHealthBar() {
  ctx.fillStyle = "#440000";
  ctx.fillRect(20, 50, 250, 15);

  ctx.fillStyle = "#00ff00";
  ctx.fillRect(20, 50, (player.hp / player.maxHp) * 250, 15);

  ctx.strokeStyle = "#00ffcc";
  ctx.strokeRect(20, 50, 250, 15);
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ff0033";
  ctx.font = "60px Orbitron";
  ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2 - 30);

  ctx.font = "22px Orbitron";
  ctx.fillStyle = "#00ffcc";
  ctx.fillText("Final Score: " + score, canvas.width/2, canvas.height/2 + 20);
  ctx.fillText("Click Anywhere to Restart", canvas.width/2, canvas.height/2 + 70);

  ctx.textAlign = "left";
}

// ================= RENDER =================
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI*2);
  ctx.fillStyle = "#00ffcc";
  ctx.fill();

  // Bullets
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2);
    ctx.fillStyle = "#ffff00";
    ctx.fill();
  });

  // Zombies
  zombies.forEach(z => {
    ctx.beginPath();
    ctx.arc(z.x, z.y, z.radius, 0, Math.PI*2);
    ctx.fillStyle = "#00aa00";
    ctx.fill();
  });

  drawHUD();
  drawHealthBar();

  if (!gameRunning) drawGameOver();
}

// ================= RESTART =================
function restartGame() {
  level = 1;
  zombiesToSpawn = 6;
  score = 0;
  player.hp = player.maxHp;
  zombies = [];
  bullets = [];
  gameRunning = true;
  startLevel();
}

// ================= LOOP =================
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

startLevel();
gameLoop();