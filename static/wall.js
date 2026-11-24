import {balanceColumns} from './balance.mjs';
const wall=document.querySelector('.paper-wall');
if(wall){
 const cards=[...wall.querySelectorAll('.paper-print')];let lastWidth=0,lastCount=0,pending=false;
 function arrange(){pending=false;const width=wall.clientWidth,count=innerWidth<=600?1:innerWidth<=1000?2:3;if(Math.abs(width-lastWidth)<1&&count===lastCount)return;lastWidth=width;lastCount=count;
 const style=getComputedStyle(wall),gap=parseFloat(style.getPropertyValue('--wall-gap'))||28,w=(width-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-gap*(count-1))/count;
 cards.forEach(c=>c.style.width=w+'px');const heights=cards.map(c=>c.offsetHeight);const groups=balanceColumns(heights,count),active=document.activeElement,restore=wall.contains(active);
 const columns=groups.map(group=>{const col=document.createElement('div');col.className='paper-column';for(const i of group){cards[i].style.removeProperty('width');cards[i].style.setProperty('--paper-tilt',(i%2?'.55deg':'-.55deg'));col.append(cards[i])}return col});
 wall.style.setProperty('--wall-columns',count);wall.classList.add('is-balanced');wall.replaceChildren(...columns);if(restore)active.focus({preventScroll:true});
 }
 const queue=()=>{if(!pending){pending=true;requestAnimationFrame(arrange)}};
 document.fonts.ready.then(queue);new ResizeObserver(queue).observe(wall);
}
