const cv=document.getElementById('pong'),ctx=cv.getContext('2d');
const W=800,H=450,WIN=5;
let you,cpu,ball,rally,running=false,paused=false,raf,keys={};
const sYou=document.getElementById('sYou'),sCpu=document.getElementById('sCpu'),sRally=document.getElementById('sRally');
function reset(){you={x:14,y:H/2-45,w:14,h:90,score:0,dy:6};cpu={x:W-28,y:H/2-45,w:14,h:90,score:0,speed:4.2};rally=0;ball={x:W/2,y:H/2,vx:5*(Math.random()>.5?1:-1),vy:(Math.random()*4-2),r:9};hud();}
function hud(){sYou.textContent=you.score;sCpu.textContent=cpu.score;sRally.textContent=rally;document.getElementById('hYou').textContent=you.score;document.getElementById('hCpu').textContent=cpu.score;}
function serve(dir){ball={x:W/2,y:H/2,vx:5*dir,vy:(Math.random()*6-3),r:9};rally=0;hud();}
function beep(f){try{const a=new (window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=f;o.type='square';g.gain.value=.05;o.start();o.stop(a.currentTime+.08);}catch(e){}}
function update(){
  if(keys['w']||keys['arrowup'])you.y-=you.dy;
  if(keys['s']||keys['arrowdown'])you.y+=you.dy;
  you.y=Math.max(0,Math.min(H-you.h,you.y));
  // CPU IA con error
  const target=ball.y-45;
  if(Math.abs(cpu.y-target)>6)cpu.y+=Math.sign(target-cpu.y)*cpu.speed;
  cpu.y=Math.max(0,Math.min(H-cpu.h,cpu.y));
  ball.x+=ball.vx;ball.y+=ball.vy;
  if(ball.y<ball.r||ball.y>H-ball.r){ball.vy*=-1;beep(300);}
  // paletas
  if(ball.x-ball.r<you.x+you.w&&ball.y>you.y&&ball.y<you.y+you.h&&ball.vx<0){
    const rel=(ball.y-(you.y+you.h/2))/(you.h/2);ball.vx=Math.abs(ball.vx)*1.06;ball.vy=rel*5;rally++;beep(600);
  }
  if(ball.x+ball.r>cpu.x&&ball.y>cpu.y&&ball.y<cpu.y+cpu.h&&ball.vx>0){
    const rel=(ball.y-(cpu.y+cpu.h/2))/(cpu.h/2);ball.vx=-Math.abs(ball.vx)*1.06;ball.vy=rel*5;rally++;beep(500);
  }
  if(ball.x<-20){cpu.score++;hud();beep(150);if(cpu.score>=WIN)return end(false);serve(1);}
  if(ball.x>W+20){you.score++;hud();beep(800);if(you.score>=WIN)return end(true);serve(-1);}
  hud();
}
function draw(){
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#222';ctx.setLineDash([10,10]);ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);
  ctx.shadowBlur=14;
  ctx.fillStyle='#39ff14';ctx.shadowColor='#39ff14';ctx.fillRect(you.x,you.y,you.w,you.h);
  ctx.fillStyle='#ff2b2b';ctx.shadowColor='#ff2b2b';ctx.fillRect(cpu.x,cpu.y,cpu.w,cpu.h);
  ctx.fillStyle='#ffe600';ctx.shadowColor='#ffe600';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,7);ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='#fff';ctx.font='16px "Press Start 2P"';ctx.textAlign='center';ctx.fillText(you.score+' : '+cpu.score,W/2,36);
}
function loop(){if(!running||paused)return;update();draw();raf=requestAnimationFrame(loop);}
function start(){document.getElementById('pOverlay').classList.remove('show');reset();running=true;paused=false;cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);}
function end(win){
  running=false;cancelAnimationFrame(raf);draw();
  document.getElementById('pTitle').textContent=win?'¡GANASTE! ★':'CPU GANA';
  document.getElementById('pTitle').style.color=win?'#39ff14':'#ff2b2b';
  document.getElementById('pSub').textContent=you.score+' - '+cpu.score;
  document.getElementById('pOverlay').classList.add('show');
}
document.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(k==='arrowup'||k==='w'||k==='arrowdown'||k==='s'||k==='arrowleft'||k==='a'||k==='arrowright'||k==='d'){e.preventDefault();if(!running){start();return;}}
  if(k===' '){e.preventDefault();if(!running){start();return;}}
  keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='p'&&running)paused=!paused;if(paused||!running)return;if(!running)return;});
document.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
cv.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();const y=(e.clientY-r.top)*(H/r.height);you.y=y-you.h/2;you.y=Math.max(0,Math.min(H-you.h,you.y));});
cv.addEventListener('touchmove',e=>{e.preventDefault();const r=cv.getBoundingClientRect();const y=(e.touches[0].clientY-r.top)*(H/r.height);you.y=y-you.h/2;},{passive:false});
document.getElementById('pStart').onclick=start;
document.getElementById('pAgain').onclick=start;
document.getElementById('pReset').onclick=start;
document.getElementById('pPause').onclick=()=>{if(!running)return;paused=!paused;if(!paused)raf=requestAnimationFrame(loop);};
reset();draw();
