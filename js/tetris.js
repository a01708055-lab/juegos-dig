const COLS=10,ROWS=20,SZ=30;
const cv=document.getElementById('board'),ctx=cv.getContext('2d');
const nx=document.getElementById('next'),nctx=nx.getContext('2d');
const COLORS={I:'#00e5ff',O:'#ffe600',T:'#c724ff',S:'#39ff14',Z:'#ff2b2b',J:'#3b7bff',L:'#ff9a00'};
const SHAPES={I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1],[0,0,0]],S:[[0,1,1],[1,1,0],[0,0,0]],Z:[[1,1,0],[0,1,1],[0,0,0]],J:[[1,0,0],[1,1,1],[0,0,0]],L:[[0,0,1],[1,1,1],[0,0,0]]};
let grid,cur,next,score,lines,level,dropCounter,lastTime,running=false,paused=false,raf;
let best=parseInt(localStorage.getItem('tetris_best')||'0');document.getElementById('tBest').textContent=best;
const sEl=document.getElementById('tScore'),lEl=document.getElementById('tLines'),lvEl=document.getElementById('tLevel');
function emptyGrid(){return Array.from({length:ROWS},()=>Array(COLS).fill(0));}
function newPiece(){const k=Object.keys(SHAPES)[Math.floor(Math.random()*7)];return {m:SHAPES[k].map(r=>[...r]),c:COLORS[k],x:3,y:0,type:k};}
function reset(){grid=emptyGrid();score=0;lines=0;level=1;cur=newPiece();next=newPiece();dropCounter=0;lastTime=0;upd();}
function upd(){sEl.textContent=score;lEl.textContent=lines;lvEl.textContent=level;}
function collide(m,px,py){for(let y=0;y<m.length;y++)for(let x=0;x<m[y].length;x++){if(m[y][x]){const nx2=px+x,ny2=py+y;if(nx2<0||nx2>=COLS||ny2>=ROWS||(ny2>=0&&grid[ny2][nx2]))return true;}}return false;}
function merge(){cur.m.forEach((r,y)=>r.forEach((v,x)=>{if(v&&cur.y+y>=0)grid[cur.y+y][cur.x+x]=cur.c;}));}
function rotate(m){return m[0].map((_,i)=>m.map(r=>r[i]).reverse());}
function tryRotate(){const r=rotate(cur.m);if(!collide(r,cur.x,cur.y))cur.m=r;else if(!collide(r,cur.x-1,cur.y)){cur.x--;cur.m=r;}else if(!collide(r,cur.x+1,cur.y)){cur.x++;cur.m=r;}}
function clearLines(){let n=0;for(let y=ROWS-1;y>=0;y--){if(grid[y].every(c=>c)){grid.splice(y,1);grid.unshift(Array(COLS).fill(0));n++;y++;}}if(n){lines+=n;score+=[0,40,100,300,1200][n]*level;level=Math.floor(lines/10)+1;if(score>best){best=score;localStorage.setItem('tetris_best',best);document.getElementById('tBest').textContent=best;}}}
function drop(){cur.y++;if(collide(cur.m,cur.x,cur.y)){cur.y--;merge();clearLines();cur=next;next=newPiece();if(collide(cur.m,cur.x,cur.y)){over();return;}}dropCounter=0;upd();}
function hardDrop(){while(!collide(cur.m,cur.x,cur.y+1))cur.y++;drop();draw();}
function over(){running=false;cancelAnimationFrame(raf);document.getElementById('tFinal').textContent=score+' PTS • NIVEL '+level;document.getElementById('tOverlay').classList.add('show');}
function drawCell(c,x,y,color,ghost=false){c.fillStyle=ghost?'rgba(255,255,255,.15)':color;c.fillRect(x*SZ+1,y*SZ+1,SZ-2,SZ-2);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(x*SZ+1,y*SZ+1,SZ-2,4);}
function draw(){
  ctx.fillStyle='#000';ctx.fillRect(0,0,cv.width,cv.height);
  grid.forEach((r,y)=>r.forEach((col,x)=>{if(col)drawCell(ctx,x,y,col);}));
  // ghost
  let gy=cur.y;while(!collide(cur.m,cur.x,gy+1))gy++;
  cur.m.forEach((row,y)=>row.forEach((v,x)=>{if(v&&gy+y>=0)drawCell(ctx,cur.x+x,gy+y,'#fff',true);}));
  cur.m.forEach((row,y)=>row.forEach((v,x)=>{if(v&&cur.y+y>=0)drawCell(ctx,cur.x+x,cur.y+y,cur.c);}));
  nctx.fillStyle='#000';nctx.fillRect(0,0,120,120);
  next.m.forEach((row,y)=>row.forEach((v,x)=>{if(v){nctx.fillStyle=next.c;nctx.fillRect(20+x*24,20+y*24,22,22);}}));
}
function loop(t){if(!running)return;if(!paused){const interval=Math.max(100,800-(level-1)*70);dropCounter+=t-lastTime;if(dropCounter>interval)drop();draw();}lastTime=t;raf=requestAnimationFrame(loop);}
function start(){reset();document.getElementById('tOverlay').classList.remove('show');running=true;paused=false;lastTime=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);}
document.addEventListener('keydown',e=>{
  if(!running)return;
  if(e.key==='ArrowLeft'){if(!collide(cur.m,cur.x-1,cur.y))cur.x--;}
  else if(e.key==='ArrowRight'){if(!collide(cur.m,cur.x+1,cur.y))cur.x++;}
  else if(e.key==='ArrowDown'){drop();}
  else if(e.key==='ArrowUp'){tryRotate();}
  else if(e.key===' '){e.preventDefault();hardDrop();}
  else if(e.key.toLowerCase()==='p'){paused=!paused;}
  draw();
});
document.getElementById('tStart').onclick=start;
document.getElementById('tAgain').onclick=start;
document.getElementById('tReset').onclick=start;
document.getElementById('tPause').onclick=()=>paused=!paused;
const bind=(id,fn)=>document.getElementById(id).addEventListener('click',()=>{if(running&&!paused){fn();draw();}});
bind('mLeft',()=>{if(!collide(cur.m,cur.x-1,cur.y))cur.x--;});
bind('mRight',()=>{if(!collide(cur.m,cur.x+1,cur.y))cur.x++;});
bind('mRot',tryRotate);bind('mDown',drop);bind('mDrop',hardDrop);
document.getElementById('mPause').onclick=()=>paused=!paused;
reset();draw();
