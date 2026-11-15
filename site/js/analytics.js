/* Cookieless analytics beacon stub. Fire-and-forget, respects Do Not Track. */
const dnt=()=>{const d=typeof navigator!=='undefined'&&(navigator.doNotTrack||navigator.msDoNotTrack)||typeof window!=='undefined'&&window.doNotTrack;return d==='1'||d==='yes'};
export function track(event){
  if(dnt())return;
  try{navigator.sendBeacon('/api/event',JSON.stringify({event,ts:Date.now(),path:location.pathname}));}catch(e){}
}
export function bindTracked(root){
  root.addEventListener('click',e=>{
    const el=e.target.closest('[data-track]');
    if(el)track(el.dataset.track);
  });
}
