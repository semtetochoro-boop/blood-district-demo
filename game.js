const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const playerGunImg = new Image();
playerGunImg.src = "player_gun.png";

const playerKnifeImg = new Image();
playerKnifeImg.src = "player_knife.png";

let camX = 0;
let camY = 0;

let kills = 0;
let killStreak = 0;
let killText = "";
let killTextTimer = 0;

let knifeCooldown = 0;
let knifeAnim = 0;

const player = {
  x: 500,
  y: 500,
  life: 100,
  angle: 0,
  speed: 4
};

let moveX = 0;
let moveY = 0;

const bullets = [];
const zombies = [];
const corpses = [];

for (let i = 0; i < 20; i++) {
  zombies.push({
    x: Math.random() * 3000,
    y: Math.random() * 3000,
    life: 4
  });
}

const joy = document.getElementById("joystick");
const stick = document.getElementById("stick");
const shootBtn = document.getElementById("shoot");

document.addEventListener("touchmove", e => {
  e.preventDefault();
}, { passive: false });

joy.addEventListener("touchmove", e => {
  e.preventDefault();

  const t = e.touches[0];
  const r = joy.getBoundingClientRect();

  let x = t.clientX - r.left - 60;
  let y = t.clientY - r.top - 60;

  const d = Math.hypot(x, y);

  if (d > 40) {
    x = x / d * 40;
    y = y / d * 40;
  }

  stick.style.left = 35 + x + "px";
  stick.style.top = 35 + y + "px";

  moveX = x / 40;
  moveY = y / 40;

  if (Math.abs(moveX) > 0.1 || Math.abs(moveY) > 0.1) {
    player.angle = Math.atan2(moveY, moveX);
  }
});

joy.addEventListener("touchend", () => {
  moveX = 0;
  moveY = 0;
  stick.style.left = "35px";
  stick.style.top = "35px";
});

function getKillName() {
  if (killStreak === 1) return "FIRST KILL";
  if (killStreak === 2) return "DOUBLE KILL";
  if (killStreak === 3) return "TRIPLE KILL";
  if (killStreak === 4) return "QUADRA KILL";
  return "ACE KILL";
}

function registerKill(zombie) {
  corpses.push({
    x: zombie.x,
    y: zombie.y,
    angle: Math.random() * Math.PI * 2
  });

  kills++;
  killStreak++;
  killText = getKillName();
  killTextTimer = 90;
}

function shoot() {
  const a = player.angle;

  bullets.push({
    x: player.x + Math.cos(a) * 42,
    y: player.y + Math.sin(a) * 42,
    dx: Math.cos(a) * 15,
    dy: Math.sin(a) * 15
  });
}

shootBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  shoot();
}, { passive: false });

function knifeAttack(index) {
  if (knifeCooldown > 0) return;

  const z = zombies[index];

  knifeCooldown = 120;
  knifeAnim = 60;

  z.life -= 2;

  if (z.life <= 0) {
    registerKill(z);
    zombies.splice(index, 1);
  }
}

function update() {
  player.x += moveX * player.speed;
  player.y += moveY * player.speed;

  const targetCamX = player.x - canvas.width / 2;
  const targetCamY = player.y - canvas.height / 2;

  camX += (targetCamX - camX) * 0.12;
  camY += (targetCamY - camY) * 0.12;

  if (knifeCooldown > 0) knifeCooldown--;
  if (knifeAnim > 0) knifeAnim--;

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];

    b.x += b.dx;
    b.y += b.dy;

    for (let j = zombies.length - 1; j >= 0; j--) {
      const z = zombies[j];
      const dist = Math.hypot(b.x - z.x, b.y - z.y);

      if (dist < 22) {
        z.life--;
        bullets.splice(i, 1);

        if (z.life <= 0) {
          registerKill(z);
          zombies.splice(j, 1);
        }

        break;
      }
    }
  }

  for (let i = zombies.length - 1; i >= 0; i--) {
    const z = zombies[i];

    const a = Math.atan2(player.y - z.y, player.x - z.x);

    z.x += Math.cos(a) * 1;
    z.y += Math.sin(a) * 1;

    const dist = Math.hypot(player.x - z.x, player.y - z.y);

    if (dist < 40) {
      knifeAttack(i);
    }

    if (dist < 60) {
      player.life -= 0.012;
    }
  }

  if (killTextTimer > 0) killTextTimer--;
}

