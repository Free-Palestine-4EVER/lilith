/* ============================================================
   LILITH — home (hero film + serpent spine + reveals)
   ============================================================ */
/* Freeze 1vh to a fixed pixel value (--vhu) so the tall scroll-tracks
   (#hero = 440-560vh, #loader) don't resize when the mobile address bar
   shows/hides. That toggle fires on every scroll-direction reversal and,
   multiplied by 440, would shove the whole page ~260px ("scroll a little,
   page moves a lot"). Only re-freeze on a width change (orientation),
   never on an address-bar height change. */
(function(){
  const el = document.documentElement;
  let lastW = window.innerWidth;
  const setVhu = () => el.style.setProperty('--vhu', (window.innerHeight / 100) + 'px');
  setVhu();
  window.addEventListener('resize', () => {
    if(window.innerWidth !== lastW){ lastW = window.innerWidth; setVhu(); }
  });
})();

/* Smooth-scroll on pointer devices only. On touch (phones/tablets) native
   scrolling is used — Lenis momentum amplifies small direction reversals,
   making the page jump when you flick back the other way. */
let lenis = null;
if(!matchMedia('(hover: none) and (pointer: coarse)').matches){
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  window.lenis = lenis;
  (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })();
}

const body = document.body;
const byId = id => document.getElementById(id);
const clamp = v => Math.max(0, Math.min(1, v));
const pad = n => String(n).padStart(3,'0');

const N = 90;
const smooth = (a,b,x)=>{ const t=clamp((x-a)/(b-a)); return t*t*(3-2*t); };

/* ---- two films stacked: rose loader (top) cross-fades into hero (bottom) ---- */
const loaderCanvas = byId('loaderCanvas');
const lctx = loaderCanvas.getContext('2d', { alpha:false });
const loaderStage = document.querySelector('.loader-stage');
const loaderSec = byId('loader');
const lImgs = new Array(N);
let lCur=-1, lRender=0;

const canvas = byId('frames');
const ctx = canvas.getContext('2d', { alpha:false });
const imgs = new Array(N);
let cur=-1, render=0;

const loadFill = byId('loadFill');
const heroSec = byId('hero');
const caps = document.querySelectorAll('.hero-cap');
const loaderBrand = document.querySelector('.loader-brand');
let unlocked = false;

function cover(c,cx,img){
  const cw=c.width, ch=c.height, ir=img.width/img.height, cr=cw/ch;
  let dw,dh,dx,dy;
  if(cr>ir){dw=cw;dh=cw/ir;dx=0;dy=(ch-dh)/2;} else {dh=ch;dw=ch*ir;dy=0;dx=(cw-dw)/2;}
  cx.drawImage(img,dx,dy,dw,dh);
}
function sizeOne(c){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width  = Math.round(window.innerWidth  * dpr);
  c.height = Math.round(window.innerHeight * dpr);
  c.style.width  = window.innerWidth  + 'px';
  c.style.height = window.innerHeight + 'px';
}
function size(){ sizeOne(loaderCanvas); sizeOne(canvas); lCur=-1; cur=-1; drawL(Math.round(lRender)); drawH(Math.round(render)); }
function drawL(i){ i=Math.max(0,Math.min(N-1,i)); if(i===lCur)return; const im=lImgs[i]; if(im&&im.complete){lCur=i;cover(loaderCanvas,lctx,im);} }
function drawH(i){ i=Math.max(0,Math.min(N-1,i)); if(i===cur)return; const im=imgs[i]; if(im&&im.complete){cur=i;cover(canvas,ctx,im);} }

/* serpent spine — draws as #site scrolls past */
const site = byId('site');
const spine = byId('spinePath');
let spineLen = 0;
function setupSpine(){ if(spine){ spineLen = spine.getTotalLength(); spine.style.strokeDasharray = spineLen; spine.style.strokeDashoffset = spineLen; } }

