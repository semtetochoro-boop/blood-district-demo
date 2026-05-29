let story = null;

const gunImg = new Image();
gunImg.src = "player_gun.png";

const knifeImg = new Image();
knifeImg.src = "player_knife.png";

function startStory(save){
  document.body.classList.add("playing");

  const mission = save?.mission || 1;

  story = {
    mission,

    player:{
      x:600,
      y:600,
      life:save?.currentLife || 100,
      maxLife:save?.maxLife || 100,
      angle:0,
      speed:4
    },

    cam:{x:0,y:0},

    moveX:0,
    moveY:0,

    bullets:[],
    zombies:[],
    corpses:[],

    kills:0,
    objectiveKills:0,

    gunDamage:save?.gunDamage || 1,

    knifeCooldown:0,
    knifeAnim:0,

    lockpick:false,
    lockProgress:0,

    message:""
  };

  setupStoryControls();
  loadMission();
}

function loadMission(){
  story.map = createMissionMap(story.mission);
  story.upgrade = createMissionUpgrade(story.mission);

  story.player.x = story.map.playerStart.x;
  story.player.y = story.map.playerStart.y;

  story.bullets = [];
  story.zombies = [];
  story.corpses = [];
  story.kills = 0;
  story.lockpick = false;
  story.lockProgress = 0;
  story.map.door.open = false;

  if(story.mission === 10 || story.mission === 20){
    story.objectiveKills = 1;

    story.zombies.push({
      x:story.map.bossSpawn.x,
      y:story.map.bossSpawn.y,
      life:500,
      maxLife:500,
      boss:true,
      speed:.55,
      damage:10
    });

    story.message = "MISSÃO " + story.mission + ": derrote o chefão e abra a porta.";
  }else{
    story.objectiveKills = story.map.zombieSpawns.length;

    for(const s of story.map.zombieSpawns){
      story.zombies.push({
        x:s.x,
        y:s.y,
        life:4,
        maxLife:4,
        boss:false,
        speed:1,
        damage:1
      });
    }

    story.message = "MISSÃO " + story.mission + ": elimine os infectados e encontre a porta.";
  }
}

function setupStoryControls(){
  const joy = document.getElementById("joystick");
  const stick = document.getElementById("stick");
  const shoot = document.getElementById("shoot");

  joy.ontouchmove = e=>{
    e.preventDefault();

    const t = e.touches[0];
    const r = joy.getBoundingClientRect();

    let x = t.clientX - r.left - 65;
    let y = t.clientY - r.top - 65;

    const d = Math.hypot(x,y);

    if(d > 45){
      x = x / d * 45;
      y = y / d * 45;
    }

    stick.style.left = 38 + x + "px";
    stick.style.top = 38 + y + "px";

    story.moveX = x / 45;
    story.moveY = y / 45;

    if(Math.abs(story.moveX) > .1 || Math.abs(story.moveY) > .1){
      story.player.angle = Math.atan2(story.moveY,story.moveX);
    }
  };

  joy.ontouchend = ()=>{
    story.moveX = 0;
    story.moveY = 0;
    stick.style.left = "38px";
    stick.style.top = "38px";
  };

  shoot.ontouchstart = e=>{
    e.preventDefault();

    if(story.lockpick){
      story.lockProgress += 8;

      if(story.lockProgress >= 100){
        story.lockProgress = 100;
        story.lockpick = false;
        story.map.door.open = true;
        nextMission();
      }

      return;
    }

    shootBullet();
  };
}

function shootBullet(){
  const p = story.player;
  const a = p.angle;

  story.bullets.push({
    x:p.x + Math.cos(a)*42,
    y:p.y + Math.sin(a)*42,
    dx:Math.cos(a)*16,
    dy:Math.sin(a)*16,
    damage:story.gunDamage
  });
}

function knifeAttack(index){
  if(story.knifeCooldown > 0) return;

  const z = story.zombies[index];

  story.knifeCooldown = 120;
  story.knifeAnim = 35;

  z.life -= 2;

  if(z.life <= 0){
    killZombie(index);
  }
}

function killZombie(index){
  const z = story.zombies[index];

  story.corpses.push({
    x:z.x,
    y:z.y,
    angle:Math.random()*Math.PI*2,
    boss:z.boss
  });

  story.zombies.splice(index,1);
  story.kills++;
}

