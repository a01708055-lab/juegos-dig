// SNAKE 16bits - MARIANAS ARCADE (versión robusta)
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
const N = 20, CELL = 20;
let snake = [{ x: 10, y: 10 }];
let dir = { x: 1, y: 0 }, nextDir = { x: 1, y: 0 };
let food = { x: 5, y: 5 };
let score = 0, speed = 1;
let timer = null, running = false, paused = false, dead = false;

const scoreEl = document.getElementById('score');
const lenEl = document.getElementById('len');
const speedEl = document.getElementById('speed');
const overlay = document.getElementById('overlay');
const ovScore = document.getElementById('ovScore');
const ovTitle = document.getElementById('ovTitle');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
let best = 0;
try { best = parseInt(localStorage.getItem('snake_best') || '0') || 0; } catch (e) {}
document.getElementById('best').textContent = best;

function reset() {
  snake = [{ x: 10, y: 10 }];
  dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 };
  score = 0; speed = 1; dead = false; paused = false;
  placeFood(); updateHUD();
}
function placeFood() {
  for (let t = 0; t < 500; t++) {
    const f = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
    if (!snake.some(s => s.x === f.x && s.y === f.y)) { food = f; return; }
  }
  food = { x: 0, y: 0 };
}
function updateHUD() {
  scoreEl.textContent = score;
  lenEl.textContent = snake.length;
  speedEl.textContent = speed;
  if (pauseBtn) pauseBtn.textContent = paused ? '▶ SEGUIR' : '⏸ PAUSA';
}
function speedMs() { return Math.max(60, 150 - (speed - 1) * 12); }
function stopLoop() { if (timer) { clearInterval(timer); timer = null; } }
function startLoop() { stopLoop(); timer = setInterval(step, speedMs()); }

function step() {
  if (paused || dead) return;
  dir = nextDir;
  const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || snake.some(s => s.x === h.x && s.y === h.y)) {
    gameOver(); return;
  }
  snake.unshift(h);
  if (h.x === food.x && h.y === food.y) {
    score += 10;
    beep(700, 80);
    if (snake.length % 4 === 0) { speed++; startLoop(); }
    placeFood();
  } else {
    snake.pop();
  }
  updateHUD(); draw();
}

function draw() {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 400, 400);
  ctx.strokeStyle = '#1c1c2e'; ctx.lineWidth = 1;
  for (let i = 0; i <= N; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL + .5, 0); ctx.lineTo(i * CELL + .5, 400); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL + .5); ctx.lineTo(400, i * CELL + .5); ctx.stroke();
  }
  // comida
  ctx.fillStyle = '#39ff14'; ctx.shadowColor = '#39ff14'; ctx.shadowBlur = 12;
  ctx.fillRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6);
  ctx.shadowBlur = 0;
  // serpiente
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? '#ffe600' : '#39ff14';
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
    ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    ctx.shadowBlur = 0;
    if (i === 0) {
      ctx.fillStyle = '#000';
      const ex = dir.x !== 0 ? (dir.x > 0 ? 12 : 5) : 5;
      const ex2 = dir.x !== 0 ? (dir.x > 0 ? 12 : 5) : 12;
      ctx.fillRect(s.x * CELL + ex, s.y * CELL + 5, 3, 3);
      ctx.fillRect(s.x * CELL + ex2, s.y * CELL + 12, 3, 3);
    }
  });
  if (!running && !dead) {
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 170, 400, 60);
    ctx.fillStyle = '#ffe600'; ctx.font = '14px "Press Start 2P", monospace';
    ctx.textAlign = 'center'; ctx.fillText('PULSA START', 200, 196);
    ctx.font = '10px "Press Start 2P", monospace'; ctx.fillStyle = '#fff';
    ctx.fillText('O TOCA UNA FLECHA', 200, 214);
  }
}

function start() {
  reset();
  overlay.classList.remove('show');
  running = true; paused = false;
  startLoop(); draw();
  if (startBtn) startBtn.textContent = '▶ START';
  updateHUD();
}
function gameOver() {
  stopLoop(); running = false; dead = true;
  beep(150, 300);
  if (score > best) {
    best = score;
    try { localStorage.setItem('snake_best', best); } catch (e) {}
    document.getElementById('best').textContent = best;
    ovTitle.textContent = '★ NEW RECORD ★';
  } else {
    ovTitle.textContent = 'GAME OVER';
  }
  ovScore.textContent = 'SCORE ' + score + ' • BEST ' + best;
  overlay.classList.add('show');
  draw();
}
function togglePause() {
  if (!running || dead) return;
  paused = !paused; updateHUD();
}
function beep(f, d) {
  try {
    const A = window.AudioContext || window.webkitAudioContext;
    const a = new A(); const o = a.createOscillator(), g = a.createGain();
    o.connect(g); g.connect(a.destination);
    o.frequency.value = f; o.type = 'square'; g.gain.value = .05;
    o.start(); o.stop(a.currentTime + d / 1000);
    o.onended = () => a.close();
  } catch (e) {}
}
function setDir(x, y) {
  // auto-arranca si aún no corre (así las flechas siempre responden)
  if (!running && !dead) { start(); }
  if (!running) return;
  if (snake.length > 1 && dir.x === -x && dir.y === -y) return;
  nextDir = { x, y };
}

document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'arrowup' || k === 'w') { e.preventDefault(); setDir(0, -1); }
  else if (k === 'arrowdown' || k === 's') { e.preventDefault(); setDir(0, 1); }
  else if (k === 'arrowleft' || k === 'a') { e.preventDefault(); setDir(-1, 0); }
  else if (k === 'arrowright' || k === 'd') { e.preventDefault(); setDir(1, 0); }
  else if (k === ' ') { e.preventDefault(); dead ? start() : (running ? togglePause() : start()); }
  else if (k === 'p') { togglePause(); }
  else if (k === 'enter' && dead) { start(); }
});

// botones táctiles
document.querySelectorAll('.mobile-pad button').forEach(b => {
  b.addEventListener('click', () => {
    const d = b.dataset.dir;
    if (d === 'up') setDir(0, -1);
    if (d === 'down') setDir(0, 1);
    if (d === 'left') setDir(-1, 0);
    if (d === 'right') setDir(1, 0);
  });
});
// swipe en el canvas para móvil
let tx = null, ty = null;
cv.addEventListener('touchstart', e => { const t = e.touches[0]; tx = t.clientX; ty = t.clientY; }, { passive: true });
cv.addEventListener('touchmove', e => {
  e.preventDefault();
  if (tx === null) return;
  const t = e.touches[0];
  const dx = t.clientX - tx, dy = t.clientY - ty;
  if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
  if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
  else setDir(0, dy > 0 ? 1 : -1);
  tx = t.clientX; ty = t.clientY;
}, { passive: false });

startBtn.onclick = start;
document.getElementById('againBtn').onclick = start;
document.getElementById('resetBtn').onclick = start;
if (pauseBtn) pauseBtn.onclick = togglePause;

reset(); draw();
