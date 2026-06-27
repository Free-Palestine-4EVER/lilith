/* ============================================================
   LILITH — fullscreen menu
   ============================================================ */
(function(){
  const menu = document.getElementById('menu');
  const btn  = document.getElementById('menuBtn');
  if(!menu || !btn) return;
  function open(){ menu.classList.add('open'); document.body.classList.add('menu-open'); btn.setAttribute('aria-expanded','true'); menu.setAttribute('aria-hidden','false'); }
  function close(){ menu.classList.remove('open'); document.body.classList.remove('menu-open'); btn.setAttribute('aria-expanded','false'); menu.setAttribute('aria-hidden','true'); }
  btn.addEventListener('click', ()=> menu.classList.contains('open') ? close() : open());
  const closeBtn = document.getElementById('menuClose');
  if(closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e=>{ if(e.key==='Escape' && menu.classList.contains('open')) close(); });
  // smooth-scroll for ALL [data-link] anchors (menu, masthead nav, footer)
  document.querySelectorAll('[data-link]').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      const wasOpen = menu.classList.contains('open');
      if(wasOpen) close();
      setTimeout(()=>{ if(window.lenis && t) window.lenis.scrollTo(t,{offset:-70}); else if(t) t.scrollIntoView({behavior:'smooth'}); }, wasOpen?430:0);
    });
  });
  // any [data-buy] inside the menu closes it (configurator opens via its own listener)
  menu.querySelectorAll('[data-buy]').forEach(a=> a.addEventListener('click', ()=> close()));
})();
