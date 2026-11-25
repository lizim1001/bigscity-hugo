'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const prefix=document.documentElement.dataset.prefix||'';
let toastTimer;
function toast(message){const el=$('.toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000)}
async function copy(text){toast('正在复制…');try{if(!navigator.clipboard)throw Error();await Promise.race([navigator.clipboard.writeText(text),new Promise((_,reject)=>setTimeout(()=>reject(Error()),2000))]);toast('已复制，可直接分享')}catch{const dialog=$('#detail-dialog');const title=$('#detail-title');title.textContent='复制内容';const p=$('p',dialog);p.textContent=text;p.style.userSelect='all';dialog.showModal();toast('浏览器未完成复制，可在浮层中选择文本')}}
$$('[data-share]').forEach(b=>b.addEventListener('click',()=>copy(location.href)));
$$('[data-copy-cite]').forEach(b=>b.addEventListener('click',()=>copy(b.dataset.copyCite)));
const progress=$('.reading-progress');let scrollQueued=false;
function reading(){progress.style.transform=`scaleX(${Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight))})`;scrollQueued=false}
addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(reading)}},{passive:true});reading();
$$('[data-dialog]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.dialog).showModal()));
$$('.dialog-close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));
const searchDialog=$('#search-dialog');let index=[];let loaded=false;
async function startSearch(){searchDialog.showModal();$('.global-search').focus();if(!loaded){$('.search-status').textContent='正在读取索引…';try{const r=await fetch(prefix+'/search.json');if(!r.ok)throw Error();index=await r.json();loaded=true;search()}catch{$('.search-status').textContent='索引加载失败，请刷新后重试'}}}
$$('[data-search-open]').forEach(b=>b.addEventListener('click',startSearch));
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();startSearch()}});
function search(){const q=$('.global-search').value.trim().toLowerCase();const tokens=q.split(/\s+/).filter(Boolean);const result=index.filter(p=>tokens.every(t=>(p.title+' '+p.text+' '+p.type).toLowerCase().includes(t))).slice(0,35);$('.search-status').textContent=q?`找到 ${result.length} 个结果${result.length===35?'（最多展示 35 项）':''}`:'输入项目、作者、论文题目或关键词';const box=$('.search-results');box.replaceChildren();for(const p of (q?result:result.slice(0,6))){const a=document.createElement('a');a.href=p.url;const small=document.createElement('small');small.textContent=p.type;const h=document.createElement('h3');h.textContent=p.title;const para=document.createElement('p');para.textContent=p.text.slice(0,100);a.append(small,h,para);box.append(a)}}
$('.global-search')?.addEventListener('input',search);
$$('.compare').forEach(box=>$('input',box).addEventListener('input',e=>{const value=e.target.value;box.style.setProperty('--split',value+'%');$('.after',box).style.clipPath=`inset(0 ${100-value}% 0 0)`}));
$$('[data-marquee-toggle]').forEach(b=>b.addEventListener('click',()=>{const box=b.closest('.marquee');const paused=box.classList.toggle('paused');b.textContent=paused?'继续播放':'暂停滚动';b.setAttribute('aria-pressed',String(paused))}));
$('[data-material-press]')?.addEventListener('click',()=>toast('按压反馈 · 局部材质实验'));
$('[data-load-demo]')?.addEventListener('click',async e=>{const box=$('[data-loading-body]');const button=e.target;button.disabled=true;button.textContent='加载中…';box.innerHTML='<div class="skeleton-bar"></div><div class="skeleton-bar short"></div><div class="skeleton-bar"></div>';await new Promise(r=>setTimeout(r,1000));box.replaceChildren();const p=document.createElement('p');p.textContent='加载完成。骨架屏在等待期间保留内容结构。';box.append(p);button.textContent='重新体验加载';button.disabled=false});

