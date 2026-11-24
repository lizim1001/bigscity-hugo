(() => {
 const root=document.querySelector('.paper-gallery');if(!root)return;
 const dialog=root.querySelector('dialog');let opener=null;
 root.querySelectorAll('[data-figure]').forEach(link=>link.addEventListener('click',event=>{
  if(!dialog.showModal)return;
  event.preventDefault();opener=link;
  const image=dialog.querySelector('img');image.src=link.href;image.alt=link.dataset.caption;
  dialog.querySelector('header p').textContent=link.dataset.caption;dialog.showModal();
 }));
 dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>opener?.focus());
})();
