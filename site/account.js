/* ============================================================
   LILITH — accounts + order tracking (Firebase Auth + Firestore)
   Post-reserve: set a password → account → order saved.
   Track modal: sign in → see your orders + status timeline.
   ============================================================ */
(function(){
  const $ = id => document.getElementById(id);
  const STAGES = [
    ['reserved','Reserved'], ['invoiced','Invoiced'], ['designing','In design'],
    ['designed','Designed'], ['production','In production'], ['shipped','Shipped'], ['arrived','Arrived']
  ];
  const stageIdx = k => { const i = STAGES.findIndex(s => s[0] === k); return i < 0 ? 0 : i; };
  const esc = s => String(s == null ? '' : s).replace(/[<>&]/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;' }[c]));
  const friendly = err => {
    const c = (err && err.code) || '';
    if(c.includes('wrong-password') || c.includes('invalid-credential')) return 'Wrong email or password.';
    if(c.includes('user-not-found')) return 'No account with that email yet.';
    if(c.includes('email-already-in-use')) return 'That email already has an account — sign in instead.';
    if(c.includes('too-many')) return 'Too many attempts. Try again later.';
    if(c.includes('weak-password')) return 'Choose a stronger password (6+ characters).';
    return (err && err.message) || 'Something went wrong.';
  };

  const track = $('track');
  function openTrack(){
    if(!track) return;
    track.classList.add('open'); track.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow = 'hidden'; document.body.classList.add('cfg-open');
    refresh();
  }
  function closeTrack(){
    if(!track) return;
    track.classList.remove('open'); track.setAttribute('aria-hidden','true');
    document.documentElement.style.overflow = ''; document.body.classList.remove('cfg-open');
  }
  const acc = $('accountBtn'); if(acc) acc.addEventListener('click', openTrack);
  document.querySelectorAll('[data-track]').forEach(b => b.addEventListener('click', e=>{ e.preventDefault(); openTrack(); }));
  if($('trackClose')) $('trackClose').addEventListener('click', closeTrack);
  document.addEventListener('keydown', e=>{ if(e.key==='Escape' && track && track.classList.contains('open')) closeTrack(); });
  window.openLilithTrack = openTrack;

  function timelineHTML(o){
    const cur = stageIdx(o.status || 'reserved');
    const steps = STAGES.map((s,i)=>`<li class="tl-step${i<=cur?' done':''}${i===cur?' current':''}"><span class="tl-dot"></span><span class="tl-label">${s[1]}</span></li>`).join('');
    return `<article class="track-order">
      <div class="to-head"><h4>${esc(o.product||'LILITH piece')}</h4><span class="to-no">${esc(o.orderNo||'')}</span></div>
      <p class="to-sum">${esc(o.summary||'')}${o.price ? ' · ' + esc(o.price) : ''}</p>
      <ul class="timeline">${steps}</ul></article>`;
  }
  async function loadOrders(uid){
    const box = $('trackOrders'); if(!box) return;
    box.innerHTML = '<p class="track-msg">Loading your reservations…</p>';
    try{
      const snap = await window.lilithDB.collection('orders').where('uid','==',uid).get();
      const orders = snap.docs.map(d=>d.data()).sort((a,b)=>((b.createdAt&&b.createdAt.seconds)||0)-((a.createdAt&&a.createdAt.seconds)||0));
      box.innerHTML = orders.length ? orders.map(timelineHTML).join('') : '<p class="track-msg">No reservations on this account yet.</p>';
    }catch(e){ box.innerHTML = '<p class="track-msg err">Could not load orders. '+esc(e.message||'')+'</p>'; }
  }
  function refresh(){
    const login=$('trackLogin'), orders=$('trackOrders'), logout=$('trackLogout'), title=$('trackTitle');
    if(!window.lilithAuth){ if(login) login.style.display='none'; if(orders){ orders.style.display='block'; orders.innerHTML='<p class="track-msg">Tracking is being set up.</p>'; } return; }
    const u = window.lilithAuth.currentUser;
    if(u){ if(login) login.style.display='none'; if(logout) logout.style.display='inline-flex'; if(orders) orders.style.display='block'; if(title) title.textContent='Your reservations'; loadOrders(u.uid); }
    else { if(login) login.style.display='flex'; if(logout) logout.style.display='none'; if(orders){ orders.style.display='none'; orders.innerHTML=''; } if(title) title.textContent='Track your order'; }
  }
  if(window.lilithAuth) window.lilithAuth.onAuthStateChanged(()=>{ if(track && track.classList.contains('open')) refresh(); });

  if($('trackLogin')) $('trackLogin').addEventListener('submit', async e=>{
    e.preventDefault();
    const b=$('tkBtn'); b.classList.add('loading'); b.disabled=true; $('tkErr').textContent='';
    try{ await window.lilithAuth.signInWithEmailAndPassword($('tkEmail').value.trim(), $('tkPass').value); }
    catch(err){ $('tkErr').textContent = friendly(err); }
    finally{ b.classList.remove('loading'); b.disabled=false; }
  });
  if($('trackLogout')) $('trackLogout').addEventListener('click', ()=> window.lilithAuth.signOut());

  /* ---- post-reserve account creation (in the preorder done screen) ---- */
  const accBtn = $('poAccBtn');
  if(accBtn) accBtn.addEventListener('click', async ()=>{
    const o = window.LILITH_lastOrder, msg = $('poAccMsg');
    if(!window.lilithAuth){ msg.textContent = 'Account service unavailable right now.'; return; }
    if(!o){ msg.textContent = 'No order to track.'; return; }
    const pass = $('poPass').value;
    if(!pass || pass.length < 6){ msg.textContent = 'Choose a password (at least 6 characters).'; $('poPass').focus(); return; }
    accBtn.disabled = true; accBtn.textContent = 'Creating…'; msg.textContent = '';
    try{
      let cred;
      try { cred = await window.lilithAuth.createUserWithEmailAndPassword(o.email, pass); }
      catch(err){ if(err.code === 'auth/email-already-in-use'){ cred = await window.lilithAuth.signInWithEmailAndPassword(o.email, pass); } else throw err; }
      await window.lilithDB.collection('orders').add({
        uid: cred.user.uid, email: o.email, name: o.name || '', product: o.product,
        summary: o.summary || '', price: o.price || '', orderNo: o.orderNo,
        status: 'reserved', createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      msg.innerHTML = '<b>Account created.</b> Track your order anytime.';
      accBtn.style.display = 'none'; $('poPass').style.display = 'none';
      const open = $('poTrackOpen');
      if(open){ open.style.display = 'inline-flex'; open.onclick = ()=>{ const p=$('preorder'); if(p) p.classList.remove('open'); openTrack(); }; }
    }catch(err){ msg.textContent = friendly(err); accBtn.disabled = false; accBtn.textContent = 'Create account'; }
  });
})();
