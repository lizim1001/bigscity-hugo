'use strict';
// The same source runs on three ports, including when reached from another machine.
const ports = {a: 1311, b: 1312, c: 1313};
document.querySelectorAll('[data-concept]').forEach(link => {
  const url = new URL(window.location.href);
  url.port = ports[link.dataset.concept];
  url.pathname = window.location.pathname;
  link.href = url.href;
});
const nav = document.querySelector('#main-nav');
const menu = document.querySelector('.menu-toggle');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? '收起导航' : '展开导航');
  nav.classList.toggle('open', open);
});
function closeMenu() {
  nav?.classList.remove('open');
  menu?.setAttribute('aria-expanded', 'false');
  menu?.setAttribute('aria-label', '展开导航');
}
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {if (event.key === 'Escape') closeMenu();});
document.querySelectorAll('[data-paper-browser]').forEach(browser => {
  const facets={tag:new Set(),year:new Set(),theme:new Set()};
  const buttons=[...browser.querySelectorAll('[data-facet]')];
  const list=browser.querySelector('.papers-list');
  const search=browser.querySelector('input[type="search"]');
  const order=browser.querySelector('[data-order]');
  const count=browser.querySelector('[data-result-count]');
  const empty=browser.querySelector('.empty-state');
  const authorChip=browser.querySelector('[data-clear-author]');
  const query=new URLSearchParams(location.search);
  let author=query.get('author')||'';
  let member=query.get('member')||'';
  const normalRank=value=>value==='UTD24'?'UTD':value.replace(/^CCF[ -]?([ABC])$/,'CCF-$1');
  const allowed=Object.fromEntries(Object.keys(facets).map(key=>[key,new Set(buttons.filter(b=>b.dataset.facet===key&&b.dataset.value!=='all').map(b=>b.dataset.value))]));
  for(const key of Object.keys(facets)){
    const values=query.getAll(key).flatMap(v=>v.split(','));
    for(let value of values){if(key==='tag')value=normalRank(value);if(allowed[key].has(value))facets[key].add(value);}
  }
  // Preserve useful links from the earlier archive format.
  for(const value of query.getAll('rank')){const rank=normalRank(value);if(allowed.tag.has(rank))facets.tag.add(rank);}
  const topicLabels={cities:'城市计算',optimization:'组合优化',models:'世界模型',embodied:'具身智能',foundations:'基础方法'};
  if(topicLabels[query.get('topic')])facets.theme.add(topicLabels[query.get('topic')]);
  for(const value of query.getAll('tag'))if(!allowed.tag.has(normalRank(value))&&allowed.theme.has(value))facets.theme.add(value);
  search.value=query.get('q')||'';
  if(query.get('order')==='asc')order.value='asc';
  const model=[...list.querySelectorAll('.paper-row')].map((node,index)=>({node,index,...node.dataset,ranks:JSON.parse(node.dataset.ranks||'[]'),themes:JSON.parse(node.dataset.themes||'[]'),members:JSON.parse(node.dataset.members||'[]'),authors:JSON.parse(node.dataset.authors||'[]')}));
  function matchesAny(selected,values){return !selected.size||values.some(value=>selected.has(value));}
  function update(syncURL=false){
    const terms=search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const selected=model.filter(row=>matchesAny(facets.tag,row.ranks)&&matchesAny(facets.year,[row.year])&&matchesAny(facets.theme,row.themes)&&(!member||row.members.includes(member))&&(!author||row.authors.some(person=>person.name.toLocaleLowerCase()===author.toLocaleLowerCase()))&&terms.every(term=>row.search.includes(term)));
    selected.sort((a,b)=>(order.value==='asc'?Number(a.year)-Number(b.year):Number(b.year)-Number(a.year))||a.index-b.index);
    buttons.forEach(button=>{const values=facets[button.dataset.facet];const active=button.dataset.value==='all'?!values.size:values.has(button.dataset.value);button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));});
    list.replaceChildren(...selected.map(row=>row.node.cloneNode(true)));
    empty.hidden=selected.length>0;count.textContent=`${selected.length} 篇论文`;
    authorChip.hidden=!author;authorChip.textContent=author?`${author} ×`:'';
    if(syncURL){
      const url=new URL(location.href);
      ['tag','year','theme','rank','topic','venue','kind','group','author','member','q','order'].forEach(key=>url.searchParams.delete(key));
      for(const [key,values]of Object.entries(facets))for(const value of values)url.searchParams.append(key,value);
      if(author)url.searchParams.set('author',author);
      if(member)url.searchParams.set('member',member);
      if(search.value.trim())url.searchParams.set('q',search.value.trim());
      if(order.value==='asc')url.searchParams.set('order','asc');
      history.replaceState(null,'',url);
    }
  }
  function reset(){Object.values(facets).forEach(values=>values.clear());author='';member='';search.value='';order.value='desc';update(true);}
  buttons.forEach(button=>button.addEventListener('click',()=>{const values=facets[button.dataset.facet],value=button.dataset.value;if(value==='all')values.clear();else if(values.has(value))values.delete(value);else values.add(value);update(true);}));
  browser.querySelector('[data-reset]').addEventListener('click',reset);
  browser.querySelector('[data-reset-empty]').addEventListener('click',reset);
  authorChip.addEventListener('click',()=>{author='';update(true);});
  search.addEventListener('input',()=>update(true));order.addEventListener('change',()=>update(true));
  document.addEventListener('keydown',event=>{if(event.key==='/'&&!/input|textarea|select/i.test(document.activeElement.tagName)&&!event.metaKey&&!event.ctrlKey){event.preventDefault();search.focus();}});
  update();
  if(location.hash.startsWith('#paper-'))requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({block:'center'}));
});
