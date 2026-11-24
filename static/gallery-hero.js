/* MAIRL: interwoven particle fields, an original abstract composition.
   Cached depth planes keep a dense field affordable during motion. */
(() => {
  'use strict';
  const canvas = document.querySelector('#stars');
  const ctx = canvas.getContext('2d', {alpha: true});
  const button = document.querySelector('#motion');
  if (!ctx) { if(button)button.hidden = true; return; }
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let palette = ['#56e5ff', '#82c8ff', '#e1f7ff'], background = '#101323';
  let onscreen = true;
  let paused = preference.matches, width = 0, height = 0, frame = 0;
  let time = 0, previous = 0, seed = 61116;
  let px = 0, py = 0, tx = 0, ty = 0;
  let planes = [], stars = [], ratio = 1;
  const region=canvas.closest('.starfield-region');
  let regionStart=0,scrollDepth=0;
  function syncScroll(){
    scrollDepth=preference.matches?0:Math.max(0,scrollY-regionStart);
    if(!frame&&onscreen&&!document.hidden&&!preference.matches)draw();
  }
  addEventListener('scroll',syncScroll,{passive:true});
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const makeSprites = () => palette.map(color => {
    const image = document.createElement('canvas'); image.width = image.height = 24;
    const brush = image.getContext('2d');
    const glow = brush.createRadialGradient(12,12,0,12,12,12);
    glow.addColorStop(0, color); glow.addColorStop(.22, color+'ff');
    glow.addColorStop(.48, color+'77'); glow.addColorStop(1, color+'00');
    brush.fillStyle=glow; brush.fillRect(0,0,24,24); return image;
  });
  let sprites = makeSprites();
  function syncTheme() {
    const style = getComputedStyle(canvas);
    background = style.getPropertyValue('--theme-bg').trim() || '#101323';
    palette = [1,2,3].map((n,i) => style.getPropertyValue('--star-'+n).trim() || ['#56e5ff','#82c8ff','#e1f7ff'][i]);
    sprites = makeSprites();
    if(width && height) { makeField(); draw(); }
  }
  syncTheme();
  addEventListener('mairl-theme-change', syncTheme);
  function makeField() {
    seed=61116;
    stars=Array.from({length:width<600?2600:6800},()=>({x:random(),y:random(),r:.25+random()*.85,a:.24+random()*.58,color:Math.floor(random()*3),depth:random()}));
    const count=width<600?16000:34000;
    planes=Array.from({length:3},(_,layer)=>{
      const plane=document.createElement('canvas');
      plane.width=canvas.width; plane.height=canvas.height;
      const brush=plane.getContext('2d'); brush.setTransform(ratio,0,0,ratio,0,0);
      for(let i=0;i<Math.floor(count/3);i++) {
        const u=random()*1.3-.15, depth=random(), scatter=random()-.5;
        // Three open, crossing sheets: convergence and divergence, no closed shell.
        const center=layer===0
          ? .76-.48*u+.14*Math.sin(u*7.4-.8)
          : layer===1
            ? .26+.46*u+.17*Math.sin(u*6.6+1.3)
            : .92-.58*u+.23*Math.sin(u*5.1+2.7);
        const thickness=.028+.13*depth+.045*Math.sin(u*4+layer)**2;
        const x=u*width;
        const y=(center+scatter*thickness+(random()-.5)*.03)*height;
        // Small sharp stars, with a few softly focused points in the nearest plane.
        const diameter=(.9+depth*2.7)*(.7+random()*.7);
        const edgeFade=Math.max(0,Math.min(1,Math.min(y,height-y)/(height*.07)));
        brush.globalAlpha=(.48+depth*.5)*edgeFade;
        brush.drawImage(sprites[layer],x-diameter/2,y-diameter/2,diameter,diameter);
      }
      return plane;
    });
  }
  function resize() {
    const rect=canvas.parentElement.getBoundingClientRect();
    width=rect.width; height=rect.height;
    regionStart=region.getBoundingClientRect().top+scrollY;
    scrollDepth=preference.matches?0:Math.max(0,scrollY-regionStart);
    ratio=Math.min(devicePixelRatio || 1, 1.5);
    canvas.width=Math.round(width*ratio); canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    makeField(); draw();
  }
  function draw() {
    ctx.globalAlpha=1; ctx.clearRect(0,0,width,height);
    for(const star of stars) {
      ctx.globalAlpha=star.a;ctx.fillStyle=palette[star.color];ctx.beginPath();
      const y=((star.y*height+time*(2+star.depth*5)+py*5-scrollDepth*(.025+star.depth*.065))%height+height)%height;
      const x=((star.x*width+px*(4+star.depth*8))%width+width)%width;
      ctx.arc(x,y,star.r,0,Math.PI*2);ctx.fill();
    }
    planes.forEach((plane,layer)=>{
      ctx.save();
      // Continuous vertical drift is independent of pointer movement.
      // Two adjoining copies wrap each transparent depth plane without jumping.
      const driftX=Math.sin(time*.13+layer*1.7)*18;
      ctx.translate(width*.5+driftX+px*(32+layer*18),height*.5+py*(20+layer*12));
      ctx.rotate(Math.sin(time*.06+layer)*.012);
      ctx.globalAlpha=.92+.08*Math.sin(time*.18+layer);
      const tileHeight=height*1.04;
      const travel=time*(9+layer*4)-scrollDepth*(.08+layer*.075);
      const offset=((travel%tileHeight)+tileHeight)%tileHeight;
      ctx.drawImage(plane,-width*.52,-height*.52+offset,width*1.04,tileHeight);
      ctx.drawImage(plane,-width*.52,-height*.52+offset-tileHeight,width*1.04,tileHeight);
      ctx.restore();
    });
    ctx.globalAlpha=1;
  }
  function tick(now) {
    frame=0;
    const delta=previous ? Math.min((now-previous)/1000,.05) : 0;
    previous=now; time+=delta;
    // Time-based response stays consistent across refresh rates.
    const follow=1-Math.exp(-14*delta);
    px+=(tx-px)*follow; py+=(ty-py)*follow;
    draw();
    if (!paused && !document.hidden && onscreen) frame=requestAnimationFrame(tick);
  }
  function update() {
    cancelAnimationFrame(frame); frame=0; previous=0;
    button?.setAttribute('aria-pressed', String(paused));
    if(button)button.innerHTML=paused?'播放星空 <span aria-hidden="true">▷</span>':'暂停星空 <span aria-hidden="true">Ⅱ</span>';
    if (!paused && !document.hidden && onscreen) frame=requestAnimationFrame(tick); else if (onscreen) draw();
  }
  button?.addEventListener('click',()=>{paused=!paused;update();});
  document.addEventListener('visibilitychange',update);
  preference.addEventListener('change',e=>{paused=e.matches;syncScroll();update();});
  addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!paused){tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5;}},{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{tx=ty=0;});
  new ResizeObserver(resize).observe(canvas.parentElement);
  resize(); update();
  new IntersectionObserver(entries=>{onscreen=entries[0].isIntersecting;update();}).observe(canvas);
})();