let pMove=false, capIdx=0, pScrolled=false;
function tick(){
  const vh=window.innerHeight;

  /* film 1 — rose loader */
  const lr=loaderSec.getBoundingClientRect();
  const ls=loaderSec.offsetHeight-vh;
  const pl=ls>0?clamp(-lr.top/ls):0;
  const lt=pl*(N-1); lRender+=(lt-lRender)*0.2; if(Math.abs(lt-lRender)<0.01) lRender=lt; drawL(Math.round(lRender));
  /* cross-fade the rose film out over the last stretch of its scroll */
  loaderStage.style.opacity = (1 - smooth(0.62, 1.0, pl)).toFixed(3);
  /* LILITH MAISON title blooms the instant the serpent's jaw opens (~pl .66), then dissolves into the Maison */
  if(loaderBrand){
    const bo = smooth(0.64, 0.80, pl) * (1 - smooth(0.93, 1.0, pl));
    loaderBrand.style.opacity = bo.toFixed(3);
    const rise = (1 - smooth(0.60, 0.84, pl)) * 26;
    loaderBrand.style.transform = `translateY(${rise.toFixed(1)}px)`;
  }

  /* film 2 — hero. Hold on frame 0 through the overlap, then scrub. */
  const hr=heroSec.getBoundingClientRect();
  const hs=heroSec.offsetHeight-vh;
  const ph=hs>0?clamp(-hr.top/hs):0;
  const ovl = hs>0 ? clamp((-parseFloat(getComputedStyle(heroSec).marginTop)||0)/hs) : 0;
  const phe = clamp((ph-ovl)/(1-ovl));
  const ht=phe*(N-1); render+=(ht-render)*0.2; if(Math.abs(ht-render)<0.01) render=ht; drawH(Math.round(render));

  const moving=pl>0.02; if(moving!==pMove){ body.classList.toggle('moving',moving); pMove=moving; }
  const ci=phe<0.33?0:phe<0.56?1:2; if(ci!==capIdx){ caps.forEach((c,k)=>c.classList.toggle('active',k===ci)); capIdx=ci; }

  const y=window.scrollY||window.pageYOffset;
  const sc=y>40; if(sc!==pScrolled){ body.classList.toggle('scrolled',sc); pScrolled=sc; }
  if(spineLen && site){
    const sr=site.getBoundingClientRect();
    const prog=clamp((vh - sr.top) / (site.offsetHeight + vh*0.4));
    spine.style.strokeDashoffset = spineLen*(1-prog);
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.addEventListener('resize', ()=>{ size(); setupSpine(); });

/* load film 1 (rose) first — gate the splash on it; then stream film 2 (hero) */
const MIN=700, t0=Date.now(); let done=0;
function mark(){ done++; if(loadFill) loadFill.style.width=(done/N*100)+'%'; if(done>=N) finish(); }
function finish(){ if(unlocked)return; unlocked=true; const w=Math.max(0,MIN-(Date.now()-t0)); setTimeout(()=>{ body.classList.remove('loading'); size(); setupSpine(); }, w); loadHero(); }
for(let i=0;i<N;i++){
  const img=new Image(); lImgs[i]=img;
  img.onload=()=>{ if(i===0) size(); mark(); if(img.decode) img.decode().catch(()=>{}); };
  img.onerror=mark;
  img.src=`frames/frame_${pad(i)}.webp`;
}
function loadHero(){
  for(let i=0;i<N;i++){
    const img=new Image(); imgs[i]=img;
    img.onload=()=>{ if(i===0) drawH(0); if(img.decode) img.decode().catch(()=>{}); };
    img.src=`hero/frame_${pad(i)}.webp`;
  }
}
setTimeout(()=>{ if(!unlocked){ unlocked=true; body.classList.remove('loading'); size(); setupSpine(); loadHero(); } }, 5500);
setupSpine();

/* reveal-on-scroll */
const io = new IntersectionObserver(es => { es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.16 });
document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
