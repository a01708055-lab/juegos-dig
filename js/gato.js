const board=document.getElementById('board'),turnEl=document.getElementById('turn');
const sx=document.getElementById('sx'),so=document.getElementById('so'),sd=document.getElementById('sd');
let cells,turn,mode='cpu',lock=false;
let score={X:0,O:0,D:0};
const WINS=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function init(){cells=Array(9).fill('');board.innerHTML='';cells.forEach((_,i)=>{const d=document.createElement('div');d.className='cell';d.addEventListener('click',()=>move(i));board.appendChild(d);});turn='X';lock=false;render();}
function render(){
  [...board.children].forEach((d,i)=>{d.textContent=cells[i];d.classList.toggle('x',cells[i]==='X');d.classList.toggle('o',cells[i]==='O');});
  turnEl.textContent='TURNO: '+turn;turnEl.style.borderColor=turn==='X'?'#ff2fb3':'#00e5ff';turnEl.style.color=turn==='X'?'#ff2fb3':'#00e5ff';
  sx.textContent=score.X;so.textContent=score.O;sd.textContent=score.D;
}
function winner(b){for(const w of WINS){const [a,c,d]=w;if(b[a]&&b[a]===b[c]&&b[a]===b[d])return {p:b[a],line:w};}return b.every(v=>v)?{p:'D',line:[]}:null;}
function move(i){
  if(cells[i]||lock)return;
  const w0=winner(cells);if(w0)return;
  cells[i]=turn;beep(turn==='X'?600:400);
  let w=winner(cells);
  if(w){finish(w);return;}
  turn=turn==='X'?'O':'X';render();
  if(mode==='cpu'&&turn==='O'){lock=true;setTimeout(()=>{cpu();lock=false;},350);}
}
function cpu(){
  // win > block > center > random
  const empty=cells.map((v,i)=>v?null:i).filter(v=>v!==null);
  const tryWin=(p)=>{for(const e of empty){const t=[...cells];t[e]=p;if(winner(t)?.p===p)return e;}return null;};
  let pick=tryWin('O')??tryWin('X')??(cells[4]===''?4:null)??empty[Math.floor(Math.random()*empty.length)];
  if(pick==null)return;
  cells[pick]='O';beep(400);
  let w=winner(cells);
  if(w){finish(w);return;}
  turn='X';render();
}
function finish(w){
  if(w.p==='D'){score.D++;}
  else{score[w.p]++;w.line.forEach(i=>board.children[i].classList.add('win'));}
  sx.textContent=score.X;so.textContent=score.O;sd.textContent=score.D;
  turnEl.textContent = w.p==='D' ? 'EMPATE — OTRA RONDA...' : '¡GANA '+w.p+'! — OTRA RONDA...';
  turnEl.style.borderColor = w.p==='O' ? '#00e5ff' : '#ff2fb3';
  turnEl.style.color = w.p==='O' ? '#00e5ff' : '#ff2fb3';
  lock=true;
  setTimeout(()=>{init();},1400);
}
function beep(f){try{const a=new (window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=f;o.type='square';g.gain.value=.06;o.start();o.stop(a.currentTime+.12);}catch(e){}}
document.getElementById('modePvp').onclick=()=>{mode='pvp';init();};
document.getElementById('modeCpu').onclick=()=>{mode='cpu';init();};
document.getElementById('resetRound').onclick=init;
document.getElementById('resetAll').onclick=()=>{score={X:0,O:0,D:0};init();};
init();
