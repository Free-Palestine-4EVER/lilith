/* ============================================================
   LILITH — universal scroll-reveal (rAF + scroll position,
   the same reliable method the films use). Animates every
   content block not already handled by data-reveal / .kinetic.
   ============================================================ */
(function(){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const root = document.querySelector('#site .wrap'); if(!root) return;

  const sel = [
    'section > .mark', 'h2', 'h3', 'h4', 'p', '.btn', '.link-quiet',
    '.serpent-film', '.stone', '.craft li', '.service', '.assure-item',
    'figure', '.foot-col', '.foot-mark', '.foot-tag', '.earcuff-frame',
    '.earcuff-controls', '.sf-info', '.ribbon', '.pull', '.ic-form',
    '.sp-media', '.sig-media', '.serpent-media', '.services-foot', '.foot-legal'
  ].join(',');

  let els = [...root.querySelectorAll(sel)].filter(el=>{
    if(el.hasAttribute('data-reveal')) return false;   // handled by home.js
    if(el.classList.contains('kinetic')) return false; // headline split-reveal
    if(el.closest('[data-reveal]')) return false;      // reveals with its parent
    if(el.closest('.kinetic')) return false;
    return true;
  });

  els.forEach(el => el.classList.add('rv'));
  els.forEach(el=>{
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('rv'));
    const idx = sibs.indexOf(el);
    if(idx > 0) el.style.setProperty('--rvd', Math.min(idx*0.07, 0.42) + 's');
  });

  let pending = els.slice();
  function check(){
    const h = window.innerHeight;
    pending = pending.filter(el=>{
      if(el.getBoundingClientRect().top < h*0.90){ el.classList.add('rv-in'); return false; }
      return true;
    });
    if(pending.length) requestAnimationFrame(check);
  }
  requestAnimationFrame(check);
})();
