/* ============================================================
   LILITH — fx.js  · bespoke signature layer
   WebGL venom shader · custom cursor · magnetic · kinetic type
   All progressive-enhancement; degrades to the static site.
   ============================================================ */
(function(){
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const fine   = matchMedia('(pointer:fine)').matches;
  const lerp=(a,b,n)=>a+(b-a)*n;

  /* ---------- 1 · VENOM SHADER BACKGROUND ---------- */
  function venom(){
    if(reduce) return;
    const cv=document.createElement('canvas'); cv.id='venom'; cv.setAttribute('aria-hidden','true');
    document.body.insertBefore(cv,document.body.firstChild);
    const gl=cv.getContext('webgl')||cv.getContext('experimental-webgl');
    if(!gl){ cv.remove(); return; }
    const vs=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
    const fs=`precision mediump float;uniform vec2 u_res;uniform float u_t;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_res;
        vec2 p=uv*vec2(u_res.x/u_res.y,1.);
        float t=u_t*0.025;
        float q=fbm(p*1.5+vec2(t,t*.6));
        float f=fbm(p*1.4+q*1.3+vec2(-t*.5,t*.35));
        vec3 base=vec3(.052,.036,.033);
        vec3 blood=vec3(.34,.075,.07);
        float m=smoothstep(.42,1.,f);
        vec3 col=mix(base,blood,m*.55);
        col*=1.-.55*length(uv-.5);
        col+=blood*.05*smoothstep(.6,1.,fbm(p*3.+t));
        gl_FragColor=vec4(col,1.);
      }`;
    function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o;}
    const prog=gl.createProgram();
    gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));
    gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));
    gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){ cv.remove(); return; }
    gl.useProgram(prog);
    const buf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(prog,'p');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    const uRes=gl.getUniformLocation(prog,'u_res'), uT=gl.getUniformLocation(prog,'u_t');
    const cap=fine?0.85:0.6;                 // render scale (perf)
    function resize(){
      const w=Math.floor(innerWidth*cap), h=Math.floor(innerHeight*cap);
      cv.width=w; cv.height=h; gl.viewport(0,0,w,h); gl.uniform2f(uRes,w,h);
    }
    resize(); addEventListener('resize',resize);
    let t0=performance.now(), raf;
    function frame(now){
      if(!document.hidden){ gl.uniform1f(uT,(now-t0)/1000); gl.drawArrays(gl.TRIANGLES,0,3); }
      raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);
    document.addEventListener('visibilitychange',()=>{ if(!document.hidden){ t0=performance.now()-1; } });
  }

  /* ---------- 2 · CUSTOM CURSOR + 3 · MAGNETIC ---------- */
  function cursorAndMagnetic(){
    if(!fine||reduce) return;
    const dot=document.createElement('div'); dot.className='cursor';
    const ring=document.createElement('div'); ring.className='cursor-ring';
    document.body.append(dot,ring); document.body.classList.add('has-cursor');
    let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
    addEventListener('mousemove',e=>{ mx=e.clientX; my=e.clientY; dot.style.transform=`translate(${mx}px,${my}px)`; },{passive:true});
    (function r(){ rx=lerp(rx,mx,.18); ry=lerp(ry,my,.18); ring.style.transform=`translate(${rx}px,${ry}px)`; requestAnimationFrame(r); })();
    const hot='a,button,.serpent,.card,details summary,[data-buy],input,.faq-list summary';
    addEventListener('mouseover',e=>{ if(e.target.closest(hot)) ring.classList.add('hot'); });
    addEventListener('mouseout', e=>{ if(e.target.closest(hot)) ring.classList.remove('hot'); });

    /* magnetic pull on key controls */
    const mags=document.querySelectorAll('.btn-primary,.btn-ghost,#enterBtn,#cfgBuy,.mh-mark');
    mags.forEach(el=>{
      const R=90;
      el.addEventListener('mousemove',e=>{
        const b=el.getBoundingClientRect(), cx=b.left+b.width/2, cy=b.top+b.height/2;
        const dx=e.clientX-cx, dy=e.clientY-cy;
        if(Math.hypot(dx,dy)<R+Math.max(b.width,b.height)/2){ el.style.transform=`translate(${dx*0.28}px,${dy*0.32}px)`; }
      });
      el.addEventListener('mouseleave',()=>{ el.style.transform=''; });
    });
  }

  /* ---------- 4 · KINETIC HEADLINES (line mask reveal) ---------- */
  function kinetic(){
    const els=document.querySelectorAll('.kinetic');
    if(!els.length) return;
    els.forEach(el=>{
      const lines=el.innerHTML.split(/<br\s*\/?>/i);
      el.innerHTML=lines.map(l=>`<span class="kw"><span>${l}</span></span>`).join('');
      [...el.querySelectorAll('.kw>span')].forEach((s,i)=>s.style.setProperty('--kd',(i*0.09)+'s'));
    });
    if(reduce){ els.forEach(e=>e.classList.add('in')); return; }
    const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }),{threshold:0.2});
    els.forEach(e=>io.observe(e));
  }

  /* ---------- 5 · LOADER → HOME cinematic fade ---------- */
  function pageFade(){
    const enter=document.getElementById('enterBtn');
    if(!enter) return;
    const veil=document.createElement('div'); veil.className='page-veil'; document.body.appendChild(veil);
    enter.addEventListener('click',e=>{
      e.preventDefault(); veil.classList.add('on');
      setTimeout(()=>{ location.href=enter.getAttribute('href'); },560);
    });
  }

  function init(){ /* venom() disabled on the ivory theme */ cursorAndMagnetic(); kinetic(); pageFade(); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded',init);
})();
