/* Build-time generator: patches the DE pages (head meta from catalogs, og:image, aria i18n
   keys, JSON-LD, language-switch links) and generates the EN mirror under /en/ from the
   patched DE sources. Idempotent — safe to re-run. Run: node site/tools/build-en.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const de = JSON.parse(fs.readFileSync(path.join(root, 'i18n/de.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(root, 'i18n/en.json'), 'utf8'));
const { PROJECTS } = new Function(fs.readFileSync(path.join(root, 'js/projects-data.js'), 'utf8') + ';return {PROJECTS};')();
const BY = Object.fromEntries(PROJECTS.map(p => [p.slug, p]));
const ORIGIN = 'https://amir-khosravi.de';
const LI = 'https://www.linkedin.com/in/amir-khosravi18118';
const GH = 'https://github.com/AmirKhosravi18118';
const slugs = PROJECTS.map(p => p.slug);

const PAGES = [
  ['index.html', 'home'],
  ['projekte/index.html', 'projects'],
  ...slugs.map(s => [`projekte/${s}/index.html`, s]),
  ['impressum.html', 'imp'],
  ['datenschutz.html', 'dat'],
  ['404.html', '404'],
  ['qr.html', 'qr'],
];

function urls(rel) {
  const deUrl = rel === 'index.html' ? '/' : '/' + rel.replace(/index\.html$/, '');
  const enRel = rel === 'index.html' ? 'en/' : rel === 'projekte/index.html' ? 'en/projects/index.html' : 'en/' + rel;
  const enUrl = '/' + enRel.replace(/index\.html$/, '');
  return { deUrl, enUrl };
}
const ogName = t => (t === 'home' || t === 'projects' || slugs.includes(t)) ? t : 'legal';
const metaBase = t => (t === 'home' || t === 'projects') ? t : slugs.includes(t) ? 'proj.' + t : t;

/* ---------- JSON-LD ---------- */
function personRef() {
  return { '@type': 'Person', '@id': ORIGIN + '/#person', name: 'Amir Khosravi', jobTitle: 'Digital Developer', url: ORIGIN + '/', address: { '@type': 'PostalAddress', addressLocality: 'Wiesbaden', addressCountry: 'DE' }, sameAs: [LI, GH], knowsLanguage: ['de', 'en', 'fa'] };
}
function breadcrumb(items) {
  return { '@type': 'BreadcrumbList', itemListElement: items.map((n, i) => ({ '@type': 'ListItem', position: i + 1, name: n[0], item: ORIGIN + n[1] })) };
}
function buildLd(type, rel, lang, cat) {
  const self = ORIGIN + (lang === 'de' ? urls(rel).deUrl : urls(rel).enUrl);
  if (type === 'home') {
    return { '@context': 'https://schema.org', '@graph': [
      personRef(),
      { '@type': 'ProfessionalService', '@id': ORIGIN + '/#service', name: 'Amir Khosravi', description: cat['ct.cardsub'], url: ORIGIN + '/', areaServed: lang === 'de' ? 'Rhein-Main-Gebiet' : 'Rhine-Main area', address: { '@type': 'PostalAddress', addressLocality: 'Wiesbaden', addressCountry: 'DE' }, founder: { '@id': ORIGIN + '/#person' }, sameAs: [LI, GH] },
      { '@type': 'WebSite', '@id': ORIGIN + '/#website', url: ORIGIN + '/', name: 'Amir Khosravi', inLanguage: lang, publisher: { '@id': ORIGIN + '/#person' } },
    ] };
  }
  if (type === 'projects') return { '@context': 'https://schema.org', '@graph': [breadcrumb([[cat['crumb.start'], '/'], [cat['crumb.projects'], urls('projekte/index.html')[lang === 'de' ? 'deUrl' : 'enUrl']]])] };
  if (slugs.includes(type)) {
    const p = BY[type];
    const work = { '@type': 'CreativeWork', name: p.name, description: p.task[lang], url: self, image: `${ORIGIN}/og/${type}.png`, creator: { '@id': ORIGIN + '/#person' }, inLanguage: lang };
    const graph = [work];
    if (type === 'nelurio') graph.push({ '@type': 'SoftwareApplication', name: 'Nelurio', applicationCategory: 'EducationalApplication', operatingSystem: 'Web', url: p.href, description: p.story.about[lang], author: { '@id': ORIGIN + '/#person' }, offers: { '@type': 'Offer', price: '8.99', priceCurrency: 'EUR', description: p.priceLine[lang], url: p.href } });
    graph.push(breadcrumb([[cat['crumb.start'], '/'], [cat['crumb.projects'], urls('projekte/index.html')[lang === 'de' ? 'deUrl' : 'enUrl']], [p.name, lang === 'de' ? urls(rel).deUrl : urls(rel).enUrl]]));
    return { '@context': 'https://schema.org', '@graph': graph };
  }
  return null;
}

