// Personajes 16bits: 4 bases + pelo/ropa/nombre + acciones + login
const BASES = [
  { id:0, name:'SKATER', skin:'#f1b98a', hairStyle:'corto', hairColor:'#222233', shirt:'#00bfa5', pants:'#21214d' },
  { id:1, name:'NINJA', skin:'#c98d5e', hairStyle:'largo', hairColor:'#ff2fb3', shirt:'#2a1a6e', pants:'#000000' },
  { id:2, name:'ROBOT', skin:'#b8c5d6', hairStyle:'mohawk', hairColor:'#39ff14', shirt:'#c724ff', pants:'#333344' },
  { id:3, name:'PUNK', skin:'#f1b98a', hairStyle:'gorra', hairColor:'#ff2b2b', shirt:'#ff2b2b', pants:'#1a1a1a' },
];
const HAIR_STYLES = ['corto','largo','mohawk','gorra'];
const HAIR_COLORS = ['#222233','#ff2fb3','#39ff14','#ff2b2b','#ffe600','#00e5ff'];
const SHIRT_COLORS = ['#00bfa5','#c724ff','#ff2b2b','#ff9a00','#00e5ff','#ffe600'];
const ACTIONS = ['idle','saludar','bailar','saltar'];
const KEY = 'arcade_player_v1';
const SES = 'arcade_session_v1';
let currentAction = 'idle';
let tick = 0;

function loadPlayer(){
  try{ const s=JSON.parse(localStorage.getItem(KEY)); if(s&&typeof s.baseId==='number') return s; }catch(e){}
  return { baseId:0, name:'SKATER', hairStyle:'corto', hairColor:'#222233', shirt:'#00bfa5' };
}
function savePlayer(p){ localStorage.setItem(KEY, JSON.stringify(p)); }
function fullConfig(p){ const b=BASES[p.baseId]||BASES[0]; return { skin:b.skin, pants:b.pants, hairStyle:p.hairStyle, hairColor:p.hairColor, shirt:p.shirt }; }
function currentName(p){ const b=BASES[p.baseId]||BASES[0]; return (p.name||b.name||'PLAYER').toUpperCase().slice(0,10); }

// Dibuja con acción. tick = frame. Compatible con llamadas viejas drawPlayer(canvas,cfg)
function drawPlayer(canvas, cfg, action='idle', t=0){
  if(!canvas) return;
  const c = canvas.getContext('2d');
  const S = canvas.width / 16;
  c.clearRect(0,0,canvas.width,canvas.height);
  c.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{ c.fillStyle=col; c.fillRect(Math.round(x*S),Math.round(y*S),Math.ceil(w*S),Math.ceil(h*S)); };
  const skin=cfg.skin, hair=cfg.hairColor, shirt=cfg.shirt, pants=cfg.pants;
  const f=Math.floor(t/6)%2; // parpadeo frames 0/1
  let dx=0, dy=0, armUp=false, leftUp=false, rightUp=false;

  if(action==='idle'){ dy = (Math.floor(t/30)%2===0)?0:-0.4; }
  if(action==='saludar'){ rightUp=true; dy=0; }
  if(action==='bailar'){ dx = f===0?-1:1; dy = f===0?0:-0.6; leftUp = f===0; rightUp = f===1; }
  if(action==='saltar'){ const ph=(t%36)/36; dy = -Math.sin(ph*Math.PI)*3; armUp=true; }

  c.save(); c.translate(dx*S, dy*S);
  // pelo
  if(cfg.hairStyle==='corto'){ R(4,1,8,3,hair); R(3,2,10,2,hair); }
  if(cfg.hairStyle==='largo'){ R(4,1,8,3,hair); R(3,2,10,7,hair); }
  if(cfg.hairStyle==='mohawk'){ R(7,0,2,5,hair); R(4,2,8,2,hair); }
  if(cfg.hairStyle==='gorra'){ R(4,1,8,3,hair); R(3,3,12,1,hair); R(11,3,3,1,hair); }
  // cara
  R(4,3,8,6,skin);
  if(cfg.hairStyle==='largo'){ R(5,4,6,5,skin); }
  R(6,5,1,1,'#000'); R(9,5,1,1,'#000');
  // boca: sonríe al saludar/bailar
  if(action==='saludar'||action==='bailar'){ R(6,7,4,1,'#000'); R(7,7,2,1,'#fff'); }
  else { R(7,7,2,1,'#7a3b1e'); }
  // cuerpo
  R(4,9,8,4,shirt);
  R(4,9,8,1,'rgba(255,255,255,.35)');
  // brazos según acción
  if(armUp||(leftUp&&rightUp)){ R(2,6,2,4,skin); R(12,6,2,4,skin); }
  else if(rightUp){ R(2,9,2,4,skin); R(12,6,2,4,skin); if(f===0) R(12,5,2,1,skin); }
  else if(leftUp){ R(2,6,2,4,skin); R(12,9,2,4,skin); }
  else if(action==='bailar'){ R(2,9+f,2,4,skin); R(12,9+(1-f),2,4,skin); }
  else { R(2,9,2,4,skin); R(12,9,2,4,skin); }
  R(2,9,2,1,shirt); R(12,9,2,1,shirt);
  // piernas: alternan al bailar
  if(action==='bailar'){ if(f===0){ R(3,13,4,2,pants); R(9,13,3,2,pants); } else { R(4,13,3,2,pants); R(8,13,4,2,pants); } }
  else { R(4,13,3,2,pants); R(9,13,3,2,pants); }
  R(3,15,4,1,'#fff'); R(9,15,4,1,'#fff');
  c.restore();
}

