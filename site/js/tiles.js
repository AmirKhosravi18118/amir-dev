/* Device mockup helpers and work-tile rendering. */
import { t } from './i18n.js';

export const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

export const laptop=(src,alt,flat)=>`<div class="laptop${flat?' flat':''}"><div class="screen"><img src="${src}" alt="${esc(alt||'')}" loading="lazy"></div><div class="lid"></div></div>`;
export const phone=(src,alt,cls)=>`<div class="phone ${cls||''}"><i class="bz"></i><div class="sc"><img src="${src}" alt="${esc(alt||'')}" loading="lazy"></div><i class="isl"></i></div>`;

export function bindTilt(root){
  if(root.dataset.tiltBound)return;root.dataset.tiltBound=1;
  root.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch')return;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const r=root.getBoundingClientRect();
    root.querySelectorAll('[data-tilt]').forEach(el=>{
      el.style.setProperty('--ry',(((e.clientX-r.left)/r.width-.5)*12).toFixed(2)+'deg');
      el.style.setProperty('--rx',(-((e.clientY-r.top)/r.height-.5)*10).toFixed(2)+'deg')});
  });
  root.addEventListener('pointerleave',()=>root.querySelectorAll('[data-tilt]').forEach(el=>{el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg')}));
}

export const firstOf=(p,dev)=>p.slides.find(s=>s.device===dev);

export function tileHTML(p,wide){
  const d=firstOf(p,'desktop'),m=firstOf(p,'mobile');let dev='';
  if(d&&!(p.phoneFirst&&m))dev=`<div class="tilt" data-tilt>${laptop(d.src,p.name)}</div>`+(m?`<div class="tilt over" data-tilt>${phone(m.src,'')}</div>`:'');
  else if(m)dev=`<div class="tilt" data-tilt>${phone(m.src,p.name,'only')}</div>`;
  const chip=p.soon||p.badge;
  return `<button class="tile rv in${wide?' wide':''}" data-open="${p.slug}" aria-label="${esc(p.name)}: ${esc(t('gal.open'))}">
    <div class="glow"></div><div class="texture"></div>${chip?`<span class="${p.soon?'soon':'badge'}">${esc(t('proj.'+p.slug+'.'+(p.soon?'soon':'badge')))}</span>`:''}
    <div class="dev">${dev}</div>
    <div class="meta"><div><b>${esc(p.name)}</b><span class="k">${esc(t('proj.'+p.slug+'.kind'))}</span></div><span class="open">${esc(t('gal.open'))}</span></div></button>`;
}

const liveObs=new IntersectionObserver(es=>es.forEach(x=>x.target.classList.toggle('is-live',x.isIntersecting)),{rootMargin:'-33% 0px -33% 0px'});
export function bindTile(el){
  bindTilt(el);
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--gx',(e.clientX-r.left-r.width/2)*.4+'px');el.style.setProperty('--gy',(e.clientY-r.top-r.height/2)*.4+'px')});
  if(matchMedia('(hover:none)').matches)liveObs.observe(el);
}
export function renderWork(container,projects){
  container.innerHTML=projects.filter(p=>p.slides.length).map(p=>tileHTML(p,p.wide)).join('');
  container.querySelectorAll('.tile').forEach(bindTile);
}
