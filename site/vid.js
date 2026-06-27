(function(){
  const vids=[...document.querySelectorAll('.serpent-vid')];
  if(!vids.length) return;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){ vids.forEach(v=>{ v.removeAttribute('autoplay'); v.pause(); }); return; }
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    const v=e.target;
    if(e.isIntersecting){ if(v.preload==='none'){ v.preload='auto'; v.load(); } v.play().catch(()=>{}); }
    else v.pause();
  },{threshold:0.2});
  vids.forEach(v=>io.observe(v));
})();
