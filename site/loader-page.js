/* ============================================================
   LILITH — loader page (rose serpent, frame-on-scroll)
   Enter the Maison → home.html
   ============================================================ */
/* Smooth-scroll on pointer devices only; native scroll on touch (see home.js). */
if(!matchMedia('(hover: none) and (pointer: coarse)').matches){
  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })();
}

const body = document.body;
const byId = id => document.getElementById(id);
const clamp = v => Math.max(0, Math.min(1, v));
const pad = n => String(n).padStart(3,'0');

const N = 90;
const canvas = byId('loaderCanvas');
const ctx = canvas.getContext('2d', { alpha:false });
const imgs = new Array(N);
const preFill = byId('preFill');
const loaderSec = byId('loader');
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

let pMove=false, pEnd=false;
function tick(){
  const r=loaderSec.getBoundingClientRect();
  const s=loaderSec.offsetHeight-window.innerHeight;
  const p=s>0?clamp(-r.top/s):0;
  const t=p*(N-1); render+=(t-render)*0.2; if(Math.abs(t-render)<0.01) render=t; drawI(Math.round(render));
  const moving=p>0.02 && p<0.98; if(moving!==pMove){ body.classList.toggle('moving',moving); pMove=moving; }
  const end=p>=0.88; if(end!==pEnd){ body.classList.toggle('loader-end',end); pEnd=end; }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.addEventListener('resize', size);

const MIN=900, t0=Date.now(); let done=0;
function mark(){ done++; if(preFill) preFill.style.width=(done/N*100)+'%'; if(done>=N) finish(); }
function finish(){ if(unlocked)return; unlocked=true; const w=Math.max(0,MIN-(Date.now()-t0)); setTimeout(()=>{ body.classList.remove('loading'); size(); }, w); }
for(let i=0;i<N;i++){
  const img=new Image(); imgs[i]=img;
  img.onload=()=>{ if(i===0) size(); mark(); if(img.decode) img.decode().catch(()=>{}); };
  img.onerror=mark;
  img.src=`frames/frame_${pad(i)}.webp`;
}
setTimeout(()=>{ if(!unlocked){ unlocked=true; body.classList.remove('loading'); size(); } }, 5000);

/* preconnect/prefetch the home film so Enter feels instant */
['hero/frame_000.webp','hero/frame_045.webp'].forEach(src=>{ const i=new Image(); i.src=src; });
