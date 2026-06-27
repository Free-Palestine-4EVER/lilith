/* ============================================================
   LILITH — award.js · scroll-velocity skew + chromatic grade
   Reads Lenis velocity, lerps it, drives image skew + a
   --vel CSS var (chromatic aberration on headlines).
   ============================================================ */
(function(){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const media = [...document.querySelectorAll('.serpent-media img,.sig-media img')];
  const root = document.documentElement;
  let smooth = 0, last = window.scrollY || 0;

  function frame(){
    const l = window.lenis;
    let v = (l && typeof l.velocity === 'number') ? l.velocity : ((window.scrollY||0) - last);
    last = window.scrollY || 0;
    smooth += (v - smooth) * 0.12;
    if (Math.abs(smooth) < 0.01) smooth = 0;
    const clamped = Math.max(-26, Math.min(26, smooth));
    root.style.setProperty('--vel', clamped.toFixed(2));
    const sk = (clamped * 0.10).toFixed(2);          // gentle momentum skew
    const sc = (1 + Math.min(0.05, Math.abs(clamped) * 0.0016)).toFixed(3);
    for (const img of media) img.style.transform = `skewY(${sk}deg) scale(${sc})`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
