(() => {
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 const selector='.chosen-secondaries>span,.paper-chip.chip-secondary';
 const visible=new Set();let serial=0;
 const io=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){visible.add(e.target);e.target.classList.add('beam-visible')}else{visible.delete(e.target);e.target.classList.remove('beam-visible')}}});
 function register(node){if(!(node instanceof Element))return;const labels=[...(node.matches(selector)?[node]:[]),...node.querySelectorAll(selector)];for(const label of labels){if(label.dataset.beam)continue;label.dataset.beam='true';label.style.setProperty('--beam-delay',(-serial++%12*.43)+'s');io.observe(label)}}
 register(document.body);
 const root=document.querySelector('.publication-app');if(root)new MutationObserver(records=>{for(const e of visible)if(!e.isConnected){visible.delete(e);io.unobserve(e)}for(const r of records){for(const node of r.removedNodes)if(node instanceof Element){for(const e of [node,...node.querySelectorAll('[data-beam]')])if(e.dataset.beam){io.unobserve(e);visible.delete(e)}}for(const node of r.addedNodes)register(node)}}).observe(root,{childList:true,subtree:true});
 document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('effects-hidden',document.hidden));
 let current=null,queued=false,point=null;
 const clear=()=>{current?.classList.remove('is-spotlit');current=null};
 function update(){queued=false;if(!point||!fine.matches||document.hidden){clear();return}const target=point.target.closest?.('.spotlight-surface');if(current!==target){clear();current=target}if(!current)return;const r=current.getBoundingClientRect();current.style.setProperty('--spot-x',reduce.matches?'50%':(point.x-r.left)+'px');current.style.setProperty('--spot-y',reduce.matches?'50%':(point.y-r.top+current.scrollTop)+'px');current.classList.add('is-spotlit')}
 document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;point={target:e.target,x:e.clientX,y:e.clientY};if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});
 document.addEventListener('pointerout',e=>{if(!e.relatedTarget)clear()});document.addEventListener('visibilitychange',()=>{if(document.hidden)clear()});fine.addEventListener('change',clear);reduce.addEventListener('change',clear);
})();