/* ---------- page patch (applied to DE in place and to the EN copy) ---------- */
function patchPage(src, type, rel, lang, cat) {
  const { deUrl, enUrl } = urls(rel);
  const self = ORIGIN + (lang === 'de' ? deUrl : enUrl);
  const base = metaBase(type);
  const title = cat['meta.' + base + '.title'];
  const desc = cat['meta.' + base + '.desc'];
  const og = `${ORIGIN}/og/${ogName(type)}.png`;

  src = src.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '');
  src = src.replace(/<title>[^<]*<\/title>/, '<title>' + title + '</title>');
  src = src.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + desc + '">');
  src = src.replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + title + '">');
  src = src.replace(/<meta name="twitter:title" content="[^"]*">/, '<meta name="twitter:title" content="' + title + '">');
  src = src.replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + desc + '">');
  src = src.replace(/<meta name="twitter:description" content="[^"]*">/, '<meta name="twitter:description" content="' + desc + '">');
  src = src.replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="' + self + '">');
  src = src.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + self + '">');
  const trio = `<link rel="alternate" hreflang="de" href="${ORIGIN}${deUrl}">\n<link rel="alternate" hreflang="en" href="${ORIGIN}${enUrl}">\n<link rel="alternate" hreflang="x-default" href="${ORIGIN}${deUrl}">`;
  src = src.replace(/<link rel="alternate" hreflang="de" href="[^"]*">\s*<link rel="alternate" hreflang="en" href="[^"]*">\s*<link rel="alternate" hreflang="x-default" href="[^"]*">/, trio);

  const ins = [];
  if (!/<meta property="og:url"/.test(src)) ins.push(`<meta property="og:url" content="${self}">`);
  if (/<meta property="og:image"/.test(src)) src = src.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${og}">`);
  else ins.push(`<meta property="og:image" content="${og}">`);
  if (!/<meta property="og:description"/.test(src)) ins.push(`<meta property="og:description" content="${desc}">`);
  src = src.replace(/\s*<meta property="og:locale(?::alternate)?" content="[^"]*">/g, '');
  ins.push(`<meta property="og:locale" content="${lang === 'de' ? 'de_DE' : 'en_GB'}">`, `<meta property="og:locale:alternate" content="${lang === 'de' ? 'en_GB' : 'de_DE'}">`);
  src = src.replace(/(<meta property="og:type" content="[^"]*">)/, '$1\n' + ins.join('\n'));
  if (/<meta name="twitter:image"/.test(src)) src = src.replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${og}">`);

  /* aria-labels get i18n keys (both languages) */
  const ARIA = [['aria-label="Hauptnavigation"', 'aria.nav'], ['aria-label="Menü"', 'aria.menu'], ['aria-label="Sprache"', 'aria.lang'], ['aria-label="Brotkrumen"', 'aria.crumbs'], ['aria-label="Amir Khosravi, Start"', 'aria.start'], ['aria-label="Art der Anfrage"', 'aria.request'], ['aria-label="Visitenkarte mit QR-Code"', 'aria.card']];
  for (const [a, k] of ARIA) if (src.includes(a) && !src.includes(a + ' data-t-aria')) src = src.split(a).join(a + ' data-t-aria="' + k + '"');

  /* home: i18n key for the projects link note */
  src = src.replace('<a href="/projekte/">Alle Projekte im Überblick →</a>', '<a href="/projekte/" data-t="pd.all">Alle Projekte im Überblick →</a>');
  /* projects listing: crumbs get i18n keys */
  src = src.replace('<a href="/">Start</a><span aria-hidden="true">/</span><span>Projekte</span>', '<a href="/" data-t="crumb.start">Start</a><span aria-hidden="true">/</span><span data-t="crumb.projects">Projekte</span>');
  /* DE pages: the EN counterpart of the projects listing lives at /en/projects/ */
  if (lang === 'de') src = src.split('href="/en/projekte/" data-golang="/en/projekte/"').join('href="/en/projects/" data-golang="/en/projects/"');

  const ld = buildLd(type, rel, lang, cat);
  if (ld) src = src.replace('</head>', '<script type="application/ld+json">\n' + JSON.stringify(ld) + '\n</script>\n</head>');
  return src;
}