function nextMission(){
  story.mission++;

  if(story.mission > 20){
    const save = loadSave() || createNewSave();
    save.completed = true;
    save.mission = 20;

    localStorage.setItem("bloodDistrictSave",JSON.stringify(save));

    document.body.classList.remove("playing");
    gameState = "menu";

    alert("PARABÉNS! VOCÊ ZEROU ESTE JOGO. VOCÊ É UM PRODÍGIO!");
    return;
  }

  const save = loadSave() || createNewSave();
  save.mission = story.mission;
  save.maxLife = story.player.maxLife;
  save.currentLife = story.player.life;
  save.gunDamage = story.gunDamage;

  localStorage.setItem("bloodDistrictSave",JSON.stringify(save));

  loadMission();
}

function updateStory(){
  if(!story) return;

  const p = story.player;

  let nextX = p.x + story.moveX * p.speed;
  let nextY = p.y + story.moveY * p.speed;

  if(!collidesWithWalls(story.map,nextX,p.y,22)){
    p.x = nextX;
  }

  if(!collidesWithWalls(story.map,p.x,nextY,22)){
    p.y = nextY;
  }

  story.cam.x += (p.x - canvas.width/2 - story.cam.x) * .12;
  story.cam.y += (p.y - canvas.height/2 - story.cam.y) * .12;

  if(story.knifeCooldown > 0) story.knifeCooldown--;
  if(story.knifeAnim > 0) story.knifeAnim--;

  updateBullets();
  updateZombies();
  checkUpgradePickup(story);
  checkDoor();
}

function updateBullets(){
  for(let i=story.bullets.length-1;i>=0;i--){
    const b = story.bullets[i];

    b.x += b.dx;
    b.y += b.dy;

    if(collidesWithWalls(story.map,b.x,b.y,4)){
      story.bullets.splice(i,1);
      continue;
    }

    for(let z=story.zombies.length-1;z>=0;z--){
      const enemy = story.zombies[z];
      const dist = Math.hypot(b.x-enemy.x,b.y-enemy.y);

      if(dist < (enemy.boss ? 42 : 24)){
        enemy.life -= b.damage;
        story.bullets.splice(i,1);

        if(enemy.life <= 0){
          killZombie(z);
        }

        break;
      }
    }
  }
}

function updateZombies(){
  const p = story.player;

  for(let i=story.zombies.length-1;i>=0;i--){
    const z = story.zombies[i];

    const a = Math.atan2(p.y-z.y,p.x-z.x);

    const nx = z.x + Math.cos(a) * z.speed;
    const ny = z.y + Math.sin(a) * z.speed;

    if(!collidesWithWalls(story.map,nx,z.y,z.boss?38:18)){
      z.x = nx;
    }

    if(!collidesWithWalls(story.map,z.x,ny,z.boss?38:18)){
      z.y = ny;
    }

    const dist = Math.hypot(p.x-z.x,p.y-z.y);

    if(dist < (z.boss ? 58 : 38)){
      knifeAttack(i);
      p.life -= z.boss ? .16 : .015;
    }

    if(p.life <= 0){
      p.life = p.maxLife;
      story.message = "Você caiu. Recomeçando a missão.";
      loadMission();
    }
  }
}

function checkDoor(){
  const p = story.player;
  const d = story.map.door;

  const doorX = d.x + d.w/2;
  const doorY = d.y + d.h/2;

  const dist = Math.hypot(p.x-doorX,p.y-doorY);

  if(story.kills >= story.objectiveKills && dist < 90 && !d.open){
    story.lockpick = true;
    story.message = "LOCKPICK: toque no botão de tiro até abrir.";
  }
}

function renderStory(){
  if(!story) return;

  drawMissionMap(story);
  drawDoor();
  drawUpgrade(story);
  drawCorpses();
  drawZombies();
  drawBullets();
  drawPlayer();
  drawAim();
  drawHUD();

  if(story.lockpick){
    drawLockpick();
  }
}

function drawDoor(){
  const d = story.map.door;

  const x = d.x - story.cam.x;
  const y = d.y - story.cam.y;

  ctx.fillStyle = d.open ? "#0a7a35" : "#5b2b13";
  ctx.fillRect(x,y,d.w,d.h);

  ctx.strokeStyle = story.kills >= story.objectiveKills ? "#00ff66" : "#ffffff";
  ctx.lineWidth = 3;
  ctx.strokeRect(x,y,d.w,d.h);

  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("EXIT",x+d.w/2,y-10);
}

