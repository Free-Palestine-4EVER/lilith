/* ============================================================
   LILITH — configurator logic
   eyes add cost · open mouth free but requires eyes
   ============================================================ */
(function(){
  const METALS = {
    gold:     { name:'Yellow Gold', purity:'18k', gem:'Ruby',       gemDesc:'Hand-set marquise rubies',   base:6000, eyes:1500 },
    rose:     { name:'Rose Gold',   purity:'18k', gem:'Black Onyx', gemDesc:'Hand-set black onyx',         base:7000, eyes:1000 },
    platinum: { name:'Platinum',    purity:'950', gem:'Emerald',    gemDesc:'Hand-set Colombian emeralds', base:8500, eyes:2500 },
  };
  const state = { metal:'gold', eyes:false, open:false };
  const $ = id => document.getElementById(id);
  const cfg = $('config'), imgA = $('cfgImg'), imgB = $('cfgImgB');
  let curImg = imgA;
  const money = n => '$' + n.toLocaleString('en-US');
  const variant = () => state.open ? 'open' : state.eyes ? 'eyes' : 'base';
  const price   = () => METALS[state.metal].base + (state.eyes ? METALS[state.metal].eyes : 0);

  /* Crossfade between two stacked layers: the new image fades in ON TOP of the
     current one, which stays opaque underneath — so the stage background is
     never exposed mid-swap (that was the gray/dark flash). */
  function setImg(){
    const src = `img/config/${state.metal}-${variant()}.webp`;
    if (curImg.getAttribute('src') === src) return;
    const next = (curImg === imgA) ? imgB : imgA;
    const pre = new Image();
    pre.onload = () => {
      next.src = src;
      next.style.zIndex = '2';
      curImg.style.zIndex = '1';
      void next.offsetWidth;                 // reflow so opacity animates from 0
      next.style.opacity = '1';
      const prev = curImg;
      curImg = next;
      setTimeout(() => { if (curImg !== prev) prev.style.opacity = '0'; }, 500);
    };
    pre.src = src;
  }

  function render(){
    const m = METALS[state.metal];
    setImg();
    $('cfgName').textContent = m.name;
    $('cfgGemName').textContent = m.gem;
    $('cfgGemDesc').textContent = m.gemDesc;
    $('cfgEyesPrice').textContent = '+' + money(m.eyes);
    $('cfgSummary').textContent =
      [ m.purity, state.eyes ? m.gem+' eyes' : 'Bare', state.open ? 'Agape' : 'In repose' ].join(' · ');
    $('cfgPrice').textContent = money(price());
    $('cfgMouthHint').textContent = state.eyes ? 'A working cigarette holder' : 'Requires gemstone eyes';

    [...$('cfgMetals').children].forEach(b => b.classList.toggle('on', b.dataset.metal === state.metal));
    [...$('cfgEyes').children].forEach(b => b.classList.toggle('on', (b.dataset.eyes === '1') === state.eyes));
    [...$('cfgMouth').children].forEach(b => {
      const isOpen = b.dataset.open === '1';
      b.classList.toggle('on', isOpen === state.open);
      if (isOpen) b.classList.toggle('disabled', !state.eyes);
    });
  }

  function open(metal){
    if (metal && METALS[metal]) state.metal = metal;
    state.eyes = false; state.open = false;
    cfg.classList.remove('confirmed');
    render();
    cfg.classList.add('open');
    document.body.classList.add('cfg-open');
    document.documentElement.style.overflow = 'hidden';
  }
  function close(){ cfg.classList.remove('open'); document.body.classList.remove('cfg-open'); document.documentElement.style.overflow = ''; }
  window.closeConfigurator = close;

  $('cfgMetals').addEventListener('click', e => { const b=e.target.closest('[data-metal]'); if(!b)return; state.metal=b.dataset.metal; render(); });
  $('cfgEyes').addEventListener('click', e => {
    const b=e.target.closest('[data-eyes]'); if(!b)return;
    state.eyes = b.dataset.eyes === '1';
    if (!state.eyes) state.open = false;
    render();
  });
  $('cfgMouth').addEventListener('click', e => {
    const b=e.target.closest('[data-open]'); if(!b)return;
    const wantOpen = b.dataset.open === '1';
    if (wantOpen && !state.eyes){
      const eyes=$('cfgEyes'); eyes.classList.add('flash'); setTimeout(()=>eyes.classList.remove('flash'),700);
      return;
    }
    state.open = wantOpen; render();
  });

  $('cfgClose').addEventListener('click', close);
  $('cfgDoneClose').addEventListener('click', () => { cfg.classList.remove('confirmed'); close(); });
  $('cfgBuy').addEventListener('click', () => {
    const m = METALS[state.metal];
    const summary = [ m.purity, state.eyes ? m.gem+' eyes' : 'Bare', state.open ? 'Agape' : 'In repose' ].join(' · ');
    const order = {
      metal:state.metal, title:`${m.name} Serpent`, purity:m.purity, gem:m.gem,
      eyes:state.eyes, open:state.open, summary, price:price(), priceText:money(price()),
      img:curImg.getAttribute('src')
    };
    if (window.openPreorder){ window.openPreorder(order); return; }
    /* fallback confirmation if checkout is unavailable */
    $('cfgDoneTitle').textContent = `${m.name} Serpent`;
    $('cfgDoneSummary').textContent = summary + ' — ' + money(price());
    cfg.classList.add('confirmed');
  });

  document.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => open(b.dataset.buy)));
  if (location.hash === '#buy') open('gold');
})();
