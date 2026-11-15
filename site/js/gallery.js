/* Gallery overlay: story-style slides, auto-advance, keyboard, area filter, deep links ?project=&shot= */
import { t } from './i18n.js';
import { esc, laptop, phone, bindTilt } from './tiles.js';

const DUR=5000;
const G={p:null,all:[],list:[],i:0,user:false,el:0,last:0,raf:0,filter:'all',tab:'story',opener:null};
const AREA_KEY={website:'gal.area_website',panel:'gal.area_panel',app:'gal.area_app',storefront:'gal.area_storefront',admin:'gal.area_admin',site:'gal.area_site'};
const $=s=>document.querySelector(s);
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

async function manifest(slug){
  const LK=document.documentElement.lang==='en'?'label_en':'label_de';
  try{const r=await fetch('/shots/'+slug+'/manifest.json');if(r.ok){const m=await r.json();
    return m.filter(x=>x.file).map(x=>({src:'/shots/'+slug+'/'+x.file,device:x.device||'desktop',area:x.area||'site',label:x[LK]||x.label_de||x.label_en||'',demo:x.demo_data,draft:x.source==='design-prototype'}));} }catch(e){}
  return [];
}

export async function preload(){
  const list=typeof PROJECTS!=='undefined'?PROJECTS:[];
  await Promise.all(list.map(async p=>{const s=await manifest(p.slug);if(s.length)p.slides=s;}));
}
export async function openGallery(slug,shot){
  const p=(typeof PROJECTS!=='undefined'?PROJECTS:[]).find(x=>x.slug===slug);if(!p)return;
  let slides=await manifest(slug);
  if(!slides.length&&p.fb)slides=[{src:'/'+p.fb,device:'desktop',area:'site',label:t('gal.overview')}];
  if(!slides.length)return;
  Object.assign(G,{p,all:slides,filter:'all',tab:'story',user:reduced(),opener:document.activeElement});
  $('#gal').hidden=false;document.body.classList.add('lock');
  renderInfo();buildSlides();
  const idx=Math.max(0,Math.min((parseInt(shot,10)||1)-1,slides.length-1));
  goTo(idx);$('#galPlay').focus();
  syncUrl();
}
export function closeGallery(){
  cancelAnimationFrame(G.raf);$('#gal').hidden=true;document.body.classList.remove('lock');$('#galView').innerHTML='';
  history.replaceState(null,'',location.pathname);
  if(G.opener&&G.opener.focus)G.opener.focus();
}
function syncUrl(){
  const q=new URLSearchParams({project:G.p.slug,shot:String(G.i+1)});
  history.replaceState(null,'','?'+q.toString());
}
function buildSlides(){
  G.list=G.filter==='all'?G.all:G.all.filter(s=>(s.area||'site')===G.filter);
  $('#galView').innerHTML=G.list.map((s,i)=>`<div class="slide" data-i="${i}"><div class="tilt" data-tilt>${s.device==='mobile'?phone(s.src,s.label):laptop(s.src,s.label,true)}</div></div>`).join('');
  $('#galBar').innerHTML=G.list.map((s,i)=>`<button data-go="${i}" aria-label="${i+1}"><i></i></button>`).join('');
  bindTilt($('#galView'));
}
function goTo(i){
  const n=G.list.length;if(!n)return;G.i=(i+n)%n;G.el=0;G.last=performance.now();
  document.querySelectorAll('#galView .slide').forEach((s,k)=>s.classList.toggle('on',k===G.i));
  document.querySelectorAll('#galBar button').forEach((b,k)=>{b.firstElementChild.style.width=k<G.i?'100%':'0'});
  const s=G.list[G.i];
  $('#galCap').textContent=s.label;$('#galArea').textContent=t(AREA_KEY[s.area||'site']||AREA_KEY.site)+(s.draft?' · '+t('gal.draftTag'):'');
  $('#galCount').textContent=`${G.i+1} / ${n}`;
  cancelAnimationFrame(G.raf);G.raf=requestAnimationFrame(tick);
  syncUrl();
}
function tick(now){
  if(!G.user){G.el+=now-G.last;const f=Math.min(G.el/DUR,1),b=document.querySelectorAll('#galBar button')[G.i];
    if(b)b.firstElementChild.style.width=(f*100)+'%';if(f>=1){goTo(G.i+1);return}}
  G.last=now;G.raf=requestAnimationFrame(tick);
}
function setUserPause(v){G.user=v;$('#galPlayI').innerHTML=v?'<path d="M8 5l11 7-11 7z"/>':'<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>';$('#galPlay').setAttribute('aria-label',t(v?'gal.play':'gal.pause'))}
function actionsHTML(p){
  const acts=window.galleryActions(p);
  const icon='<svg class="ai" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  return acts.map(a=>{
    const label=esc(t('gal.act_'+a.id)),cls='btn'+(a.primary?'':' ghost')+' act'+(a.primary?' act-main':'');
    if(a.kind==='link')return `<a class="${cls}" href="${esc(a.href)}" target="_blank" rel="noopener"><span>${label}</span><svg class="ai" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></a>`;
    if(a.kind==='view')return `<a class="${cls}" href="https://nelurio.com" target="_blank" rel="noopener"><span>${label}</span>${icon}</a>`;
    return `<button class="${cls}" data-closegal data-similar><span>${label}</span>${icon}</button>`;
  }).join('');
}
function renderInfo(){
  const p=G.p;if(!p)return;
  const ar=[...new Set(G.all.map(s=>s.area||'site'))];
  const hasDemo=G.all.some(s=>s.demo&&!s.draft),hasDraft=G.all.some(s=>s.draft);
  const story=p.story;
  $('#galInfo').innerHTML=`<div class="top"><span class="label">${esc(t('proj.'+p.slug+'.kind'))}</span><button class="ic" data-closegal aria-label="${esc(t('gal.close'))}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>
   <h2 id="galTitle">${esc(p.name)}</h2>
   ${ar.length>1?`<div class="chips" role="group">${['all',...ar].map(a=>`<button data-filter="${a}" aria-pressed="${G.filter===a}">${esc(a==='all'?t('gal.all'):t(AREA_KEY[a]||AREA_KEY.site))}</button>`).join('')}</div>`:''}
   ${story?`<div class="seg gtabs" role="tablist"><button role="tab" data-gt="story" aria-selected="${G.tab==='story'}">${esc(t('gal.story'))}</button><button role="tab" data-gt="brief" aria-selected="${G.tab==='brief'}">${esc(t('gal.brief'))}</button></div>`:''}
   ${story&&G.tab==='story'?`<p class="story-lead">${esc(t('proj.'+p.slug+'.about'))}</p><div><h4 class="sh">${esc(t('gal.doesH'))}</h4><ul class="feat">${(story.does.de||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><h4 class="sh">${esc(t('gal.looksH'))}</h4><p class="look">${esc(t('proj.'+p.slug+'.looks'))}</p></div><ul class="chips">${p.tech.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`
   :`<dl><div><dt>${esc(t('gal.task'))}</dt><dd>${esc(t('proj.'+p.slug+'.task'))}</dd></div><div><dt>${esc(t('gal.sol'))}</dt><dd>${esc(t('proj.'+p.slug+'.sol'))}</dd></div></dl><ul class="chips">${p.tech.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`}
   ${p.priceLine?`<p class="note" style="color:var(--gold2)">${esc(t('proj.'+p.slug+'.priceline'))}</p>`:''}
   ${hasDemo?`<p class="note">${esc(t('gal.demo'))}</p>`:''}${hasDraft?`<p class="note">${esc(t('gal.draft'))}</p>`:''}
   <div class="acts" data-n="${window.galleryActions(p).length}">${actionsHTML(p)}</div>`;
}
export function initGallery(){
  $('#galPrev').addEventListener('click',()=>goTo(G.i-1));
  $('#galNext').addEventListener('click',()=>goTo(G.i+1));
  $('#galPlay').addEventListener('click',()=>setUserPause(!G.user));
  $('#galBar').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)goTo(+b.dataset.go)});
  $('#gal').addEventListener('click',e=>{
    if(e.target===$('#gal')||e.target.closest('[data-closegal]')){closeGallery();return}
    const sim=e.target.closest('[data-similar]');if(sim){const el=document.getElementById('anfrage');if(el){closeGallery();el.scrollIntoView({behavior:'smooth'})}else{location.href='/#anfrage'}return}
    const f=e.target.closest('[data-filter]');if(f){G.filter=f.dataset.filter;renderInfo();buildSlides();goTo(0);return}
    const gt=e.target.closest('[data-gt]');if(gt){G.tab=gt.dataset.gt;renderInfo()}
  });
  document.addEventListener('visibilitychange',()=>{G.last=performance.now()});
  document.addEventListener('keydown',e=>{
    if($('#gal').hidden)return;
    if(e.key==='Escape')closeGallery();
    if(e.key==='ArrowRight')goTo(G.i+1);
    if(e.key==='ArrowLeft')goTo(G.i-1);
    if(e.key==='Tab'){const f=[...$('#gal').querySelectorAll('button,a')].filter(x=>!x.disabled&&x.offsetParent);
      const a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
  });
  const q=new URLSearchParams(location.search);
  if(q.get('project'))openGallery(q.get('project'),q.get('shot'));
}
