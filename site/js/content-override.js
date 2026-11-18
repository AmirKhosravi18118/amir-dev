/* AK Studio publish pipeline consumer: overrides baked copy with the
   published site-content.json (Studio → webroot). Static-first: if the file
   is missing, the baked i18n copy stays — the fetch failure is silent and
   never blocks rendering. */
(async function applySiteContent() {
  try {
    const r = await fetch('/content/site-content.json', { cache: 'no-store' });
    if (!r.ok) return;
    const j = await r.json();
    const map = {
      hero_title: '[data-t="hero.h1"]',
      hero_lead: '[data-t="hero.lead"]',
      promise: '[data-t="pr.p"]',
      about_body: '[data-t="ab.p"]',
      about_title: '[data-t="ab.h2"]'
    };
    for (const [key, sel] of Object.entries(map)) {
      if (!j[key]) continue;
      document.querySelectorAll(sel).forEach((el) => { el.textContent = j[key]; });
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
    document.documentElement.dataset.contentOverride = 'applied';
  } catch { /* static-first: baked copy stands */ }
})();
