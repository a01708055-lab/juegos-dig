let coins = parseInt(localStorage.getItem('arcade_coins')||'0');
const el = document.getElementById('coins');
if(el) el.textContent = String(coins).padStart(2,'0');
document.querySelectorAll('.play-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    coins++; localStorage.setItem('arcade_coins',coins);
    try{ new AudioContext().close(); }catch(e){}
  });
  b.addEventListener('mouseenter',()=>{ b.textContent='● INSERT COIN ●'; });
  b.addEventListener('mouseleave',()=>{ b.textContent='▶ JUGAR'; });
});
document.addEventListener('keydown',e=>{ if(e.key==='Enter'){ document.querySelector('.card .play-btn')?.focus(); }});
