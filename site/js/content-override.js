/* AK Studio publish pipeline consumer: overrides baked copy with the
   published site-content.json (Studio → webroot). Static-first: if the file
   is missing, the baked i18n copy stays — the fetch failure is silent and
   never blocks rendering. */
let applied = false;
async function applySiteContent() {
  if (applied) return;
  try {
    const r = await fetch('/content/site-content.json', { cache: 'no-store' });
    if (!r.ok) return;
    const j = await r.json();
    // published shape: {hero:{title,lead}, promise, services:[{title,desc}], about:{title,body}}
    const map = {
      heroTitle: '[data-t="hero.h1"]',
      heroLead: '[data-t="hero.lead"]',
      promise: '[data-t="pr.p"]',
      aboutBody: '[data-t="ab.p"]',
      aboutTitle: '[data-t="ab.h2"]'
    };
    const vals = {
      heroTitle: j.hero && j.hero.title,
      heroLead: j.hero && j.hero.lead,
      promise: j.promise,
      aboutBody: j.about && j.about.body,
      aboutTitle: j.about && j.about.title
    };
    for (const [key, sel] of Object.entries(map)) {
      const v = vals[key];
      if (!v) continue;
      document.querySelectorAll(sel).forEach((el) => { el.textContent = v; });
    }
    if (Array.isArray(j.services)) {
      const cards = document.querySelectorAll('#leistungen .svc');
      j.services.forEach((svc, i) => {
        const card = cards[i];
        if (!card || !svc || !svc.title) return;
        const h = card.querySelector('h3');
        if (h) h.textContent = svc.title;
        const p = card.querySelector('p');
        if (p && svc.desc) p.textContent = svc.desc;
      });
    }
    applied = true;
    document.documentElement.dataset.contentOverride = 'applied';
  } catch { /* static-first: baked copy stands */ }
}
/* Run early, then again after full load — the i18n/JS shell paints baked text
   asynchronously, so one early pass can be overwritten. */
applySiteContent();
window.addEventListener('load', () => setTimeout(applySiteContent, 300));
