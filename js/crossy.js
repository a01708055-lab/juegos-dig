// CROSSY ROAD 16bits - el pollito cruza la calle
const cv=document.getElementById('crossy'),ctx=cv.getContext('2d');
const COLS=9,ROWS=11,CELL=50;
const W=COLS*CELL,H=ROWS*CELL;
let level,score,best,maxRow,chicken,lanes,running=false,paused=false,raf,cooldown=0;
best=parseInt(localStorage.getItem('crossy_best')||'0');document.getElementById('cBest').textContent=best;
const sEl=document.getElementById('cScore'),lEl=document.getElementById('cLevel'),pEl=document.getElementById('cProg');

const ROAD_ROWS=[1,2,4,5,7,8];
const LANE_COLORS=['#ff2b2b','#00e5ff','#ff9a00','#c724ff','#39ff14','#ff2fb3'];

function makeLanes(lv){
  return ROAD_ROWS.map((r,i)=>{
    const dir=i%2===0?1:-1;
    const speed=(1.2+Math.random()*1.2+lv*0.35)*dir;
    const n=2+Math.floor(Math.random()*2);
    const cars=[];
    for(let k=0;k<n;k++) cars.push({x:Math.random()*W, len:Math.random()<.3?2:1, col:LANE_COLORS[(i+k)%LANE_COLORS.length]});
    return {row:r,dir,speed,cars};
  });
}
function reset(full=true){
  if(full){level=1;score=0;}
  maxRow=ROWS-1;
  chicken={col:4,row:10,hop:0};
  lanes=makeLanes(level);
  upd();
}
function upd(){sEl.textContent=score;lEl.textContent=level;pEl.textContent=(10-maxRow)+'/10';}
function beep(f,d=.08){try{const a=new (window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=f;o.type='square';g.gain.value=.05;o.start();o.stop(a.currentTime+d);}catch(e){}}

function move(dc,dr){
  if(paused||cooldown>0)return;
  if(!running){start();return;}
  const nc=Math.max(0,Math.min(COLS-1,chicken.col+dc));
  const nr=Math.max(0,Math.min(ROWS-1,chicken.row+dr));
  chicken.col=nc;chicken.row=nr;chicken.hop=6;cooldown=8;
  beep(400+ (10-nr)*40,.06);
  if(nr<maxRow){maxRow=nr;score+=10;if(score>best){best=score;localStorage.setItem('crossy_best',best);document.getElementById('cBest').textContent=best;}}
  if(nr===0){ // meta superada
    score+=100;level++;beep(880,.2);
    setTimeout(()=>{chicken={col:4,row:10,hop:0};maxRow=ROWS-1;lanes=makeLanes(level);upd();},150);
  }
  upd();
}

function update(){
  if(cooldown>0)cooldown--;
  if(chicken.hop>0)chicken.hop--;
  for(const l of lanes){
    for(const car of l.cars){
      car.x+=l.speed;
      if(l.dir>0&&car.x>W+20)car.x=-car.len*CELL-20;
      if(l.dir<0&&car.x<-car.len*CELL-20)car.x=W+20;
    }
  }
  // colisión
  const cy=chicken.row*CELL;
  for(const l of lanes){
    if(l.row!==chicken.row)continue;
    const px=chicken.col*CELL+CELL/2;
    for(const car of l.cars){
      const x0=Math.min(car.x,car.x+car.len*CELL),x1=Math.max(car.x,car.x+car.len*CELL)+CELL*0+ (car.len*CELL);
      // car.x es borde izquierdo si dir>0, simplificamos a caja [car.x, car.x+len*CELL]
      const bx0=car.x, bx1=car.x+car.len*CELL;
      if(px>bx0+6&&px<bx1-6){ over(); return; }
    }
  }
}

function drawGrass(y){ctx.fillStyle=(Math.floor(y/CELL)%2===0)?'#0f5d00':'#0d4d00';ctx.fillRect(0,y,W,CELL);}
function drawRoad(y){ctx.fillStyle='#1a1a2e';ctx.fillRect(0,y,W,CELL);ctx.fillStyle='#ffe600';for(let x=0;x<W;x+=40)ctx.fillRect(x,y+CELL/2-2,20,4);}

function draw(){
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  for(let r=0;r<ROWS;r++){
    const y=r*CELL;
    if(r===0){ctx.fillStyle='#2a1a6e';ctx.fillRect(0,y,W,CELL);ctx.fillStyle='#39ff14';ctx.font='14px "Press Start 2P"';ctx.textAlign='center';ctx.fillText('★ META ★',W/2,y+32);}
    else if(ROAD_ROWS.includes(r))drawRoad(y);
    else drawGrass(y);
  }
  // autos
  for(const l of lanes){
    const y=l.row*CELL;
    for(const car of l.cars){
      const w=car.len*CELL-8;
      ctx.fillStyle='#000';ctx.fillRect(car.x-2,y+6,w+4,38);
      ctx.fillStyle=car.col;ctx.fillRect(car.x,y+8,w,30);
      ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(car.x,y+8,w,6);
      ctx.fillStyle='#000';
      ctx.fillRect(car.x+8,y+34,12,8);ctx.fillRect(car.x+w-20,y+34,12,8);
      ctx.fillStyle='#9ff';ctx.fillRect(car.x+(l.dir>0?w-14:4),y+14,10,10);
    }
  }
  // pollito
  const hopOff=chicken.hop>0?-chicken.hop:0;
  const x=chicken.col*CELL,y=chicken.row*CELL+hopOff;
  ctx.fillStyle='#000';ctx.fillRect(x+2,y+2,CELL-4,CELL-4);
  ctx.fillStyle='#ffe600';ctx.fillRect(x+10,y+10,30,28); // cuerpo
  ctx.fillRect(x+14,y+4,22,14); // cabeza
  ctx.fillStyle='#ff9a00';ctx.fillRect(x+21,y+14,8,6); // pico
  ctx.fillStyle='#000';ctx.fillRect(x+18,y+8,5,5);ctx.fillRect(x+28,y+8,5,5); // ojos
  ctx.fillStyle='#ff2b2b';ctx.fillRect(x+21,y+2,8,5); // cresta
  ctx.fillStyle='#ff9a00';ctx.fillRect(x+13,y+38,8,6);ctx.fillRect(x+29,y+38,8,6); // patas
}

function loop(){if(!running||paused)return;update();draw();raf=requestAnimationFrame(loop);}
function start(){document.getElementById('cOverlay').classList.remove('show');reset(true);running=true;paused=false;cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);}
function over(){
  running=false;cancelAnimationFrame(raf);draw();beep(140,.4);
  document.getElementById('cTitle').textContent='¡APLASTADO! 🐤💥';
  document.getElementById('cFinal').textContent=score+' PTS • NIVEL '+level;
  document.getElementById('cOverlay').classList.add('show');
}
document.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(k==='arrowup'||k==='w'){e.preventDefault();move(0,-1);}
  else if(k==='arrowdown'||k==='s'){e.preventDefault();move(0,1);}
  else if(k==='arrowleft'||k==='a'){e.preventDefault();move(-1,0);}
  else if(k==='arrowright'||k==='d'){e.preventDefault();move(1,0);}
  else if(k==='p'&&running){paused=!paused;if(!paused)raf=requestAnimationFrame(loop);}
  else if(k===' '){e.preventDefault();if(!running)start();}
});
const b=(id,dc,dr)=>document.getElementById(id).addEventListener('click',()=>move(dc,dr));
b('cUp',0,-1);b('cDown',0,1);b('cLeft',-1,0);b('cRight',1,0);
document.getElementById('cStart').onclick=start;
document.getElementById('cAgain').onclick=start;
document.getElementById('cReset').onclick=start;
document.getElementById('cPause').onclick=()=>{if(!running)return;paused=!paused;if(!paused)raf=requestAnimationFrame(loop);};
reset(true);draw();