function drawPlayer(){
  const p = story.player;
  const img = story.knifeAnim > 0 ? knifeImg : gunImg;

  ctx.save();

  ctx.translate(p.x-story.cam.x,p.y-story.cam.y);
  ctx.rotate(p.angle + Math.PI);

  ctx.shadowColor = "rgba(0,0,0,.7)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 8;

  if(img.complete && img.naturalWidth > 0){
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img,-58,-58,116,116);
  }else{
    ctx.fillStyle="#1e5eff";
    ctx.beginPath();
    ctx.arc(0,0,20,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle="#111";
    ctx.fillRect(10,-5,45,10);
  }

  ctx.restore();
}

function drawAim(){
  const p = story.player;

  const x = p.x + Math.cos(p.angle)*105 - story.cam.x;
  const y = p.y + Math.sin(p.angle)*105 - story.cam.y;

  ctx.strokeStyle = "#ff3333";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(x,y,12,0,Math.PI*2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x-20,y);
  ctx.lineTo(x-8,y);
  ctx.moveTo(x+8,y);
  ctx.lineTo(x+20,y);
  ctx.moveTo(x,y-20);
  ctx.lineTo(x,y-8);
  ctx.moveTo(x,y+8);
  ctx.lineTo(x,y+20);
  ctx.stroke();
}

function drawZombies(){
  for(const z of story.zombies){
    const x = z.x - story.cam.x;
    const y = z.y - story.cam.y;

    ctx.fillStyle = z.boss ? "#240000" : "#790000";
    ctx.beginPath();
    ctx.arc(x,y,z.boss?38:18,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(x+7,y-5,z.boss?12:7,0,Math.PI*2);
    ctx.fill();

    const w = z.boss ? 100 : 42;

    ctx.fillStyle = "#300";
    ctx.fillRect(x-w/2,y-(z.boss?58:32),w,6);

    ctx.fillStyle = "#00ff4c";
    ctx.fillRect(x-w/2,y-(z.boss?58:32),(z.life/z.maxLife)*w,6);
  }
}

function drawBullets(){
  ctx.fillStyle = "#ffe600";

  for(const b of story.bullets){
    ctx.beginPath();
    ctx.arc(b.x-story.cam.x,b.y-story.cam.y,4,0,Math.PI*2);
    ctx.fill();
  }
}

function drawCorpses(){
  for(const c of story.corpses){
    const x = c.x-story.cam.x;
    const y = c.y-story.cam.y;

    ctx.fillStyle = "rgba(150,0,0,.6)";
    ctx.beginPath();
    ctx.ellipse(x,y,c.boss?60:32,c.boss?34:18,c.angle,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle = "#250000";
    ctx.beginPath();
    ctx.ellipse(x,y,c.boss?34:18,c.boss?18:10,c.angle,0,Math.PI*2);
    ctx.fill();
  }
}

function drawHUD(){
  const p = story.player;

  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,.72)";
  ctx.fillRect(14,14,270,130);

  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.strokeRect(14,14,270,130);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 15px Arial";
  ctx.fillText("THE MAN",30,40);

  ctx.fillStyle = "#333";
  ctx.fillRect(30,55,185,14);

  ctx.fillStyle = "#2ee66b";
  ctx.fillRect(30,55,(p.life/p.maxLife)*185,14);

  ctx.fillStyle = "white";
  ctx.font = "13px Arial";
  ctx.fillText("HP "+Math.floor(p.life)+"/"+p.maxLife,30,88);
  ctx.fillText("MISSÃO "+story.mission+"/20",30,108);
  ctx.fillText("KILLS "+story.kills+"/"+story.objectiveKills,130,108);
  ctx.fillText("DANO x"+story.gunDamage,30,128);

  ctx.fillStyle = "#ddd";
  ctx.font = "12px Arial";
  ctx.fillText(story.message,30,155);

  ctx.restore();
}

function drawLockpick(){
  ctx.fillStyle = "rgba(0,0,0,.82)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "bold 30px Arial";
  ctx.fillText("LOCKPICK",canvas.width/2,190);

  ctx.fillStyle = "#333";
  ctx.fillRect(canvas.width/2-140,250,280,30);

  ctx.fillStyle = "#00ff66";
  ctx.fillRect(canvas.width/2-140,250,story.lockProgress*2.8,30);

  ctx.strokeStyle = "white";
  ctx.strokeRect(canvas.width/2-140,250,280,30);

  ctx.font = "17px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("TOQUE NO BOTÃO 🔥 ATÉ ABRIR",canvas.width/2,330);
}