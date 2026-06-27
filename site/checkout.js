/* ============================================================
   LILITH — mock Stripe checkout logic (demo · no real charge)
   window.openCheckout(order) — opens the Stripe-style flow.
   ============================================================ */
(function(){
  const $ = id => document.getElementById(id);
  const co = $('checkout');
  if(!co) return;
  const money = n => '$' + Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  let current = null;

  function fill(o){
    current = o;
    $('coAmount').textContent  = money(o.price);
    $('coThumb').src           = o.img;
    $('coItem').textContent    = o.title;
    $('coDesc').textContent    = o.summary;
    $('coLineAmt').textContent = money(o.price);
    $('coSub').textContent     = money(o.price);
    $('coTotal').textContent   = money(o.price);
    $('coPayAmt').textContent  = money(o.price);
  }

  window.openCheckout = function(o){
    fill(o);
    co.classList.remove('paid');
    const btn = $('coPay'); btn.classList.remove('loading'); btn.disabled = false;
    $('coErr').textContent = '';
    co.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('cfg-open');
    setTimeout(()=>$('coEmail').focus(), 400);
  };
  function closeCheckout(full){
    co.classList.remove('open');
    if(full){
      if(window.closeConfigurator) window.closeConfigurator();
      document.documentElement.style.overflow = '';
      document.body.classList.remove('cfg-open');
    }
  }
  $('coClose').addEventListener('click', ()=>closeCheckout(false));
  $('coBack').addEventListener('click',  ()=>closeCheckout(false));
  document.addEventListener('keydown', e=>{ if(e.key==='Escape' && co.classList.contains('open')) closeCheckout(false); });

  const card=$('coCard'), exp=$('coExp'), cvc=$('coCvc'), err=$('coErr');
  const cardWrap = card.closest('.co-card');
  card.addEventListener('input', ()=>{ const v=card.value.replace(/\D/g,'').slice(0,16); card.value=v.replace(/(.{4})/g,'$1 ').trim(); clear(); });
  exp.addEventListener('input', ()=>{ let v=exp.value.replace(/\D/g,'').slice(0,4); if(v.length>2) v=v.slice(0,2)+' / '+v.slice(2); exp.value=v; clear(); });
  cvc.addEventListener('input', ()=>{ cvc.value=cvc.value.replace(/\D/g,'').slice(0,4); clear(); });
  $('coEmail').addEventListener('input', clear);
  function clear(){ cardWrap.classList.remove('err'); $('coEmail').classList.remove('err'); err.textContent=''; }
  function fail(el,msg,focus){ if(el) el.classList.add('err'); err.textContent=msg; if(focus) focus.focus(); }

  $('coPayForm').addEventListener('submit', e=>{
    e.preventDefault();
    const email=$('coEmail').value.trim();
    const digits=card.value.replace(/\D/g,'');
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail($('coEmail'),'Enter a valid email address.',$('coEmail'));
    if(digits.length<15)                          return fail(cardWrap,'Your card number is incomplete.',card);
    if(exp.value.replace(/\D/g,'').length<4)       return fail(cardWrap,'Your card’s expiry date is incomplete.',exp);
    if(cvc.value.length<3)                         return fail(cardWrap,'Your card’s security code is incomplete.',cvc);
    err.textContent='';
    const btn=$('coPay'); btn.classList.add('loading'); btn.disabled=true;
    setTimeout(()=>succeed(email), 1750);
  });

  function succeed(email){
    const n='LIL-'+String(Math.floor(1000+Math.random()*9000));
    $('coOrder').textContent=n;
    $('coDoneSum').textContent=current.title+' — '+current.summary+' · '+money(current.price);
    $('coDoneEmail').textContent=email;
    co.classList.add('paid');
  }
  $('coDoneClose').addEventListener('click', ()=>closeCheckout(true));
})();