function drawWoodFloor() {
  ctx.fillStyle = "#2b160d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const plankW = 180;
  const plankH = 34;

  const startX = Math.floor(camX / plankW) * plankW;
  const startY = Math.floor(camY / plankH) * plankH;

  for (let y = startY; y < camY + canvas.height + plankH; y += plankH) {
    for (let x = startX; x < camX + canvas.width + plankW; x += plankW) {
      const sx = x - camX;
      const sy = y - camY;

      const shade = (Math.floor(y / plankH) % 2) ? "#3a2114" : "#4a2a18";

      ctx.fillStyle = shade;
      ctx.fillRect(sx, sy, plankW, plankH);

      ctx.strokeStyle = "#1a0d07";
      ctx.strokeRect(sx, sy, plankW, plankH);

      ctx.fillStyle = "rgba(255,255,255,.04)";
      ctx.fillRect(sx + 8, sy + 8, plankW - 16, 3);
    }
  }
}

function drawCorpses() {
  for (const c of corpses) {
    const x = c.x - camX;
    const y = c.y - camY;

    ctx.fillStyle = "rgba(150,0,0,.6)";
    ctx.beginPath();
    ctx.ellipse(x, y, 34, 22, c.angle, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(c.angle);

    ctx.fillStyle = "#300000";
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function drawPlayerFallback() {
  ctx.fillStyle = "#004dff";
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff9800";
  ctx.beginPath();
  ctx.arc(12, 0, 9, 0, Math.PI * 2);
  ctx.fill();

  if (knifeAnim > 0) {
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(15, 8);
    ctx.lineTo(52, 20);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#111";
    ctx.fillRect(12, -5, 45, 10);
  }
}

function drawPlayer() {
  ctx.save();

  ctx.translate(player.x - camX, player.y - camY);

  ctx.shadowColor = "rgba(0,0,0,.7)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 10;

  ctx.rotate(player.angle + Math.PI);

  const img = knifeAnim > 0 ? playerKnifeImg : playerGunImg;

  if (img.complete && img.naturalWidth > 0) {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, -58, -58, 116, 116);
  } else {
    drawPlayerFallback();
  }

  ctx.restore();
}

function drawZombies() {
  for (const z of zombies) {
    const x = z.x - camX;
    const y = z.y - camY;

    ctx.fillStyle = "#730000";
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#220000";
    ctx.beginPath();
    ctx.arc(x + 7, y - 5, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#300";
    ctx.fillRect(x - 18, y - 29, 36, 5);

    ctx.fillStyle = "#45ff45";
    ctx.fillRect(x - 18, y - 29, 9 * z.life, 5);
  }
}

function drawBullets() {
  ctx.fillStyle = "#ffe600";

  for (const b of bullets) {
    ctx.beginPath();
    ctx.arc(b.x - camX, b.y - camY, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCrosshair() {
  const x = player.x + Math.cos(player.angle) * 100 - camX;
  const y = player.y + Math.sin(player.angle) * 100 - camY;

  ctx.strokeStyle = "#ff3030";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 18, y);
  ctx.lineTo(x - 7, y);
  ctx.moveTo(x + 7, y);
  ctx.lineTo(x + 18, y);
  ctx.moveTo(x, y - 18);
  ctx.lineTo(x, y - 7);
  ctx.moveTo(x, y + 7);
  ctx.lineTo(x, y + 18);
  ctx.stroke();
}

function drawKillText() {
  if (killTextTimer <= 0) return;

  ctx.save();

  ctx.globalAlpha = Math.min(1, killTextTimer / 20);
  ctx.textAlign = "center";
  ctx.font = "bold 38px Arial";
  ctx.lineWidth = 6;
  ctx.strokeStyle = "black";
  ctx.fillStyle = "#ff2b2b";

  ctx.strokeText(killText, canvas.width / 2, 95);
  ctx.fillText(killText, canvas.width / 2, 95);

  ctx.restore();
}

function drawHUD() {
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,.7)";
  ctx.roundRect(14, 14, 220, 100, 14);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,.2)";
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font = "bold 15px Arial";
  ctx.fillText("SURVIVAL MODE", 28, 38);

  ctx.fillStyle = "#333";
  ctx.fillRect(28, 52, 160, 12);

  ctx.fillStyle = "#e53935";
  ctx.fillRect(28, 52, Math.max(0, player.life) * 1.6, 12);

  ctx.font = "13px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("VIDA " + Math.floor(player.life), 28, 84);
  ctx.fillText("KILLS " + kills, 108, 84);

  ctx.fillStyle = knifeCooldown > 0 ? "#aaa" : "#7CFF7C";
  ctx.fillText(
    knifeCooldown > 0 ? "FACA: " + Math.ceil(knifeCooldown / 60) + "s" : "FACA PRONTA",
    28,
    104
  );

  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawWoodFloor();
  drawCorpses();
  drawZombies();
  drawBullets();
  drawPlayer();
  drawCrosshair();
  drawKillText();
  drawHUD();
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

loop();