/* ============================================================
   LILITH — inline ear-cuff configurator (image IS the configurator)
   ============================================================ */
(function(){
  const img = document.getElementById('earcuffImg');
  if(!img) return;
  const data = {
    gold:     { name:'Yellow Gold', gem:'18k · Ruby eyes',    img:'img/earring-gold.jpg',     price:2400 },
    rose:     { name:'Rose Gold',   gem:'18k · Onyx eyes',    img:'img/earring-rose.jpg',     price:2400 },
    platinum: { name:'Platinum',    gem:'950 · Emerald eyes', img:'img/earring-platinum.jpg', price:2600 },
  };
  const name = document.getElementById('earcuffName');
  const gem  = document.getElementById('earcuffGem');
  const price= document.getElementById('earcuffPrice');
  const money = n => '$' + n.toLocaleString('en-US');
  let cur = 'gold';

  function set(metal){
    const d = data[metal]; if(!d) return; cur = metal;
    img.classList.add('swap');
    const pre = new Image();
    pre.onload = ()=>{ img.src = d.img; requestAnimationFrame(()=> img.classList.remove('swap')); };
    pre.src = d.img;
    name.textContent = d.name; gem.textContent = d.gem; price.textContent = 'from ' + money(d.price);
    document.querySelectorAll('.ec-sw').forEach(b => b.classList.toggle('on', b.dataset.ec === metal));
  }
  document.getElementById('earcuffSwatches').addEventListener('click', e=>{
    const b = e.target.closest('[data-ec]'); if(b) set(b.dataset.ec);
  });
  // preload the other two
  ['rose','platinum'].forEach(m=>{ const i=new Image(); i.src=data[m].img; });
  document.getElementById('earcuffBuy').addEventListener('click', ()=>{
    const d = data[cur];
    if(window.openPreorder) window.openPreorder({ title:'Serpent Ear Cuff — '+d.name, summary:d.gem, price:d.price, img:d.img });
  });
})();
