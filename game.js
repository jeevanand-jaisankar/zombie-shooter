const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const overlay = document.getElementById("overlay");
const finalScore = document.getElementById("finalScore");
const healthUI = document.getElementById("healthUI");
const ammoUI = document.getElementById("ammoUI");
const levelUI = document.getElementById("levelUI");
const premiumBtn = document.getElementById("premiumBtn");

let player, bullets, zombies, keys;
let score, level, ammo;
let premiumMode = false;
let gameOver;
let lastDamageTime;
let mouse = { x: 450, y: 300 };
let zombiesPerWave = 5;

function init() {
  player = { x: 450, y: 300, size: 20, hp: 100 };
  bullets = [];
  zombies = [];
  keys = {};
  score = 0;
  level = 1;
  gameOver = false;
  lastDamageTime = 0;
  overlay.style.display = "none";

  startWave();
}

function startWave() {
  zombies = [];

  zombiesPerWave = 3 + level * 2;

  // Ammo = zombies × 4 (50% buffer)
  ammo = zombiesPerWave * 4;

  for (let i = 0; i < zombiesPerWave; i++) {
    zombies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 20,
      speed: 1 + level * 0.3 + (premiumMode ? 1 : 0),
      hp: 2 // exactly 2 bullets per zombie
    });
  }
}

init();

// ===== INPUT =====
document.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (e.key === "Enter" && gameOver) {
    init();
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

canvas.addEventListener("click", () => {
  if (ammo > 0 && !gameOver) {
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

    bullets.push({
      x: player.x,
      y: player.y,
      dx: Math.cos(angle) * 8,
      dy: Math.sin(angle) * 8
    });

    ammo--;
  }
});

premiumBtn.onclick = () => {
  premiumMode = !premiumMode;
  init();
};

// ===== UPDATE =====
function update() {
  if (gameOver) return;

  // Movement
  if (keys["w"] || keys["ArrowUp"]) player.y -= 3;
  if (keys["s"] || keys["ArrowDown"]) player.y += 3;
  if (keys["a"] || keys["ArrowLeft"]) player.x -= 3;
  if (keys["d"] || keys["ArrowRight"]) player.x += 3;

  // Bullet movement
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += bullets[i].dx;
    bullets[i].y += bullets[i].dy;

    if (
      bullets[i].x < 0 ||
      bullets[i].x > canvas.width ||
      bullets[i].y < 0 ||
      bullets[i].y > canvas.height
    ) {
      bullets.splice(i, 1);
    }
  }

  // Zombie logic
  for (let zi = zombies.length - 1; zi >= 0; zi--) {
    let z = zombies[zi];

    let dx = player.x - z.x;
    let dy = player.y - z.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    z.x += (dx / dist) * z.speed;
    z.y += (dy / dist) * z.speed;

    // Bullet collision
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      let b = bullets[bi];
      let dx2 = b.x - z.x;
      let dy2 = b.y - z.y;
      let distance = Math.sqrt(dx2 * dx2 + dy2 * dy2);

      if (distance < 15) {
        z.hp--;
        bullets.splice(bi, 1);

        if (z.hp <= 0) {
          zombies.splice(zi, 1);
          score += 10;
        }
        break;
      }
    }

    // Damage cooldown
    if (dist < 20) {
      const now = Date.now();
      if (now - lastDamageTime > 500) {
        player.hp -= 5;
        lastDamageTime = now;
      }
    }
  }

  // Next wave
  if (zombies.length === 0 && !gameOver) {
    level++;
    startWave();
  }

  if (player.hp <= 0) {
    player.hp = 0;
    gameOver = true;
    overlay.style.display = "flex";
    finalScore.innerText = "Final Score: " + score;
  }

  healthUI.innerText = "HP: " + player.hp;
  ammoUI.innerText = "Ammo: " + ammo;
  levelUI.innerText = "Wave: " + level;
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Aim line
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(mouse.x, mouse.y);
  ctx.stroke();

  // Player
  ctx.fillStyle = "cyan";
  ctx.fillRect(player.x - 10, player.y - 10, player.size, player.size);

  // Bullets
  ctx.fillStyle = "yellow";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, 5, 5));

  // Zombies
  ctx.fillStyle = "green";
  zombies.forEach(z => ctx.fillRect(z.x - 10, z.y - 10, z.size, z.size));
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();