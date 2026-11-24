(() => {
 'use strict';
 const root=document.documentElement,preference=matchMedia('(prefers-reduced-motion: reduce)');
 const sync=()=>{root.dataset.auroraPaused=String(preference.matches||document.hidden);};
 preference.addEventListener('change',sync);
 document.addEventListener('visibilitychange',sync);
 sync();
})();
