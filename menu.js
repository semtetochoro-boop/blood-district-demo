const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameState = "menu";

function drawButton(text,x,y){

ctx.fillStyle="#180000";
ctx.fillRect(x,y,280,65);

ctx.strokeStyle="#b00000";
ctx.lineWidth=3;
ctx.strokeRect(x,y,280,65);

ctx.fillStyle="white";
ctx.textAlign="center";
ctx.font="bold 22px Arial";

ctx.fillText(
text,
x+140,
y+42
);

}

function drawMenu(){

ctx.fillStyle="#030000";
ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);

ctx.textAlign="center";

ctx.shadowColor="red";
ctx.shadowBlur=25;

ctx.fillStyle="#c00000";
ctx.font="bold 44px Impact";

ctx.fillText(
"BLOOD",
canvas.width/2,
110
);

ctx.fillStyle="white";
ctx.font="bold 30px Impact";

ctx.fillText(
"DISTRICT",
canvas.width/2,
150
);

ctx.shadowBlur=0;

if(gameState==="menu"){

drawButton(
"HISTORY",
canvas.width/2-140,
280
);

drawButton(
"// DESENVOLVENDO //",
canvas.width/2-140,
370
);

}

if(gameState==="history"){

ctx.fillStyle="white";
ctx.font="bold 24px Arial";

ctx.fillText(
"HISTORY MODE",
canvas.width/2,
230
);

drawButton(
"NEW SAVE",
canvas.width/2-140,
300
);

drawButton(
"CONTINUE",
canvas.width/2-140,
390
);

drawButton(
"VOLTAR",
canvas.width/2-140,
480
);

}

}

function inside(x,y,bx,by){

return(

x>bx &&
x<bx+280 &&

y>by &&
y<by+65

);

}

function handleClick(x,y){

if(gameState==="menu"){

if(
inside(
x,
y,
canvas.width/2-140,
280
)
){

gameState="history";

}

}

else if(gameState==="history"){

if(
inside(
x,
y,
canvas.width/2-140,
300
)
){

const save=createNewSave();

if(
typeof startStory==="function"
){

startStory(save);

}

gameState="story";

}

if(
inside(
x,
y,
canvas.width/2-140,
390
)
){

if(hasSave()){

const save=
loadSave();

if(
typeof startStory==="function"
){

startStory(save);

}

gameState="story";

}

}

if(
inside(
x,
y,
canvas.width/2-140,
480
)
){

gameState="menu";

}

}

}

canvas.addEventListener(
"click",
e=>{

handleClick(
e.clientX,
e.clientY
);

}
);

canvas.addEventListener(
"touchstart",
e=>{

const t=e.touches[0];

handleClick(
t.clientX,
t.clientY
);

}
);

function loop(){

if(
gameState==="story"
){

if(
typeof updateStory==="function"
){
updateStory();
}

if(
typeof renderStory==="function"
){
renderStory();
}

}else{

drawMenu();

}

requestAnimationFrame(loop);

}

loop();