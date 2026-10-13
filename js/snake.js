const cv=document.getElementById('game'),ctx=cv.getContext('2d');
const N=20,CELL=20;
let snake,dir,nextDir,food,score,speed,loop,running=false,paused=false;
const scoreEl=document.getElementById('score'),lenEl=document.getElementById('len'),speedEl=document.getElementById('speed');
const overlay=document.getElementById('overlay'),ovScore=document.getElementById('ovScore'),ovTitle=document.getElementById('ovTitle');
let best=parseInt(localStorage.getItem('snake_best')||'0');document.getElementById('best').textContent=best;

function reset(){snake=[{x:10,y:10}];dir={x:1,y:0};nextDir={x:1,y:0};score=0;speed=1;placeFood();updateHUD();}
function placeFood(){while(true){const f={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)};if(!snake.some(s=>s.x===f.x&&s.y===f.y)){food=f;break;}}}
function updateHUD(){scoreEl.textContent=score;lenEl.textContent=snake.length;speedEl.textContent=speed;}
function tick(){
  if(paused) return;
  dir=nextDir;
  const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
  if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.some(s=>s.x===h.x&&s.y===h.y)){gameOver();return;}
  snake.unshift(h);
  if(h.x===food.x&&h.y===food.y){score+=10;if(snake.length%4===0){speed++;restartLoop();}placeFood();}
  else snake.pop();
  updateHUD();draw();
}
function draw(){
  ctx.fillStyle='#000';ctx.fillRect(0,0,400,400);
  ctx.strokeStyle='#111';for(let i=0;i<=N;i++){ctx.beginPath();ctx.moveTo(i*CELL,0);ctx.lineTo(i*CELL,400);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*CELL);ctx.lineTo(400,i*CELL);ctx.stroke();}
  ctx.fillStyle='#39ff14';ctx.shadowColor='#39ff14';ctx.shadowBlur=12;
  ctx.fillRect(food.x*CELL+3,food.y*CELL+3,CELL-6,CELL-6);ctx.shadowBlur=0;
  snake.forEach((s,i)=>{ctx.fillStyle=i===0?'#ffe600':'#39ff14';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8;ctx.fillRect(s.x*CELL+1,s.y*CELL+1,CELL-2,CELL-2);ctx.shadowBlur=0;
    if(i===0){ctx.fillStyle='#000';ctx.fillRect(s.x*CELL+5,s.y*CELL+5,3,3);ctx.fillRect(s.x*CELL+12,s.y*CELL+5,3,3);}});
}
function restartLoop(){clearInterval(loop);loop=setInterval(tick,Math.max(60,150-(speed-1)*12));}
function start(){reset();clearInterval(loop);restartLoop();running=true;paused=false;overlay.classList.remove('show');draw();}
function gameOver(){
  clearInterval(loop);running=false;
  if(score>best){best=score;localStorage.setItem('snake_best',best);document.getElementById('best').textContent=best;ovTitle.textContent='★ NEW RECORD ★';}
  else ovTitle.textContent='GAME OVER';
  ovScore.textContent='SCORE '+score+' • BEST '+best;
  overlay.classList.add('show');
  beep(150,300);
}
function beep(f,d){try{const a=new (window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=f;o.type='square';g.gain.value=.05;o.start();o.stop(a.currentTime+d/1000);}catch(e){}}
function setDir(x,y){if(snake.length>1&&dir.x===-x&&dir.y===-y)return;nextDir={x,y};}
document.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(k==='arrowup'||k==='w')setDir(0,-1);
  else if(k==='arrowdown'||k==='s')setDir(0,1);
  else if(k==='arrowleft'||k==='a')setDir(-1,0);
  else if(k==='arrowright'||k==='d')setDir(1,0);
  else if(k===' '){e.preventDefault();running?paused=!paused:start();}
  else if(k==='p'&&running)paused=!paused;
});
document.querySelectorAll('.mobile-pad button').forEach(b=>b.addEventListener('click',()=>{const d=b.dataset.dir;if(d==='up')setDir(0,-1);if(d==='down')setDir(0,1);if(d==='left')setDir(-1,0);if(d==='right')setDir(1,0);}));
document.getElementById('startBtn').onclick=start;
document.getElementById('againBtn').onclick=start;
document.getElementById('resetBtn').onclick=start;
document.getElementById('pauseBtn').onclick=()=>{if(running)paused=!paused;};
reset();draw();
