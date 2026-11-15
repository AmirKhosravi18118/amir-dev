/* Site behaviour: nav, reveal, fab, copy, form, marquee. DE is static in HTML; EN mirror lives at /en/. */
import { track, bindTracked } from './analytics.js';
import { loadStrings, t } from './i18n.js';
import { renderWork } from './tiles.js';
import { initGallery, preload } from './gallery.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
document.documentElement.classList.add('js');

/* marquee: duplicate content for a seamless loop (unless reduced motion) */
(function marquee(){const m=$('#marquee');if(m&&!matchMedia('(prefers-reduced-motion: reduce)').matches)m.innerHTML+=m.innerHTML})();

/* reveal on scroll */
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{rootMargin:'0px 0px -8% 0px'});
$$('.rv').forEach(el=>io.observe(el));

/* scrollspy */
const spy=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting)$$('[data-spy]').forEach(b=>b.setAttribute('aria-current',b.dataset.scroll===x.target.id?'page':'false'))}),{rootMargin:'-45% 0px -50% 0px'});
['leistungen','projekte','ablauf','ueber','anfrage'].forEach(id=>{const el=document.getElementById(id);if(el)spy.observe(el)});

/* menu */
$('#menuBtn')&&$('#menuBtn').addEventListener('click',()=>{const n=$('#navLinks'),o=n.classList.toggle('open');$('#menuBtn').setAttribute('aria-expanded',o)});

/* delegated clicks: scroll, copy, fab close */
document.addEventListener('click',e=>{
  const s=e.target.closest('[data-scroll]');
  if(s){const el=document.getElementById(s.dataset.scroll);
    if(el)el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    if(s.hasAttribute('data-closefab'))toggleFab(false);
    $('#navLinks')&&$('#navLinks').classList.remove('open');$('#menuBtn')&&$('#menuBtn').setAttribute('aria-expanded','false');return}
  const og=e.target.closest('[data-open]');
  if(og){import('./gallery.js').then(m=>m.openGallery(og.dataset.open));return}
  const c=e.target.closest('[data-copy]');
  if(c){const txt=c.dataset.copy,done=()=>{const l=c.querySelector('small')||c,o=l.textContent;l.textContent=t('ct.copied');setTimeout(()=>l.textContent=o,1600)};
    navigator.clipboard.writeText(txt).then(done).catch(()=>{});return}
});

/* language switch: DE at root, EN mirror under /en/ */
$$('[data-golang]').forEach(b=>b.addEventListener('click',()=>{location.href=b.dataset.golang}));

/* floating contact */
function toggleFab(open){const p=$('#fabPanel');if(!p)return;p.hidden=open===undefined?!p.hidden:!open;$('#fabBtn').setAttribute('aria-expanded',!p.hidden)}
$('#fabBtn')&&$('#fabBtn').addEventListener('click',()=>toggleFab());
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#fabPanel').hidden)toggleFab(false)});

/* request-type toggle */
$$('.seg button[data-kind]').forEach(b=>b.addEventListener('click',()=>{
  b.closest('.seg').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));
  const koop=b.dataset.kind==='koop';
  const pf=$('#projFields');if(pf)pf.hidden=koop;
  const ml=$('#msgLabel');if(ml)ml.textContent=t(koop?'ct.msg2':'ct.msg1');
}));

/* contact form: client validation, accessible states, JSON POST to /api/contact */
$('#form')&&$('#form').addEventListener('submit',async e=>{
  e.preventDefault();
  const f=e.target,st=$('#status');
  const fields=[['#f-name',v=>!!v.trim(),'ct.errName'],['#f-mail',v=>/^\S+@\S+\.\S+$/.test(v),'ct.errMail'],['#f-msg',v=>!!v.trim(),'ct.errMsg']];
  let ok=true;
  for(const[sel,test,key]of fields){const el=$(sel),err=document.getElementById(el.id+'-err');
    const good=test(el.value);el.setAttribute('aria-invalid',good?'false':'true');
    if(err)err.textContent=good?'':t(key);
    if(!good)ok=false}
  const cons=$('#f-consent'),consErr=$('#f-consent-err');
  if(cons){const good=cons.checked;cons.setAttribute('aria-invalid',good?'false':'true');if(consErr)consErr.textContent=good?'':t('ct.errConsent');if(!good)ok=false}
  st.hidden=false;
  if(!ok){st.textContent=t('ct.bad');return}
  const data=Object.fromEntries(new FormData(f).entries());
  data.type=f.querySelector('.seg button[aria-pressed="true"]')?.dataset.kind||'projekt';
  data.ts=Date.now();
  try{
    await fetch('/api/csrf',{cache:'no-store'}); // double-submit: sets csrf_token cookie
    const tok=(document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)||[])[1]||'';
    const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':tok},body:JSON.stringify(data)});
    if(r.status===403){await fetch('/api/csrf',{cache:'no-store'});} // stale token → refresh for next try
    st.textContent=t(r.ok?'ct.ok':'ct.bad');
    if(r.ok)f.reset();
  }catch(err){st.textContent=t('ct.bad')}
});

/* boot */
(async function boot(){
  bindTracked(document);
  await loadStrings();
  const w=$('#work');
  if(w&&typeof PROJECTS!=='undefined')renderWork(w,PROJECTS);
  if(typeof PROJECTS!=='undefined')await preload();
  if(w&&typeof PROJECTS!=='undefined')renderWork(w,PROJECTS);
  if($('#gal'))initGallery();
})();
/* Owner-supplied values land at deploy time; hide incomplete rows until then. */
document.querySelectorAll('a[href*="__WHATSAPP__"],a[href*="__CONTACT_EMAIL__"]').forEach(a=>a.closest('.way,a')?.classList.add('hidden-til-owner')||a.remove());
