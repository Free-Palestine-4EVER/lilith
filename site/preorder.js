/* ============================================================
   LILITH — preorder reservation (no payment). window.openPreorder(order)
   ============================================================ */
(function(){
  const $ = id => document.getElementById(id);
  const po = $('preorder');
  if(!po) return;
  const money = n => '$' + Number(n).toLocaleString('en-US');
  let current = null;

  window.openPreorder = function(o){
    current = o;
    $('poImg').src = o.img;
    $('poSum').textContent = o.summary;
    $('poPrice').textContent = 'from ' + money(o.price);
    po.classList.remove('done');
    const b = $('poSubmit'); b.classList.remove('loading'); b.disabled = false;
    $('poErr').textContent = '';
    po.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('cfg-open');
    setTimeout(()=>$('poFirst').focus(), 420);
  };
  function close(full){
    po.classList.remove('open');
    if(full){
      if(window.closeConfigurator) window.closeConfigurator();
      document.documentElement.style.overflow = '';
      document.body.classList.remove('cfg-open');
    }
  }
  $('poClose').addEventListener('click', ()=> close(false));
  document.addEventListener('keydown', e=>{ if(e.key==='Escape' && po.classList.contains('open')) close(false); });
  ['poFirst','poEmail'].forEach(id=> $(id).addEventListener('input', ()=>{ $('poErr').textContent=''; }));

  $('poForm').addEventListener('submit', e=>{
    e.preventDefault();
    const first = $('poFirst').value.trim();
    const email = $('poEmail').value.trim();
    if(!first) return fail('Please tell us your name.', 'poFirst');
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Enter a valid email address.', 'poEmail');
    $('poErr').textContent = '';
    const b = $('poSubmit'); b.classList.add('loading'); b.disabled = true;
    setTimeout(()=>succeed(first, email), 1600);
  });
  function fail(msg, focus){ $('poErr').textContent = msg; const el=$(focus); if(el) el.focus(); }

  function succeed(first, email){
    $('poNo').textContent = 'LIL-' + String(Math.floor(1000 + Math.random()*9000));
    $('poDoneTitle').textContent = 'Your ' + current.title;
    $('poDoneName').textContent = first;
    $('poDoneEmail').textContent = email;
    po.classList.add('done');
  }
  $('poDoneClose').addEventListener('click', ()=> close(true));
})();
