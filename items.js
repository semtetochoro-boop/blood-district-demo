function createMissionUpgrade(mission){
  if(mission === 2){
    return {
      type:"gun",
      text:"UPGRADE DE PISTOLA",
      x:900,
      y:520,
      taken:false
    };
  }

  if(mission === 5){
    return {
      type:"life",
      text:"UPGRADE DE VIDA",
      x:900,
      y:520,
      taken:false
    };
  }

  if(mission === 7){
    return {
      type:"gun",
      text:"UPGRADE DE PISTOLA",
      x:900,
      y:520,
      taken:false
    };
  }

  if(mission === 9){
    return {
      type:"life",
      text:"UPGRADE DE VIDA",
      x:900,
      y:520,
      taken:false
    };
  }

  if(mission === 15){
    return {
      type:"life",
      text:"UPGRADE DE VIDA",
      x:900,
      y:520,
      taken:false
    };
  }

  return null;
}

function drawUpgrade(story){
  const item = story.upgrade;

  if(!item || item.taken) return;

  const x = item.x - story.cam.x;
  const y = item.y - story.cam.y;

  ctx.save();

  ctx.shadowColor = item.type === "gun" ? "#00aaff" : "#00ff66";
  ctx.shadowBlur = 20;

  ctx.fillStyle = item.type === "gun" ? "#0077ff" : "#00aa44";
  ctx.beginPath();
  ctx.arc(x,y,22,0,Math.PI*2);
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.fillStyle = "white";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(item.type === "gun" ? "🔫" : "❤️",x,y+7);

  ctx.restore();
}

function checkUpgradePickup(story){
  const item = story.upgrade;

  if(!item || item.taken) return;

  const p = story.player;
  const dist = Math.hypot(p.x-item.x,p.y-item.y);

  if(dist < 45){
    item.taken = true;

    if(item.type === "gun"){
      story.gunDamage *= 2;
      story.message = "UPGRADE DE PISTOLA: dano x2!";
    }

    if(item.type === "life"){
      p.maxLife = Math.floor(p.maxLife * 1.5);
      p.life = p.maxLife;
      story.message = "UPGRADE DE VIDA: vida máxima aumentada!";
    }

    const save = loadSave() || createNewSave();
    save.mission = story.mission;
    save.maxLife = p.maxLife;
    save.currentLife = p.life;
    save.gunDamage = story.gunDamage;
    localStorage.setItem("bloodDistrictSave",JSON.stringify(save));
  }
}