// Reproducible, illustrative data only. No experiment results are fabricated.
function rand(seed){let s=seed;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
const random=rand(20261115);
const roads=Array.from({length:96},(_,i)=>{const start=[Math.floor(random()*15),Math.floor(random()*10)],end=[Math.floor(random()*15),Math.floor(random()*10)];return {id:i,start,end,speed:.08+random()*.14,offset:random()*24}});
let simTime=Number(new URLSearchParams(location.search).get('time')||8);if(!Number.isFinite(simTime))simTime=8;simTime=Math.max(0,Math.min(24,simTime));
let playing=false,selectedRoad=null;const bars=Array.from({length:24},(_,i)=>Math.round(12+24*Math.exp(-(((i-8)/2)**2))+29*Math.exp(-(((i-18)/3)**2))));
function tripPoint(r,t){const phase=((t*r.speed+r.offset)%1+1)%1;const [a,b]=r.start,[c,d]=r.end;const len=Math.abs(c-a)+Math.abs(d-b)||1;const pos=phase*len;const dx=Math.abs(c-a);return [pos<dx?a+Math.sign(c-a)*pos:c,pos<dx?b:b+Math.sign(d-b)*(pos-dx)]}
function updateCity(){const hh=Math.floor(simTime)%24,mm=Math.floor((simTime%1)*60);$$('[data-time-value]').forEach(e=>e.textContent=`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`);$$('[data-time]').forEach(e=>e.value=simTime);$$('[data-flow-value]').forEach(e=>e.textContent=bars[hh]);$$('[data-selected-value]').forEach(e=>e.textContent=selectedRoad===null?'全图':`区域 ${selectedRoad+1}`);$$('[data-chart]').forEach(svg=>{svg.replaceChildren();bars.forEach((v,i)=>{const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');rect.setAttribute('x',i*13);rect.setAttribute('y',65-v);rect.setAttribute('width',9);rect.setAttribute('height',v);rect.setAttribute('opacity',i===hh?'1':'.25');svg.append(rect)})})}
$$('[data-time]').forEach(e=>e.addEventListener('input',()=>{simTime=Number(e.value);updateCity();setParam('time',simTime.toFixed(2))}));
$$('[data-play-city]').forEach(b=>b.addEventListener('click',()=>{playing=!playing;$$('[data-play-city]').forEach(e=>{e.textContent=playing?'暂停回放':'播放轨迹';e.setAttribute('aria-pressed',String(playing))})}));
$('[data-clear-region]')?.addEventListener('click',()=>{selectedRoad=null;updateCity();setParam('region','')});
function setParam(k,v){const url=new URL(location.href);if(v==='')url.searchParams.delete(k);else url.searchParams.set(k,v);history.replaceState(null,'',url)}
const region=new URLSearchParams(location.search).get('region');if(region!==null && Number(region)>=0 && Number(region)<15)selectedRoad=Number(region);
updateCity();

let nodeCount=Number(new URLSearchParams(location.search).get('nodes')||12);if(!Number.isFinite(nodeCount))nodeCount=12;nodeCount=Math.round(Math.max(6,Math.min(24,nodeCount)));
let method=new URLSearchParams(location.search).get('method')==='input'?'input':'nearest',route=[],nodes=[],step=100;
function resetRoute(){const r=rand(83);nodes=Array.from({length:nodeCount},()=>[.08+r()*.84,.09+r()*.82]);const pool=nodes.map((_,i)=>i);route=[pool.shift()];while(pool.length){const last=nodes[route[route.length-1]];const next=method==='input'?0:pool.reduce((best,item,i)=>Math.hypot(nodes[item][0]-last[0],nodes[item][1]-last[1])<Math.hypot(nodes[pool[best]][0]-last[0],nodes[pool[best]][1]-last[1])?i:best,0);route.push(pool.splice(next,1)[0])}step=route.length;updateRoute()}
function routeLength(list){return list.reduce((sum,n,i)=>i?sum+Math.hypot(nodes[n][0]-nodes[list[i-1]][0],nodes[n][1]-nodes[list[i-1]][1]):0,0)}
function updateRoute(){const visible=route.slice(0,step);$$('[data-route-length]').forEach(e=>e.textContent=routeLength(visible).toFixed(2));$$('[data-route-step]').forEach(e=>e.textContent=`${Math.max(0,step-1)} / ${nodeCount-1}`);$$('[data-nodes-value]').forEach(e=>e.textContent=nodeCount);$$('[data-nodes]').forEach(e=>e.value=nodeCount);$$('[data-method]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.method===method)));const baseline=routeLength(nodes.map((_,i)=>i));$$('[data-route-baseline]').forEach(e=>e.textContent=baseline.toFixed(2))}
$$('[data-method]').forEach(b=>b.addEventListener('click',()=>{method=b.dataset.method;resetRoute();setParam('method',method)}));
$$('[data-nodes]').forEach(e=>e.addEventListener('input',()=>{nodeCount=Number(e.value);resetRoute();setParam('nodes',nodeCount)}));
$('[data-step]')?.addEventListener('click',()=>{step=step>=route.length?1:step+1;updateRoute()});
$('[data-reset-route]')?.addEventListener('click',()=>{step=1;updateRoute()});resetRoute();

// Lightweight 3D projection, camera orbit, semantic zoom, map picking and linked views.
const scenes=[];
$$('canvas[data-scene]').forEach(canvas=>{const ctx=canvas.getContext('2d');if(!ctx)return;const scene={canvas,ctx,mode:canvas.dataset.scene,angle:.3,pitch:.22,zoom:1,paused:false,visible:true,drag:null,w:0,h:0,chapter:0};scenes.push(scene);new ResizeObserver(()=>{const rect=canvas.getBoundingClientRect();scene.w=rect.width;scene.h=rect.height;canvas.width=rect.width*Math.min(devicePixelRatio,2);canvas.height=rect.height*Math.min(devicePixelRatio,2)}).observe(canvas);new IntersectionObserver(entries=>scene.visible=entries[0].isIntersecting).observe(canvas);canvas.closest('.canvas-shell')?.classList.add('scene-ready');canvas.addEventListener('pointerdown',e=>{scene.drag={x:e.clientX,y:e.clientY,moved:false};if(scene.mode!=='map')canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!scene.drag)return;const dx=e.clientX-scene.drag.x,dy=e.clientY-scene.drag.y;if(Math.abs(dx)+Math.abs(dy)>2)scene.drag.moved=true;scene.angle+=dx*.008;scene.pitch=Math.max(-.8,Math.min(.8,scene.pitch+dy*.005));scene.drag.x=e.clientX;scene.drag.y=e.clientY});canvas.addEventListener('pointerup',e=>{if(scene.mode==='map'&&scene.drag&&!scene.drag.moved){const rect=canvas.getBoundingClientRect();selectedRoad=Math.max(0,Math.min(14,Math.floor((e.clientX-rect.left)/rect.width*15)));updateCity();setParam('region',selectedRoad)}scene.drag=null});canvas.addEventListener('pointercancel',()=>scene.drag=null);canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')scene.angle-=.12;if(e.key==='ArrowRight')scene.angle+=.12;if(e.key==='ArrowUp')scene.pitch-=.1;if(e.key==='ArrowDown')scene.pitch+=.1;if(e.key==='+')scene.zoom=Math.min(1.6,scene.zoom+.15);if(e.key==='-')scene.zoom=Math.max(.6,scene.zoom-.15)}});const shell=canvas.closest('.canvas-shell');$$('[data-scene-control]',shell||canvas.parentElement).forEach(b=>b.addEventListener('click',()=>{if(b.dataset.sceneControl==='rotate'){scene.paused=!scene.paused;b.textContent=scene.paused?'旋转':'暂停';b.setAttribute('aria-pressed',String(scene.paused))}else{scene.zoom=scene.zoom>1?1:1.4;b.textContent=scene.zoom>1?'整体视图':'局部视图'}}))});
function project(scene,x,y,z){const a=scene.angle,c=Math.cos(a),s=Math.sin(a);let xx=x*c-z*s,zz=x*s+z*c;const py=y*Math.cos(scene.pitch)-zz*Math.sin(scene.pitch);const pz=y*Math.sin(scene.pitch)+zz*Math.cos(scene.pitch);const scale=Math.min(scene.w,scene.h)*.36*scene.zoom;return [scene.w*.5+xx*scale,scene.h*.49+py*scale,pz]}
function line(c,pts,stroke,width=1){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}
let galleryScenePalette=null;
function readGalleryScenePalette(){if(!document.body.classList.contains('gallery'))return;const style=getComputedStyle(document.body);const get=name=>style.getPropertyValue(name).trim();galleryScenePalette={ink:get('--scene-ink')||'#bac6ed',accent:get('--scene-accent')||'#b7bbff',grid:get('--scene-grid')||'#a8b6e52b',map:get('--map-surface')||'#161d32',block:get('--map-block')||'#26324c',track:get('--map-track')||'#65769c'};}
readGalleryScenePalette();addEventListener('mairl-theme-change',readGalleryScenePalette);
function renderScene(s){if(!s.w||!s.h||!s.visible)return;const c=s.ctx,d=Math.min(devicePixelRatio,2);c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,s.w,s.h);const dark=document.body.classList.contains('story')||document.body.classList.contains('gallery');const ink=galleryScenePalette?.ink||(dark?'#bac6ed':'#496e62');const accent=galleryScenePalette?.accent||(dark?'#b7bbff':'#9d7750');const globe=s.mode==='globe'||s.chapter===1;
if(s.mode==='map'){const w=s.w,h=s.h;c.fillStyle=galleryScenePalette?.map||(dark?'#142529':'#e6ece2');c.fillRect(0,0,w,h);for(let x=0;x<16;x++)for(let y=0;y<11;y++){c.fillStyle=galleryScenePalette?.block||(dark?'#21383b':'#ced9ca');const ww=w/15,hh=h/10;c.fillRect(x*ww+4,y*hh+4,Math.max(0,ww-9),Math.max(0,hh-9))}if(selectedRoad!==null){c.fillStyle=dark?'#b7bbff18':'#9d775030';c.fillRect(selectedRoad*w/15,0,w/15,h)}roads.forEach(r=>{const [x,y]=tripPoint(r,simTime);const selected=selectedRoad===null||Math.floor(x)===selectedRoad;c.fillStyle=selected?accent:(galleryScenePalette?.track||(dark?'#47605f':'#b6c3b4'));c.beginPath();c.arc(x*w/15,y*h/10,selected?2.8:1.5,0,Math.PI*2);c.fill()});c.font='10px Arial';c.fillStyle=ink;c.fillText('SYNTHETIC URBAN GRID / 96 TRAJECTORIES',20,28);return}
if(s.mode==='route'){const w=s.w,h=s.h;for(let x=0;x<w;x+=30)line(c,[[x,0],[x,h]],galleryScenePalette?.grid||(dark?'#ffffff08':'#203b3408'));for(let y=0;y<h;y+=30)line(c,[[0,y],[w,y]],galleryScenePalette?.grid||(dark?'#ffffff08':'#203b3408'));const pts=route.slice(0,step).map(i=>[nodes[i][0]*w,nodes[i][1]*h]);if(pts.length)line(c,pts,accent,2);nodes.forEach((p,i)=>{c.beginPath();c.arc(p[0]*w,p[1]*h,i===0?7:4,0,7);c.fillStyle=i===0?accent:ink;c.fill();c.font='10px Arial';c.fillText(String(i+1).padStart(2,'0'),p[0]*w+10,p[1]*h-8)});return}
if(globe){for(let j=1;j<35;j++){const lat=Math.PI*j/35;for(let i=0;i<76;i++){const lon=Math.PI*2*i/76;const x=Math.sin(lat)*Math.cos(lon),y=Math.cos(lat),z=Math.sin(lat)*Math.sin(lon);const [px,py,pz]=project(s,x,y,z);const wave=Math.sin(lon*7+lat*9)*Math.cos(lat*8);if(wave<-.5&&j%3)continue;c.globalAlpha=.15+(pz+1)*.35;c.fillStyle=wave>.15?ink:accent;c.beginPath();c.arc(px,py,(s.zoom>1?1.6:1.1)*(1+(pz+1)*.15),0,7);c.fill()}}c.globalAlpha=.55;const orbit=[];for(let i=0;i<=120;i++){const t=i/120*Math.PI*2;orbit.push(project(s,1.25*Math.cos(t),.2*Math.sin(t),.8*Math.sin(t)).slice(0,2))}line(c,orbit,ink,.6);c.globalAlpha=1;if(s.zoom>1){c.fillStyle=ink;c.font='11px Arial';c.fillText('CONCEPTS → RELATIONS → STATES',20,30)}return}
if(s.chapter===3){const pts=Array.from({length:24},(_,i)=>project(s,Math.sin(i*7)*1.25,Math.cos(i*3)*.8,Math.sin(i*5)));pts.forEach((p,i)=>{if(i)line(c,[pts[i-1].slice(0,2),p.slice(0,2)],accent,1);c.fillStyle=ink;c.beginPath();c.arc(p[0],p[1],3,0,7);c.fill()});return}
for(let j=0;j<30;j++){let pts=[];for(let i=0;i<50;i++){const x=(i-25)/18,z=(j-15)/13,y=.35+Math.sin(i*.13+j*.1)*.1;pts.push(project(s,x,y,z).slice(0,2))}line(c,pts,galleryScenePalette?.grid||(dark?'#a8beb92b':'#718c7944'),.7)}for(let j=0;j<11;j++)for(let i=0;i<16;i++){const height=.07+.5*(.5+.5*Math.sin(i*19+j*7));const x=(i-8)/7,z=(j-5)/6;const b=project(s,x,.35,z),top=project(s,x,.35-height,z);c.globalAlpha=.3+(top[2]+2)*.15;line(c,[b.slice(0,2),top.slice(0,2)],ink,Math.max(1,Math.min(s.w,s.h)/160))}c.globalAlpha=1;if(s.chapter===2){const pts=[];for(let i=0;i<35;i++)pts.push(project(s,Math.cos(i*.18),-.1+Math.sin(i*.2)*.2,Math.sin(i*.18)).slice(0,2));line(c,pts,accent,2)}
}
let last=performance.now(),lastCity=0;
function frame(now){const dt=Math.min(50,now-last);last=now;if(playing){simTime=(simTime+dt*.0003)%24;if(now-lastCity>100){updateCity();lastCity=now}}scenes.forEach(s=>{if(s.visible){if(!reduce&&!s.paused&&!s.drag&&s.mode!=='map'&&s.mode!=='route')s.angle+=dt*.000055;renderScene(s)}});requestAnimationFrame(frame)}requestAnimationFrame(frame);
const chapters = $$('.chapter-steps article');
if (chapters.length) {
  const cover = $('[data-chapter-cover]');
  const title = $('[data-chapter-title]');
  const links = $$('.chapter-nav a');
  let activeChapter;
  let framePending = false;
  function syncChapter() {
    framePending = false;
    const marker = window.innerHeight * (window.matchMedia('(max-width: 800px)').matches ? 0.72 : 0.55);
    const chapter = chapters.find(item => item.getBoundingClientRect().bottom > marker) || chapters[chapters.length - 1];
    if (chapter === activeChapter) return;
    activeChapter = chapter;
    cover.src = chapter.dataset.coverSrc;
    cover.alt = chapter.dataset.coverAlt;
    title.textContent = chapter.dataset.title;
    chapters.forEach(item => item.classList.toggle('active', item === chapter));
    for (const link of links) {
      const active = link.hash === '#' + chapter.id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    }
  }
  function scheduleChapterSync() {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(syncChapter);
  }
  window.addEventListener('scroll', scheduleChapterSync, { passive: true });
  window.addEventListener('resize', scheduleChapterSync);
  window.addEventListener('load', scheduleChapterSync);
  syncChapter();
}

// A real procedural WebGL shader, isolated in the design playground.
const shader=$('canvas[data-shader]');if(shader){const gl=shader.getContext('webgl',{antialias:false});if(gl){const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);return s};const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,'precision mediump float;uniform float t;uniform vec2 r;uniform vec2 m;void main(){vec2 u=gl_FragCoord.xy/r;float w=sin(u.x*9.+t)*cos(u.y*7.-t*.7);float d=length(u-m);vec3 a=vec3(.18,.33,.36),b=vec3(.66,.63,.83);gl_FragColor=vec4(mix(a,b,.5+.25*w+.2*sin(d*18.-t)),1.);}'));gl.linkProgram(p);gl.useProgram(p);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(p,'p');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);let mx=.5,my=.5;shader.addEventListener('pointermove',e=>{const r=shader.getBoundingClientRect();mx=(e.clientX-r.left)/r.width;my=1-(e.clientY-r.top)/r.height});let visible=true;new IntersectionObserver(e=>visible=e[0].isIntersecting).observe(shader);function draw(t){if(visible){const r=shader.getBoundingClientRect();shader.width=r.width;shader.height=r.height;gl.viewport(0,0,r.width,r.height);gl.uniform1f(gl.getUniformLocation(p,'t'),reduce?0:t*.0003);gl.uniform2f(gl.getUniformLocation(p,'r'),r.width,r.height);gl.uniform2f(gl.getUniformLocation(p,'m'),mx,my);gl.drawArrays(gl.TRIANGLES,0,6)}requestAnimationFrame(draw)}requestAnimationFrame(draw)}else{shader.replaceWith(Object.assign(document.createElement('p'),{textContent:'当前设备未启用 WebGL，保留静态背景。'}))}}

