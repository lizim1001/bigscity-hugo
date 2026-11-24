(() => {
 'use strict';
 const root=document.querySelector('.publication-app');if(!root)return;
 const papers=JSON.parse(document.querySelector('#publication-data').textContent);
 const results=root.querySelector('.publication-results'),filters=root.querySelector('.primary-filters');
 const search=root.querySelector('#paper-search');
 // Installed page shares the existing portable reading list; retain unknown entries.
 const key='mairl.showcase.reading-list.v1';
 const normalizeTitle=text=>String(text||'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const paperById=new Map(),paperByAlias=new Map(),paperByTitle=new Map(),memberNames=new Map();
 for(const p of papers){
  paperById.set(p.id,p);
  for(const alias of p.aliases||[])if(!paperByAlias.has(alias))paperByAlias.set(alias,p);
  const title=normalizeTitle(p.title);if(!paperByTitle.has(title))paperByTitle.set(title,p);
  for(const a of p.author_entries||[])if(a.member_id&&!memberNames.has(a.member_id))memberNames.set(a.member_id,a.member_name);
 }
 const resolveRecord=record=>paperById.get(record.id)||paperByAlias.get(record.id)||paperByTitle.get(normalizeTitle(record.title));
 function storedReading(){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter(x=>x&&typeof x.id==='string'&&typeof x.title==='string'):[];}catch{return [];}}
 function readUnifiedReading(){return [...new Set(storedReading().map(resolveRecord).filter(Boolean).map(p=>p.id))];}
 function persistUnifiedReading(){
  const unknown=storedReading().filter(record=>!resolveRecord(record));
  const records=[...unknown,...saved.map(id=>paperById.get(id)).filter(Boolean).map(p=>({id:p.id,title:p.title}))];
  try{localStorage.setItem(key,JSON.stringify(records));dispatchEvent(new Event('mairl-reading-change'));}
  catch{notify('当前浏览器无法持久保存收藏');}
 }
 let saved=readUnifiedReading();
 try{
  if(!localStorage.getItem('mairl.showcase.publications.migrated.v1')){
   const old=JSON.parse(localStorage.getItem('mairl.showcase.publications.saved.v1')||'[]');
   const previous=Array.isArray(old)?old.map(id=>resolveRecord({id})).filter(Boolean).map(p=>p.id):[];
   saved=[...new Set([...saved,...previous])];
   if(previous.length)persistUnifiedReading();
   localStorage.setItem('mairl.showcase.publications.migrated.v1','1');
  }
 }catch{}
 const names=[...new Set(papers.flatMap(p=>p.groups.map(g=>g.primary)))];if(papers.some(p=>!p.groups.length))names.push('未标注分类');
 const labelConfig=JSON.parse(document.querySelector('#publication-labels').textContent);
 const primaryLabels=new Map(labelConfig.rows.flatMap(row=>Object.entries(row.labels)));
 const categoryRows=labelConfig.rows.map(row=>({title:row.title,keys:Object.keys(row.labels).filter(key=>names.includes(key))}));
 const other=names.filter(key=>!primaryLabels.has(key));
 if(other.length)categoryRows.push({title:'其他',keys:other});
 const primaryLabel=key=>primaryLabels.get(key)||key;
 const secondaryLabels=labels=>[...new Set(labels.flatMap(label=>label.split(/[;；]/)).map(label=>label.trim()).filter(Boolean).map(label=>Object.hasOwn(labelConfig.secondary,label)?labelConfig.secondary[label]:label))];
 const paperTags=p=>groups(p).flatMap(g=>[primaryLabel(g.primary),...secondaryLabels(g.secondary)]);
 const years=[...new Set(papers.map(p=>p.year).filter(Boolean))].sort((a,b)=>b-a);
 const pageSize=10;
 const defaults=()=>({page:1,category:'all',year:'all',q:'',view:'category',author:'',member:''});
 let state=defaults(),timer,toastTimer;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safe=url=>/^https?:\/\//.test(url);
 function notify(message){const el=root.querySelector('.publication-toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2500);}
 function loadState(){const p=new URL(location.href).searchParams;state={page:Math.max(1,Math.floor(Number(p.get('page')))||1),category:names.includes(p.get('category'))?p.get('category'):'all',year:[...years.map(String),'unknown'].includes(p.get('year'))?p.get('year'):'all',q:p.get('q')||'',view:p.get('view')==='year'?'year':'category',author:p.get('author')||'',member:p.get('member')||''};if(state.view==='year')state.category='all';else state.year='all';}
 function writeState(){const url=new URL(location.href);for(const name of ['page','category','year','q','view','author','member','saved'])url.searchParams.delete(name);for(const name of ['page','category','year','q','view','author','member'])if(state[name]!==defaults()[name])url.searchParams.set(name,state[name]);history.replaceState(null,'',url);}
 const groups=p=>p.groups.length?p.groups:[{primary:'未标注分类',secondary:[]}];
 const secondaryByPrimary=new Map(names.map(name=>[name,secondaryLabels(papers.flatMap(p=>groups(p).filter(g=>g.primary===name).flatMap(g=>g.secondary)))]));
 const sorted=ps=>[...ps].sort((a,b)=>(b.year||0)-(a.year||0)||a.source_row-b.source_row);
 const primaryMatch=(p,c)=>c==='all'||groups(p).some(g=>g.primary===c);
 const authorKey=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
 const personMatch=p=>(!state.member||(p.member_ids||[]).includes(state.member))&&(!state.author||(p.author_entries||[]).some(a=>[a.name,...(a.aliases||[])].some(name=>authorKey(name)===authorKey(state.author))));
 const featuredAuthorKeys=new Set(['王静远','王静远老师','王静远教授','jingyuanwang','wangjingyuan']);
 const featuredAuthor=a=>a.member_id?a.member_id==='jingyuan-wang':[a.name,a.label].some(value=>featuredAuthorKeys.has(String(value||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'')));
 function authorMarkup(p){return (p.author_entries||[]).map(a=>`<a class="publication-author${a.member_id?' linked-member':''}${featuredAuthor(a)?' author-featured':''}" href="${esc(a.url)}" ${a.member_id?`data-member-id="${esc(a.member_id)}"`:''} title="${esc(a.member_name||a.name)} · ${a.url.includes('/members/')?'成员介绍':'相关论文'}">${esc(a.label)}</a>`).join('<span class="author-comma">, </span>')||esc(p.authors);}

 const pager=document.createElement('nav');
 pager.className='paper-pagination';
 pager.setAttribute('aria-label','论文分页');
 results.after(pager);
 results.tabIndex=-1;
 results.id='paper-results';
 root.querySelector('.publication-status').classList.remove('sr-only');
 let anchorId=location.hash.slice(1);
 function clearPaperAnchor(){
  if(location.hash)history.replaceState(null,'',location.pathname+location.search);
 }
 function goToPage(page){
  clearPaperAnchor();
  state.page=page;
  const url=new URL(location.href);
  url.searchParams.set('page',page);
  history.pushState(null,'',url);
  render();
  results.focus({preventScroll:true});
  results.scrollIntoView({block:'start'});
 }
 function pageLink(label,page,enabled){
  if(!enabled)return `<span aria-disabled="true">${label}</span>`;
  const url=new URL(location.href);
  url.search='';
  for(const key of ['category','year','q','view','author','member']){
   if(state[key]!==defaults()[key])url.searchParams.set(key,state[key]);
  }
  if(page>1)url.searchParams.set('page',page);
  url.hash='paper-results';
  return `<a href="${esc(url.pathname+url.search+url.hash)}">${label}</a>`;
 }
 pager.addEventListener('change',event=>goToPage(Number(event.target.value)));
 function row(p){
  const id=p.id;
  const links=[...p.links.pdf.map(u=>['PDF',u]),...p.links.code.map(u=>['代码/资料',u]),...p.links.posts.map((u,i)=>[p.links.posts.length>1?'推文 '+(i+1):'推文解读',u])].filter(x=>safe(x[1]));
  const labels=groups(p).map(g=>`<span class="taxonomy-pair"><span class="paper-chip chip-primary">${esc(primaryLabel(g.primary))}</span>${secondaryLabels(g.secondary).map(name=>`<span class="paper-chip chip-secondary">${esc(name)}</span>`).join('')}</span>`).join('');
  return `<article class="publication-row spotlight-surface" id="${id}"><div><h3>${esc(p.title)}</h3><p class="authors">${authorMarkup(p)}</p><div class="paper-highlights" aria-label="论文分类及会议">${labels}<span class="paper-chip chip-venue venue-short" title="${esc(p.venue_full)}">${esc(p.venue)}</span></div><div class="paper-actions-v2">${links.map(([label,u])=>`<a href="${esc(u)}" target="_blank" rel="noopener">${label} </a>`).join('')}<button data-cite="${p.id}">复制引用</button><button data-bookmark="${p.id}" aria-pressed="${saved.includes(p.id)}">${saved.includes(p.id)?'已收藏':'收藏'}</button></div><button type="button" class="paper-detail-trigger" data-paper-detail="${p.id}" aria-haspopup="dialog">详细信息</button></div></article>`;

 }
 function render(update=true){
  const focused=filters.contains(document.activeElement)?{category:document.activeElement.dataset.category,year:document.activeElement.dataset.year}:null;
  search.value=state.q;
  const context=root.querySelector('.author-context');
  context.hidden=!state.author&&!state.member;
  const personName=memberNames.get(state.member);
  context.querySelector('span').textContent=(state.member?(personName||state.member):state.author)+' 的论文';

  const query=state.q.trim().toLowerCase();
  const pool=papers.filter(p=>personMatch(p)&&(state.year==='all'||state.year==='unknown'&&!p.year||String(p.year)===state.year)&&(!query||[p.title,p.authors,p.venue,p.venue_full,p.tags_raw,...paperTags(p)].join(' ').toLowerCase().includes(query)));
  const selected=pool.filter(p=>primaryMatch(p,state.category));
  filters.classList.toggle('is-year',state.view==='year');
  filters.setAttribute('aria-label',state.view==='year'?'按年份筛选论文':'一级与二级研究分类');
  if(state.view==='category'){
   const counts=new Map(names.map(key=>[key,0]));
   for(const paper of pool)for(const key of new Set(groups(paper).map(g=>g.primary)))counts.set(key,counts.get(key)+1);
   const button=key=>`<button type="button" data-category="${esc(key)}" aria-pressed="${state.category===key}">${esc(key==='all'?'全部':primaryLabel(key))}<span>${key==='all'?pool.length:counts.get(key)}</span></button>`;
   filters.innerHTML=`<div class="publication-filter-options">${button('all')}</div>`+categoryRows.filter(row=>row.keys.length).map(row=>`<div class="publication-filter-row" role="group" aria-label="${esc(row.title)}"><span class="publication-filter-name" aria-hidden="true">${esc(row.title)}</span><div class="publication-filter-options">${row.keys.map(button).join('')}</div></div>`).join('');

  }else{
   const yearPool=papers.filter(p=>personMatch(p)&&(!query||[p.title,p.authors,p.venue,p.venue_full,p.tags_raw,...paperTags(p)].join(' ').toLowerCase().includes(query)));
   filters.innerHTML=['all',...years.map(String),'unknown'].map(y=>`<button type="button" data-year="${y}" aria-pressed="${state.year===y}">${y==='all'?'全部':y==='unknown'?'年份待补':y}<span>${yearPool.filter(p=>y==='all'||y==='unknown'&&!p.year||String(p.year)===y).length}</span></button>`).join('');
  }
  const secondaries=root.querySelector('.chosen-secondaries');
  const children=state.view==='category'&&state.category!=='all'?(secondaryByPrimary.get(state.category)||[]):[];
  secondaries.innerHTML=children.map(name=>`<span>${esc(name)}</span>`).join('');
  secondaries.hidden=children.length===0;
  secondaries.setAttribute('aria-label',primaryLabel(state.category)+' 下的二级方向');
  const grouped=new Map();
  for(const paper of sorted(selected)){
   const heading=state.view==='year' ? String(paper.year||'年份待补') :
    (state.category==='all' ? groups(paper)[0].primary : state.category);
   if(!grouped.has(heading))grouped.set(heading,[]);
   grouped.get(heading).push(paper);
  }
  const headings=state.view==='year' ? [...grouped.keys()] : names.filter(name=>grouped.has(name));
  const entries=headings.flatMap(heading=>grouped.get(heading).map(paper=>({heading,paper})));
  const totalPages=Math.max(1,Math.ceil(entries.length/pageSize));
  if(anchorId){
   const index=entries.findIndex(entry=>entry.paper.id===anchorId);
   if(index>=0)state.page=Math.floor(index/pageSize)+1;
   anchorId='';
  }
  state.page=Math.min(state.page,totalPages);
  const offset=(state.page-1)*pageSize;
  const visible=new Map();
  for(const {heading,paper} of entries.slice(offset,offset+pageSize)){
   if(!visible.has(heading))visible.set(heading,[]);
   visible.get(heading).push(paper);
  }
  root.querySelector('.publication-status').textContent=entries.length
   ? `共 ${entries.length} 篇 · 当前显示第 ${offset+1}–${Math.min(offset+pageSize,entries.length)} 篇`
   : '0 篇论文';
  results.innerHTML=[...visible].map(([heading,items])=>
   `<section class="primary-section"><div class="primary-heading"><h2>${esc(primaryLabel(heading))}</h2></div>${items.map(row).join('')}</section>`).join('');
  pager.hidden=totalPages===1;
  pager.innerHTML=`${pageLink('上一页',state.page-1,state.page>1)}
   <select aria-label="选择论文页码">${Array.from({length:totalPages},(_,i)=>`<option value="${i+1}" ${state.page===i+1?'selected':''}>第 ${i+1} / ${totalPages} 页</option>`).join('')}</select>
   ${pageLink('下一页',state.page+1,state.page<totalPages)}`;
  root.querySelector('.publication-empty').hidden=selected.length>0;
  root.querySelectorAll('.paper-detail-dialog [data-bookmark]').forEach(b=>{const active=saved.includes(b.dataset.bookmark);b.setAttribute('aria-pressed',String(active));b.textContent=active?'已收藏':'收藏';});
  if(update)writeState();
  if(innerWidth<=700){
   const selected=filters.querySelector('[aria-pressed="true"]');
   if(selected){const r=selected.getBoundingClientRect(),box=filters.getBoundingClientRect();if(r.left<box.left||r.right>box.right)filters.scrollLeft+=r.left-box.left;}
  }
  if(focused){const button=[...filters.querySelectorAll('button')].find(b=>focused.category?b.dataset.category===focused.category:b.dataset.year===focused.year);button?.focus({preventScroll:true});}
 }
 const detailDialog=root.querySelector('.paper-detail-dialog');let detailOpener=null;
 function openPaperDetail(p,opener){
  detailOpener=opener;detailDialog.dataset.paperId=p.id;
  detailDialog.querySelector('#paper-detail-title').textContent=p.title;
  const resources=[...p.links.pdf.map(url=>['论文 PDF',url]),...p.links.code.map(url=>['代码 / 资料',url]),...p.links.posts.map((url,i)=>[p.links.posts.length>1?'推文解读 '+(i+1):'推文解读',url])].filter(([,url])=>safe(url));
  detailDialog.querySelector('.paper-detail-body').innerHTML=`<p class="detail-authors">${authorMarkup(p)}</p><div class="detail-badges"><span class="paper-chip chip-venue" title="${esc(p.venue_full)}">${esc(p.venue)}</span></div><dl class="paper-metadata"><div><dt>会议 / 期刊</dt><dd>${esc(p.venue_full||'待补充')}</dd></div>${p.year?`<div><dt>年份</dt><dd>${p.year}</dd></div>`:''}${p.rank?`<div><dt>分级</dt><dd>${esc(p.rank)}</dd></div>`:''}</dl><section class="detail-taxonomy"><h3>研究方向</h3>${groups(p).map(g=>`<div class="taxonomy-pair"><span class="paper-chip chip-primary">${esc(primaryLabel(g.primary))}</span>${secondaryLabels(g.secondary).map(x=>`<span class="paper-chip chip-secondary">${esc(x)}</span>`).join('')}</div>`).join('')}</section>${resources.length?`<section class="detail-resources"><h3>论文与资料</h3>${resources.map(([label,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`).join('')}</section>`:''}<div class="paper-actions-v2 detail-paper-actions"><button data-cite="${p.id}">复制引用</button><button data-bookmark="${p.id}" aria-pressed="${saved.includes(p.id)}">${saved.includes(p.id)?'已收藏':'收藏'}</button></div>`;
  detailDialog.showModal();
 }
 detailDialog.querySelector('[data-paper-detail-close]').addEventListener('click',()=>detailDialog.close());
 detailDialog.addEventListener('close',()=>{const target=detailOpener?.isConnected?detailOpener:root.querySelector(`[data-paper-detail="${detailDialog.dataset.paperId}"]`);target?.focus({preventScroll:true});});
 detailDialog.addEventListener('click',event=>{if(event.target!==detailDialog)return;const r=detailDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)detailDialog.close();});
 async function copy(text){try{await navigator.clipboard.writeText(text);notify('已复制');}catch{const dialog=root.querySelector('.citation-dialog');dialog.querySelector('textarea').value=text;dialog.showModal();dialog.querySelector('textarea').select();}}
 filters.addEventListener('click',e=>{const category=e.target.closest('[data-category]'),year=e.target.closest('[data-year]');state.page=1;clearPaperAnchor();if(category){state.category=category.dataset.category;state.view='category';state.year='all';render();}else if(year){state.year=year.dataset.year;render();}});
 search.addEventListener('input',()=>{clearPaperAnchor();state.page=1;state.q=search.value;clearTimeout(timer);timer=setTimeout(render,180);});
 const reset=()=>{clearPaperAnchor();clearTimeout(timer);state=defaults();render();};
root.querySelector('#empty-reset').addEventListener('click',reset);
 root.addEventListener('click',e=>{
  const trigger=e.target.closest('[data-paper-detail]');if(trigger){const p=paperById.get(trigger.dataset.paperDetail);if(p)openPaperDetail(p,trigger);}
  const cite=e.target.closest('[data-cite]');if(cite){const p=paperById.get(cite.dataset.cite);copy(`${p.authors}. ${p.title}. ${p.venue_full}`);}
  const b=e.target.closest('[data-bookmark]');if(b){const id=b.dataset.bookmark;saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];persistUnifiedReading();render();}
 });
 root.querySelector('[data-author-clear]').addEventListener('click',()=>{clearPaperAnchor();state.page=1;state.author='';state.member='';render();});
 root.querySelector('[data-close]').addEventListener('click',()=>root.querySelector('.citation-dialog').close());
 document.querySelector('[data-publication-search]')?.addEventListener('click',()=>search.focus());

 addEventListener('popstate',()=>{anchorId=location.hash.slice(1);loadState();render(false);if(location.hash)document.getElementById(location.hash.slice(1))?.scrollIntoView();});
 addEventListener('mairl-reading-change',()=>{saved=readUnifiedReading();render(false);});
 root.querySelector('.publication-tools').hidden=false;loadState();render(false);
 if(location.hash){requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());}
})();
