/* ============================================================
   LILITH — collection background shifts with the serpents
   gold→champagne · rose→blush · platinum→cool-grey
   continuous, scroll-driven, eased.
   ============================================================ */
(function(){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const serpents = [...document.querySelectorAll('.collection .serpent')];
  if(serpents.length < 3) return;

  const ivory = [249,247,243];           // default page ground
  const gold  = [245,230,205];           // champagne (warm)
  const rose  = [250,226,221];           // blush (pink)
  const plat  = [225,233,241];           // cool grey-blue
  const stops = [gold, rose, plat];

  const lerp = (a,b,t)=>a+(b-a)*t;
  const mix  = (c1,c2,t)=>[lerp(c1[0],c2[0],t),lerp(c1[1],c2[1],t),lerp(c1[2],c2[2],t)];
  const cl   = (v,a,b)=>Math.max(a,Math.min(b,v));
  let cur = ivory.slice();

  function centers(){
    return serpents.map(s=>{ const r=s.getBoundingClientRect(); return r.top + window.scrollY + r.height/2; });
  }
  function target(){
    const vc = (window.scrollY||0) + innerHeight*0.5;
    const y = centers(); const fade = innerHeight*0.75;
    if(vc <= y[0])               return mix(ivory, stops[0], cl((vc-(y[0]-fade))/fade,0,1));
    for(let i=0;i<y.length-1;i++) if(vc <= y[i+1]) return mix(stops[i], stops[i+1], cl((vc-y[i])/(y[i+1]-y[i]),0,1));
    return mix(stops[stops.length-1], ivory, cl((vc-y[y.length-1])/fade,0,1));
  }
  function frame(){
    const t = target();
    cur = [lerp(cur[0],t[0],0.10), lerp(cur[1],t[1],0.10), lerp(cur[2],t[2],0.10)];
    document.body.style.backgroundColor = `rgb(${Math.round(cur[0])},${Math.round(cur[1])},${Math.round(cur[2])})`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
