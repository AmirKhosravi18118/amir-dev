/* One-off generator for projekte/<slug>/index.html from js/projects-data.js + shots manifests.
   Run: node site/tools/build-projects.mjs  (idempotent; committed static output) */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = fs.readFileSync(path.join(root, 'js', 'projects-data.js'), 'utf8');
const { PROJECTS, STORY } = vm.runInNewContext(src + ';({ PROJECTS, STORY })', {});

const HEAD = (p, desc) => `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Projekt ${p.name} – Amir Khosravi</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="https://amir-khosravi.de/projekte/${p.slug}/">
<link rel="alternate" hreflang="de" href="https://amir-khosravi.de/projekte/${p.slug}/">
<link rel="alternate" hreflang="en" href="https://amir-khosravi.de/en/projekte/${p.slug}/">
<link rel="alternate" hreflang="x-default" href="https://amir-khosravi.de/projekte/${p.slug}/">
<meta property="og:type" content="article">
<meta property="og:title" content="Projekt ${p.name} – Amir Khosravi">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="https://amir-khosravi.de/projekte/${p.slug}/">
<meta property="og:image" content="https://amir-khosravi.de/${p.fb || 'brand/ak-badge-512.png'}">
<meta property="og:locale" content="de_DE">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/brand/ak-favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/site.css">
<script src="/js/projects-data.js"></script>
<script type="module" src="/js/main.js"></script>
</head>`;

const NAV = `
<a class="skip" href="#main" data-t="skip.to">Zum Inhalt springen</a>

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><symbol id="ak" viewBox="0 0 136 100"><g fill="currentColor"><polygon points="30.5,14 38.5,14 19.5,86 6,86"/><polygon points="38.0,14 41.6,14 66.0,86 62.4,86"/><rect x="0" y="83.4" width="25" height="2.6"/><rect x="70" y="14" width="12" height="72"/><rect x="62" y="14" width="28" height="2.6"/><rect x="58" y="83.4" width="32" height="2.6"/><polygon points="82,53.0 82,49.6 108.6,14 112.4,14"/><rect x="104" y="14" width="16" height="2.6"/><polygon points="83,50 95,50 118,86 104,86"/><rect x="99" y="83.4" width="26" height="2.6"/></g><rect class="ak-bar" x="25" y="60.2" width="33" height="2.8" fill="var(--gold)"/><circle class="ak-dot" cx="131" cy="84.7" r="4.2" fill="var(--gold)"/></symbol></svg>

<header class="nav"><div class="wrap">
  <a class="brand" href="/" aria-label="Amir Khosravi, Start"><svg class="ak" viewBox="0 0 136 100" aria-hidden="true"><use href="#ak"/></svg></a>
  <nav class="nav-links" id="navLinks" aria-label="Hauptnavigation">
    <a href="/#leistungen" data-t="nav.services">Leistungen</a>
    <a href="/projekte/" aria-current="page" data-t="nav.work">Projekte</a>
    <a href="/#ablauf" data-t="nav.process">Ablauf</a>
    <a href="/#ueber" data-t="nav.about">Über mich</a>
    <a href="/#anfrage" data-t="nav.contact">Kontakt</a>
  </nav>
  <div class="nav-right">
    <div class="lang" role="group" aria-label="Sprache"><a href="/en/projekte/SLUG/" data-golang="/en/projekte/SLUG/">EN</a></div>
    <a class="btn small cta-nav" href="/#anfrage" data-track="cta_request_project" data-t="nav.cta">Projekt anfragen</a>
    <button class="menu-btn" id="menuBtn" aria-label="Menü" aria-expanded="false" aria-controls="navLinks"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg></button>
  </div>
</div></header>`;

const FOOT = `
<footer><div class="wrap"><span data-t="ft.copy">© 2026 Amir Khosravi, Wiesbaden</span><span><a href="/impressum.html" data-t="ft.imprint">Impressum</a> · <a href="/datenschutz.html" data-t="ft.privacy">Datenschutz</a></span></div></footer>

<div class="fab">
  <div class="fab-panel" id="fabPanel" hidden>
    <p data-t="fab.h">Wie möchtest du mich erreichen?</p>
    <a href="https://wa.me/__WHATSAPP__?text=Hallo%20Herr%20Khosravi%2C%20ich%20interessiere%20mich%20f%C3%BCr%20ein%20Projekt." target="_blank" rel="noopener" data-track="whatsapp_click"><span class="dot">W</span><span><b data-t="ct.wat">WhatsApp</b><small data-t="fab.wa">Direkt schreiben</small></span></a>
    <button type="button" data-copy="__CONTACT_EMAIL__" data-track="copy_email"><span class="dot">@</span><span><b data-t="ct.em">E-Mail</b><small data-t="fab.mail">Adresse kopieren</small></span></button>
    <a href="/#anfrage" data-track="cta_request_project"><span class="dot">F</span><span><b data-t="fab.form">Anfrageformular</b><small data-t="fab.formsub">Projekt oder Zusammenarbeit</small></span></a>
  </div>
  <button class="fab-btn" id="fabBtn" aria-expanded="false" aria-controls="fabPanel" aria-label="Kontakt" data-t-aria="fab.aria">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.6A8 8 0 1 1 21 12z"/></svg>
  </button>
</div>
</body>
</html>
`;

