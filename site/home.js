/* ============================================================
   LILITH — home (hero film + serpent spine + reveals)
   ============================================================ */
const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
window.lenis = lenis;
(function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })();

const body = document.body;
const byId = id => document.getElementById(id);
const clamp = v => Math.max(0, Math.min(1, v));
const pad = n => String(n).padStart(3,'0');

const N = 90;
const canvas = byId('frames');
const ctx = canvas.getContext('2d', { alpha:false });
const imgs = new Array(N);
const loadFill = byId('loadFill');
const heroSec = byId('hero');
const caps = document.querySelectorAll('.hero-cap');
let cur = -1, render = 0, unlocked = false;

function size(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width  = Math.round(window.innerWidth  * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  canvas.style.width  = window.innerWidth  + 'px';
  canvas.style.height = window.innerHeight + 'px';
  cur = -1; drawI(Math.round(render));
}
function cover(img){
  const cw=canvas.width, ch=canvas.height, ir=img.width/img.height, cr=cw/ch;
  let dw,dh,dx,dy;
  if(cr>ir){dw=cw;dh=cw/ir;dx=0;dy=(ch-dh)/2;} else {dh=ch;dw=ch*ir;dy=0;dx=(cw-dw)/2;}
  ctx.drawImage(img,dx,dy,dw,dh);
}
function drawI(i){ i=Math.max(0,Math.min(N-1,i)); if(i===cur)return; const im=imgs[i]; if(im&&im.complete){cur=i;cover(im);} }

/* serpent spine — draws as #site scrolls past */
const site = byId('site');
const spine = byId('spinePath');
let spineLen = 0;
function setupSpine(){ if(spine){ spineLen = spine.getTotalLength(); spine.style.strokeDasharray = spineLen; spine.style.strokeDashoffset = spineLen; } }

let pMove=false, capIdx=0, pScrolled=false;
function tick(){
  const r=heroSec.getBoundingClientRect();
  const s=heroSec.offsetHeight-window.innerHeight;
  const p=s>0?clamp(-r.top/s):0;
  const t=p*(N-1); render+=(t-render)*0.2; if(Math.abs(t-render)<0.01) render=t; drawI(Math.round(render));
  const moving=p>0.02; if(moving!==pMove){ body.classList.toggle('moving',moving); pMove=moving; }
  const ci=p<0.33?0:p<0.56?1:2; if(ci!==capIdx){ caps.forEach((c,k)=>c.classList.toggle('active',k===ci)); capIdx=ci; }

  const y=window.scrollY||window.pageYOffset;
  const sc=y>40; if(sc!==pScrolled){ body.classList.toggle('scrolled',sc); pScrolled=sc; }
  if(spineLen && site){
    const sr=site.getBoundingClientRect();
    const prog=clamp((window.innerHeight - sr.top) / (site.offsetHeight + window.innerHeight*0.4));
    spine.style.strokeDashoffset = spineLen*(1-prog);
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.addEventListener('resize', ()=>{ size(); setupSpine(); });

const MIN=700, t0=Date.now(); let done=0;
function mark(){ done++; if(loadFill) loadFill.style.width=(done/N*100)+'%'; if(done>=N) finish(); }
function finish(){ if(unlocked)return; unlocked=true; const w=Math.max(0,MIN-(Date.now()-t0)); setTimeout(()=>{ body.classList.remove('loading'); size(); setupSpine(); }, w); }
for(let i=0;i<N;i++){
  const img=new Image(); imgs[i]=img;
  img.onload=()=>{ if(i===0) size(); mark(); if(img.decode) img.decode().catch(()=>{}); };
  img.onerror=mark;
  img.src=`hero/frame_${pad(i)}.webp`;
}
setTimeout(()=>{ if(!unlocked){ unlocked=true; body.classList.remove('loading'); size(); setupSpine(); } }, 5500);
setupSpine();

/* reveal-on-scroll */
const io = new IntersectionObserver(es => { es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.16 });
document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