function beepSel(f=700){ try{ const a=new (window.AudioContext||window.webkitAudioContext)(); const o=a.createOscillator(),g=a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.value=f; o.type='square'; g.gain.value=.05; o.start(); o.stop(a.currentTime+.09);}catch(e){} }

// --- pantallas login / arcade ---
function showArcade(){
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('arcadeScreen').style.display='block';
  document.getElementById('logoutBtn').style.display='inline-block';
  const p=loadPlayer();
  document.getElementById('welcomeName').textContent=currentName(p);
  document.getElementById('welcomeInfo').textContent=`${BASES[p.baseId].name} • PELO ${p.hairStyle.toUpperCase()}`;
  drawPlayer(document.getElementById('welcomeMini'), fullConfig(p));
  paintHUDMini();
  window.scrollTo(0,0);
}
function showLogin(){
  document.getElementById('loginScreen').style.display='block';
  document.getElementById('arcadeScreen').style.display='none';
  document.getElementById('logoutBtn').style.display='none';
}

(function initIndex(){
  const grid=document.getElementById('charGrid');
  if(!grid){ paintHUDMini(); return; }
  let p=loadPlayer();
  const hairStylesEl=document.getElementById('hairStyles'), hairColorsEl=document.getElementById('hairColors'), shirtColorsEl=document.getElementById('shirtColors'), actionRow=document.getElementById('actionRow');
  const inpName=document.getElementById('inpName'), big=document.getElementById('bigPreview'), prevName=document.getElementById('previewName'), actionTag=document.getElementById('actionTag');
  inpName.value = p.name===BASES[p.baseId].name?'':p.name;

  function refresh(){
    drawPlayer(big, fullConfig(p), currentAction, tick);
    prevName.textContent=currentName(p);
    actionTag.textContent=currentAction.toUpperCase()+' ▶';
    document.getElementById('hudPlayerName').textContent=currentName(p);
    drawPlayer(document.getElementById('hudMini'), fullConfig(p));
    [...grid.children].forEach((card,i)=>{
      card.classList.toggle('selected', i===p.baseId);
      drawPlayer(card.querySelector('canvas'), fullConfig({...p,baseId:i,hairStyle:i===p.baseId?p.hairStyle:BASES[i].hairStyle,hairColor:i===p.baseId?p.hairColor:BASES[i].hairColor,shirt:i===p.baseId?p.shirt:BASES[i].shirt}));
    });
    [...hairStylesEl.children].forEach(b=>b.classList.toggle('active', b.dataset.v===p.hairStyle));
    [...hairColorsEl.children].forEach(b=>b.classList.toggle('active', b.dataset.v===p.hairColor));
    [...shirtColorsEl.children].forEach(b=>b.classList.toggle('active', b.dataset.v===p.shirt));
    [...actionRow.children].forEach(b=>b.classList.toggle('active', b.dataset.v===currentAction));
  }

  BASES.forEach((b,i)=>{
    const d=document.createElement('button'); d.className='char-card'; d.type='button';
    d.innerHTML=`<canvas width="16" height="16"></canvas><span class="pixel">${b.name}</span><small>P${i+1}</small>`;
    d.addEventListener('click',()=>{ p.baseId=i; if(!inpName.value.trim()) p.name=BASES[i].name; savePlayer(p); refresh(); beepSel(); });
    grid.appendChild(d);
  });
  HAIR_STYLES.forEach(s=>{ const b=document.createElement('button'); b.type='button'; b.className='opt'; b.dataset.v=s; b.textContent=s; b.addEventListener('click',()=>{ p.hairStyle=s; savePlayer(p); refresh(); beepSel(500); }); hairStylesEl.appendChild(b); });
  HAIR_COLORS.forEach(col=>{ const b=document.createElement('button'); b.type='button'; b.className='sw'; b.dataset.v=col; b.style.background=col; b.addEventListener('click',()=>{ p.hairColor=col; savePlayer(p); refresh(); beepSel(500); }); hairColorsEl.appendChild(b); });
  SHIRT_COLORS.forEach(col=>{ const b=document.createElement('button'); b.type='button'; b.className='sw'; b.dataset.v=col; b.style.background=col; b.addEventListener('click',()=>{ p.shirt=col; savePlayer(p); refresh(); beepSel(500); }); shirtColorsEl.appendChild(b); });
  const EMOJI={idle:'🧍',saludar:'👋',bailar:'🕺',saltar:'⤴'};
  ACTIONS.forEach(a=>{ const b=document.createElement('button'); b.type='button'; b.className='opt'; b.dataset.v=a; b.textContent=EMOJI[a]+' '+a; b.addEventListener('click',()=>{ currentAction=a; tick=0; refresh(); beepSel(a==='bailar'?880:640); }); actionRow.appendChild(b); });

  inpName.addEventListener('input',()=>{ p.name=inpName.value.trim()||BASES[p.baseId].name; savePlayer(p); refresh(); });
  document.getElementById('enterBtn').addEventListener('click',()=>{
    p.name=inpName.value.trim()||BASES[p.baseId].name; savePlayer(p);
    localStorage.setItem(SES,'1');
    // coins +1 al entrar
    try{ const c=parseInt(localStorage.getItem('arcade_coins')||'0')+1; localStorage.setItem('arcade_coins',c); document.getElementById('coins').textContent=String(c).padStart(2,'0'); }catch(e){}
    beepSel(880); showArcade();
  });
  document.getElementById('logoutBtn').addEventListener('click',()=>{ localStorage.removeItem(SES); showLogin(); });

  // animación continua del preview
  setInterval(()=>{ tick+=2; if(document.getElementById('loginScreen').style.display!=='none'){ drawPlayer(big, fullConfig(p), currentAction, tick); } },120);

  // sesión: si ya entró antes, saltar login y mostrar juegos
  if(localStorage.getItem(SES)==='1'){ showArcade(); } else { showLogin(); }
  refresh();
})();

function paintHUDMini(){
  const n=document.getElementById('hudPlayerName'), m=document.getElementById('hudMini');
  if(!n) return;
  const p=loadPlayer();
  n.textContent=currentName(p);
  if(m) drawPlayer(m, fullConfig(p));
}
paintHUDMini();
