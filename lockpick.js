let lockpickActive = false;
let lockpickProgress = 0;
let lockpickMissionComplete = false;

function startLockpick(){

lockpickActive = true;
lockpickProgress = 0;

}

function updateLockpick(){

if(lockpickProgress >= 100){

lockpickActive = false;

lockpickMissionComplete = true;

nextMission();

}

}

function clickLockpick(){

if(!lockpickActive) return;

lockpickProgress += 2;

if(lockpickProgress > 100){
lockpickProgress = 100;
}

}

function drawLockpick(){

if(!lockpickActive) return;

ctx.fillStyle =
"rgba(0,0,0,.85)";

ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);

ctx.fillStyle="white";

ctx.textAlign="center";

ctx.font="bold 32px Arial";

ctx.fillText(
"LOCKPICK",
canvas.width/2,
160
);

ctx.fillStyle="#333";

ctx.fillRect(
canvas.width/2-150,
240,
300,
30
);

ctx.fillStyle="#00ff55";

ctx.fillRect(
canvas.width/2-150,
240,
lockpickProgress*3,
30
);

ctx.strokeStyle="white";

ctx.strokeRect(
canvas.width/2-150,
240,
300,
30
);

ctx.fillStyle="white";

ctx.font="20px Arial";

ctx.fillText(
lockpickProgress+"%",
canvas.width/2,
300
);

ctx.fillStyle="#7a0000";

ctx.fillRect(
canvas.width/2-120,
360,
240,
70
);

ctx.fillStyle="white";

ctx.font="bold 24px Arial";

ctx.fillText(
"LOCKPICK",
canvas.width/2,
405
);

}

function handleLockpickClick(x,y){

if(!lockpickActive) return;

if(

x > canvas.width/2-120 &&
x < canvas.width/2+120 &&

y > 360 &&
y < 430

){

clickLockpick();

}

}