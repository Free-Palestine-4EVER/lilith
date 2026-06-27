/* ============================================================
   LILITH — scrub-film: the 3 serpent videos as frame-on-scroll
   Each .serpent-film scrubs its awakening as it crosses the viewport.
   ============================================================ */
(function(){
  const films = [...document.querySelectorAll('.serpent-film')];
  if(!films.length) return;
  const N = 40;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  films.forEach(film=>{
    const metal = film.dataset.metal;
    const cv = film.querySelector('canvas');
    const ctx = cv.getContext('2d', { alpha:false });
    const imgs = new Array(N);
    let render = 0, cur = -1;

    function size(){
      const dpr = Math.min(window.devicePixelRatio||1, 2);
      const r = cv.getBoundingClientRect();
      cv.width = Math.max(1, Math.round(r.width*dpr));
      cv.height = Math.max(1, Math.round(r.height*dpr));
      cur = -1; draw(Math.round(render));
    }
    function cover(img){
      const cw=cv.width, ch=cv.height, ir=img.width/img.height, cr=cw/ch;
      let dw,dh,dx,dy;
      if(cr>ir){dw=cw;dh=cw/ir;dx=0;dy=(ch-dh)/2;} else {dh=ch;dw=ch*ir;dy=0;dx=(cw-dw)/2;}
      ctx.drawImage(img,dx,dy,dw,dh);
    }
    function draw(i){ i=Math.max(0,Math.min(N-1,i)); if(i===cur)return; const im=imgs[i]; if(im&&im.complete){cur=i;cover(im);} }

    for(let i=0;i<N;i++){
      const im = new Image(); imgs[i]=im;
      im.onload = ()=>{ if(i===0) size(); };
      im.src = `serpents/${metal}/f_${String(i+1).padStart(2,"0")}.webp?v=30`;
    }
    film._tick = ()=>{
      const r = cv.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (window.innerHeight*0.82 - r.top) / (window.innerHeight*0.60)));
      const t = reduce ? (N-1) : p*(N-1);
      render += (t-render)*0.16; if(Math.abs(t-render)<0.01) render=t;
      draw(Math.round(render));
    };
    window.addEventListener('resize', size);
  });

  (function loop(){ for(const f of films) f._tick&&f._tick(); requestAnimationFrame(loop); })();
})();