/* ---------- EN transforms ---------- */
function replaceT(src, cat) {
  const re = /<([a-zA-Z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*?\bdata-t="([^"]+)"(?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  const jobs = [];
  let m;
  while ((m = re.exec(src))) {
    if (!(m[3] in cat)) throw new Error('missing EN key: ' + m[3]);
    const i = src.indexOf('</' + m[1] + '>', re.lastIndex);
    if (i < 0) throw new Error('no closing tag for key ' + m[3]);
    jobs.push([re.lastIndex, i, cat[m[3]]]);
  }
  for (let j = jobs.length - 1; j >= 0; j--) { const [s, e, v] = jobs[j]; src = src.slice(0, s) + v + src.slice(e); }
  return src;
}
function enLink(u) {
  if (/^\/(?:img|css|js|shots|brand|og|i18n)\//.test(u) || u === '/qr.svg') return u;
  if (u === '/' || u.startsWith('/?') || u.startsWith('/#')) return '/en/' + u.slice(1);
  let m = u.match(/^\/projekte\/([a-z]+)\/(\?.*)?$/);
  if (m) return '/en/projekte/' + m[1] + '/' + (m[2] || '');
  if (u === '/projekte/' || u.startsWith('/projekte/?')) return '/en/projects/' + u.slice('/projekte/'.length);
  for (const f of ['impressum.html', 'datenschutz.html', '404.html', 'qr.html'])
    if (u === '/' + f || u.startsWith('/' + f + '?') || u.startsWith('/' + f + '#')) return '/en/' + u.slice(1);
  return u;
}
function enPage(src, rel) {
  const { deUrl } = urls(rel);
  src = src.replace('<html lang="de">', '<html lang="en">');
  src = src.replace(/aria-label="[^"]*" data-t-aria="([^"]+)"/g, (m, k) => 'aria-label="' + en[k] + '" data-t-aria="' + k + '"');
  src = src.replace(/alt="[^"]*" data-t-alt="([^"]+)"/g, (m, k) => 'alt="' + en[k] + '" data-t-alt="' + k + '"');
  src = replaceT(src, en);
  src = src.replace(/<a href="\/en[^"]*" data-golang="\/en[^"]*">EN<\/a>/, `<a href="${deUrl}" data-golang="${deUrl}">DE</a>`);
  src = src.replace(/href="(\/[^"]*)"/g, (m, u) => 'href="' + enLink(u) + '"');
  return src;
}

/* ---------- run ---------- */
for (const [rel, type] of PAGES) {
  const p = path.join(root, rel);
  let src = fs.readFileSync(p, 'utf8');
  src = patchPage(src, type, rel, 'de', de);
  fs.writeFileSync(p, src);
  const enSrc = enPage(patchPage(src, type, rel, 'en', en), rel);
  const enRel = rel === 'index.html' ? 'en/index.html' : rel === 'projekte/index.html' ? 'en/projects/index.html' : rel.startsWith('projekte/') ? 'en/' + rel : 'en/' + rel;
  const out = path.join(root, enRel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, enSrc);
  console.log('ok   ' + rel + '  →  ' + enRel);
}
console.log('EN mirror written.');