for (const p of PROJECTS) {
  const story = STORY[p.slug] || {};
  const desc = (p.task.de + ' ' + p.sol.de).replace(/"/g, '&quot;').slice(0, 150);
  const dir = path.join(root, 'projekte', p.slug);
  fs.mkdirSync(dir, { recursive: true });

  const manPath = path.join(root, 'shots', p.slug, 'manifest.json');
  let desktop = p.fb ? '/img/' + p.fb.replace(/^img\//, '') : null;
  let mobile = null, count = 0;
  try {
    const man = JSON.parse(fs.readFileSync(manPath, 'utf8')).filter(x => x.file);
    count = man.length;
    if (!desktop) desktop = man.find(x => x.device === 'desktop');
    mobile = man.find(x => x.device === 'mobile');
    if (typeof desktop === 'object') desktop = '/shots/' + p.slug + '/' + desktop.file;
    if (typeof mobile === 'object') mobile = '/shots/' + p.slug + '/' + mobile.file;
    if (!desktop) desktop = mobile;
  } catch (e) {}
  const device = mobile && (p.phoneFirst || !desktop)
    ? `<div class="phone"><i class="bz"></i><div class="sc"><img src="${mobile}" alt="${p.name}: Screenshot der mobilen Ansicht" loading="lazy"></div><i class="isl"></i></div>`
    : `<div class="laptop flat"><div class="screen"><img src="${desktop}" alt="${p.name}: Screenshot" loading="lazy"></div><div class="lid"></div></div>`;

  const chip = p.badge ? `<span class="badge" data-t="proj.${p.slug}.badge">${p.badge.de}</span>` : p.soon ? `<span class="soon" data-t="proj.${p.slug}.soon">${p.soon.de}</span>` : '';
  const live = p.href ? `<a class="btn" href="${p.href}" target="_blank" rel="noopener" data-t="gal.act_live">Live ansehen</a>` : '';
  const html = `${HEAD(p, desc)}
<body>${NAV.replaceAll('SLUG', p.slug)}
<main id="main">
<article class="wrap">
  <nav class="crumbs" aria-label="Brotkrumen" style="padding-top:clamp(28px,5vw,56px)"><a href="/" data-t="crumb.start">Start</a><span aria-hidden="true">/</span><a href="/projekte/" data-t="crumb.projects">Projekte</a><span aria-hidden="true">/</span><span data-t="proj.${p.slug}.name">${p.name}</span></nav>
  <div class="proj-hero">
    <div class="meta-line">${chip}<span class="label" data-t="proj.${p.slug}.kind">${p.kind.de}</span></div>
    <h1 data-t="proj.${p.slug}.name">${p.name}</h1>
    <p class="lead" data-t="proj.${p.slug}.task">${p.task.de}</p>
    <div class="proj-cta">
      ${live}
      <a class="btn${p.href ? ' ghost' : ''}" href="/projekte/?project=${p.slug}&amp;shot=1" data-t="pd.gallery">Galerie öffnen</a>
      <a class="btn ghost" href="/#anfrage" data-track="cta_request_project" data-t="gal.act_similar">Ähnliches anfragen</a>
    </div>
  </div>
  <div class="proj-stage hovr"><div class="tilt" data-tilt>${device}</div></div>
  <div class="proj-body">
    <div class="article rv">
      <h2 data-t="pd.about">Das Projekt</h2>
      ${story.about ? `<p data-t="proj.${p.slug}.about">${story.about.de}</p>` : ''}
      ${story.does ? `<h2 data-t="gal.doesH">Was es kann</h2><ul>${story.does.de.map((x, i) => `<li data-t="proj.${p.slug}.does.${i}">${x}</li>`).join('')}</ul>` : ''}
      ${story.looks ? `<h2 data-t="gal.looksH">So sieht es aus</h2><p data-t="proj.${p.slug}.looks">${story.looks.de}</p>` : ''}
    </div>
    <dl class="proj-facts rv">
      <div><dt data-t="gal.sol">Lösung</dt><dd data-t="proj.${p.slug}.sol">${p.sol.de}</dd></div>
      <div><dt data-t="pd.tech">Technik</dt><dd><ul class="chips">${p.tech.map(x => `<li>${x}</li>`).join('')}</ul></dd></div>
      ${p.priceLine ? `<div><dt data-t="pd.price">Preis</dt><dd data-t="proj.${p.slug}.priceline">${p.priceLine.de}</dd></div>` : ''}
      <div><dt data-t="pd.gallery">Galerie</dt><dd><a href="/projekte/?project=${p.slug}&amp;shot=1"><span data-t="proj.${p.slug}.name">${p.name}</span> · <span data-t="pd.shots">Galerie ansehen</span></a></dd></div>
    </dl>
  </div>
  <div class="backlinks"><a class="btn ghost small" href="/projekte/" data-t="pd.back">Zur Projektübersicht</a></div>
</article>
</main>${FOOT}`;
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('projekte/' + p.slug + '/index.html');
}
