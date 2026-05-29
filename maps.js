function createMissionMap(mission){
  const boss = mission === 10 || mission === 20;

  if(boss){
    return createBossMap(mission);
  }

  const type = ((mission - 1) % 4) + 1;

  if(type === 1) return createMapType1(mission);
  if(type === 2) return createMapType2(mission);
  if(type === 3) return createMapType3(mission);
  return createMapType4(mission);
}

function createBossMap(mission){
  return {
    type:"boss",
    floor:"metal",
    playerStart:{x:500,y:600},
    door:{x:1450,y:600,w:90,h:150,open:false},
    bossSpawn:{x:1100,y:600},
    zombieSpawns:[],
    walls:[
      {x:250,y:250,w:1400,h:40},
      {x:250,y:950,w:1400,h:40},
      {x:250,y:250,w:40,h:740},
      {x:1650,y:250,w:40,h:740},

      {x:650,y:450,w:120,h:40},
      {x:650,y:730,w:120,h:40},
      {x:1050,y:450,w:120,h:40},
      {x:1050,y:730,w:120,h:40}
    ]
  };
}

function createMapType1(mission){
  return {
    type:"house",
    floor:"wood",
    playerStart:{x:500,y:550},
    door:{x:1350,y:550,w:80,h:120,open:false},
    zombieSpawns:[
      {x:850,y:400},
      {x:950,y:650},
      {x:1150,y:500},
      {x:700,y:750}
    ],
    walls:[
      {x:250,y:250,w:1200,h:35},
      {x:250,y:850,w:1200,h:35},
      {x:250,y:250,w:35,h:635},
      {x:1450,y:250,w:35,h:635},

      {x:600,y:250,w:35,h:230},
      {x:600,y:610,w:35,h:240},
      {x:900,y:450,w:35,h:250}
    ]
  };
}

function createMapType2(mission){
  return {
    type:"corridor",
    floor:"wood",
    playerStart:{x:450,y:500},
    door:{x:1500,y:500,w:80,h:120,open:false},
    zombieSpawns:[
      {x:850,y:500},
      {x:1100,y:400},
      {x:1200,y:620},
      {x:1350,y:500}
    ],
    walls:[
      {x:250,y:300,w:1350,h:35},
      {x:250,y:750,w:1350,h:35},
      {x:250,y:300,w:35,h:485},
      {x:1600,y:300,w:35,h:485},

      {x:700,y:300,w:35,h:230},
      {x:1000,y:520,w:35,h:230},
      {x:1300,y:300,w:35,h:230}
    ]
  };
}

function createMapType3(mission){
  return {
    type:"storage",
    floor:"wood",
    playerStart:{x:500,y:700},
    door:{x:1400,y:380,w:80,h:120,open:false},
    zombieSpawns:[
      {x:800,y:420},
      {x:1000,y:700},
      {x:1200,y:520},
      {x:900,y:850}
    ],
    walls:[
      {x:250,y:250,w:1250,h:35},
      {x:250,y:950,w:1250,h:35},
      {x:250,y:250,w:35,h:735},
      {x:1500,y:250,w:35,h:735},

      {x:550,y:500,w:220,h:45},
      {x:950,y:350,w:220,h:45},
      {x:1000,y:760,w:280,h:45}
    ]
  };
}

function createMapType4(mission){
  return {
    type:"apartment",
    floor:"wood",
    playerStart:{x:420,y:420},
    door:{x:1450,y:800,w:80,h:120,open:false},
    zombieSpawns:[
      {x:800,y:350},
      {x:900,y:720},
      {x:1200,y:430},
      {x:1250,y:850}
    ],
    walls:[
      {x:250,y:250,w:1300,h:35},
      {x:250,y:950,w:1300,h:35},
      {x:250,y:250,w:35,h:735},
      {x:1550,y:250,w:35,h:735},

      {x:650,y:250,w:35,h:300},
      {x:650,y:700,w:35,h:250},
      {x:1050,y:250,w:35,h:250},
      {x:1050,y:620,w:35,h:330}
    ]
  };
}

function drawMissionMap(story){
  const map = story.map;

  if(map.floor === "metal"){
    drawMetalFloor(story);
  }else{
    drawWoodFloorMap(story);
  }

  drawWalls(story);
}

function drawWoodFloorMap(story){
  ctx.fillStyle="#241209";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  const plankW = 170;
  const plankH = 34;

  const startX = Math.floor(story.cam.x / plankW) * plankW;
  const startY = Math.floor(story.cam.y / plankH) * plankH;

  for(let y=startY;y<story.cam.y+canvas.height+plankH;y+=plankH){
    for(let x=startX;x<story.cam.x+canvas.width+plankW;x+=plankW){
      ctx.fillStyle = Math.floor(y/plankH)%2===0 ? "#3a2114" : "#4a2a18";
      ctx.fillRect(x-story.cam.x,y-story.cam.y,plankW,plankH);

      ctx.strokeStyle="#160904";
      ctx.strokeRect(x-story.cam.x,y-story.cam.y,plankW,plankH);
    }
  }
}

function drawMetalFloor(story){
  ctx.fillStyle="#14191d";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  for(let x=-1000;x<3000;x+=90){
    for(let y=-1000;y<3000;y+=90){
      ctx.strokeStyle="#2f3a42";
      ctx.strokeRect(x-story.cam.x,y-story.cam.y,90,90);
    }
  }
}

function drawWalls(story){
  for(const w of story.map.walls){
    ctx.fillStyle = story.map.floor === "metal" ? "#555f66" : "#2b1208";
    ctx.fillRect(w.x-story.cam.x,w.y-story.cam.y,w.w,w.h);

    ctx.strokeStyle = story.map.floor === "metal" ? "#9aa4aa" : "#120703";
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x-story.cam.x,w.y-story.cam.y,w.w,w.h);
  }
}

function collidesWithWalls(map,x,y,radius){
  for(const w of map.walls){
    if(
      x + radius > w.x &&
      x - radius < w.x + w.w &&
      y + radius > w.y &&
      y - radius < w.y + w.h
    ){
      return true;
    }
  }

  return false;
}