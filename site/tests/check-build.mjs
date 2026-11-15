/* Build checks: i18n completeness, token-only colours, SEO head tags, one H1, internal links,
   hreflang pairs (both ways), JSON-LD validity. Covers DE pages and the EN mirror.
   Run: node site/tests/check-build.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let fail = 0;
const err = m => { console.error('FAIL ' + m); fail++; };
const ok = m => console.log('ok   ' + m);

const de = JSON.parse(fs.readFileSync(path.join(root, 'i18n/de.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(root, 'i18n/en.json'), 'utf8'));

/* 1. catalogs have identical key sets */
const dk = Object.keys(de).sort(), ek = Object.keys(en).sort();
if (JSON.stringify(dk) === JSON.stringify(ek)) ok(`catalogs: ${dk.length} keys, de/en identical`);
else {
  err('catalog key mismatch: ' + dk.filter(k => !(k in en)).concat(ek.filter(k => !(k in de))).join(', '));
}

/* gather pages (DE root + EN mirror) */
const pages = [];
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    if (f.name === 'tools' || f.name.startsWith('node_modules')) continue;
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.html')) pages.push(p);
  }
})(root);
ok(`pages found: ${pages.length}`);

/* 2. every data-t / data-t-aria key exists in both catalogs; every t('key') in js too */
let keys = 0;
for (const p of pages) {
  const src = fs.readFileSync(p, 'utf8');
  for (const m of src.matchAll(/data-t(?:-aria|-alt)?="([^"]+)"/g)) {
    keys++;
    const k = m[1];
    if (!(k in de)) err(`${path.relative(root, p)}: data-t key missing in de.json: ${k}`);
    if (!(k in en)) err(`${path.relative(root, p)}: data-t key missing in en.json: ${k}`);
  }
}
for (const f of fs.readdirSync(path.join(root, 'js'))) {
  const src = fs.readFileSync(path.join(root, 'js', f), 'utf8');
  for (const m of src.matchAll(/\bt\('([^']+)'\)/g)) {
    keys++;
    if (!(m[1] in de)) err(`js/${f}: t() key missing in de.json: ${m[1]}`);
    if (!(m[1] in en)) err(`js/${f}: t() key missing in en.json: ${m[1]}`);
  }
}
for (const p of PROJECT_KEYS()) {
  keys++;
  if (!(p in de)) err(`missing project key in de.json: ${p}`);
  if (!(p in en)) err(`missing project key in en.json: ${p}`);
}
function PROJECT_KEYS() {
  const src = fs.readFileSync(path.join(root, 'js/projects-data.js'), 'utf8');
  const { PROJECTS, STORY } = require2vm(src);
  const out = [];
  for (const pr of PROJECTS) {
    for (const k of ['name', 'kind', 'task', 'sol', 'about', 'looks', 'priceline', 'badge', 'soon'])
      if ((pr[k] || (STORY[pr.slug] || {})[k]) || ['name', 'kind', 'task', 'sol'].includes(k)) out.push(`proj.${pr.slug}.${k}`);
    const st = STORY[pr.slug] || {};
    (st.does ? st.does.de : []).forEach((x, i) => out.push(`proj.${pr.slug}.does.${i}`));
  }
  return out;
}
function require2vm(src) { return new Function(src + ';return {PROJECTS, STORY};')(); }
ok(`i18n keys checked: ${keys}`);

/* 3. no #hex colours outside tokens.css */
const cssFiles = fs.readdirSync(path.join(root, 'css')).filter(f => f.endsWith('.css'));
for (const f of cssFiles) {
  const src = fs.readFileSync(path.join(root, 'css', f), 'utf8');
  if (f === 'tokens.css') continue;
  const hits = src.match(/#[0-9a-fA-F]{3,8}\b/g);
  if (hits) err(`css/${f}: hardcoded colours ${hits.join(' ')}`);
}
for (const p of pages) {
  const src = fs.readFileSync(p, 'utf8');
  const hits = src.match(/#[0-9a-fA-F]{3,8}\b/g);
  if (hits) err(`${path.relative(root, p)}: hardcoded colours ${hits.join(' ')}`);
}
ok('colour tokens: no #hex outside tokens.css');

/* 4. per-page: lang, canonical == own URL, hreflang trio, one H1, title, description */
const ORIGIN = 'https://amir-khosravi.de';
const byRel = {};
for (const p of pages) byRel[path.relative(root, p).replace(/\\/g, '/')] = p;
function urlToRel(u) {
  if (typeof u !== 'string' || !u.startsWith(ORIGIN)) return null;
  let p = u.slice(ORIGIN.length).split('?')[0];
  if (p === '' || p === '/') p = '/index.html';
  if (p.endsWith('/')) p += 'index.html';
  return p.replace(/^\//, '');
}
for (const p of pages) {
  const rel = path.relative(root, p).replace(/\\/g, '/');
  const src = fs.readFileSync(p, 'utf8');
  const selfUrl = ORIGIN + '/' + rel.replace(/(^|\/)index\.html$/, '$1').replace(/\/index\.html$/, '/').replace(/^\/index\.html$/, '/');
  const isEn = rel.startsWith('en/');
  const lang = (src.match(/<html lang="([^"]+)"/) || [])[1];
  if (lang !== (isEn ? 'en' : 'de')) err(`${rel}: html lang="${lang}" (expected ${isEn ? 'en' : 'de'})`);
  const canon = (src.match(/rel="canonical" href="([^"]+)"/) || [])[1];
  if (!canon) err(`${rel}: missing canonical`);
  else if (canon !== selfUrl) err(`${rel}: canonical ${canon} != own URL ${selfUrl}`);
  const hl = {};
  for (const m of src.matchAll(/rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)) hl[m[1]] = m[2];
  for (const l of ['de', 'en', 'x-default']) if (!hl[l]) err(`${rel}: missing hreflang ${l}`);
  if (hl['x-default'] && hl['x-default'] !== hl['de']) err(`${rel}: x-default (${hl['x-default']}) != de (${hl['de']})`);
  /* both ways: targets exist and link back */
  for (const l of ['de', 'en']) {
    if (!hl[l]) continue;
    const target = byRel[urlToRel(hl[l])];
    if (!target) { err(`${rel}: hreflang ${l} target missing: ${hl[l]}`); continue; }
    const tsrc = fs.readFileSync(target, 'utf8');
    const back = (tsrc.match(new RegExp(`rel="alternate" hreflang="${isEn ? 'de' : 'en'}" href="([^"]+)"`)) || [])[1];
    if (back !== hl[isEn ? 'de' : 'en']) err(`${rel}: hreflang pair not reciprocal (${hl[isEn ? 'de' : 'en']} not linked back from ${hl[l]})`);
  }
  const h1 = (src.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(`${rel}: ${h1} H1 elements (need exactly 1)`);
  if (!/<title>[^<]{5,60}<\/title>/.test(src)) err(`${rel}: title missing or >= 60 chars`);
  if (!/<meta name="description" content="[^"]{10,155}"/.test(src)) err(`${rel}: meta description missing or wrong length`);
}
ok('head tags + reciprocal hreflang pairs checked on all pages');

/* 4b. JSON-LD parses on every page */
let ld = 0;
for (const p of pages) {
  const rel = path.relative(root, p);
  const src = fs.readFileSync(p, 'utf8');
  for (const m of src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    ld++;
    try { JSON.parse(m[1]); } catch (e) { err(`${rel}: invalid JSON-LD: ${e.message}`); }
  }
}
ok(`JSON-LD blocks parsed: ${ld}`);

/* 5. internal hrefs resolve to existing files */
let links = 0;
for (const p of pages) {
  const src = fs.readFileSync(p, 'utf8');
  for (const m of src.matchAll(/(?:href|src)="(\/[^"#?]*)[\?#]?"/g)) {
    links++;
    const url = decodeURIComponent(m[1]);
    const target = path.join(root, url);
    if (!fs.existsSync(target)) err(`${path.relative(root, p)}: broken internal link ${m[1]}`);
  }
}
ok(`internal links checked: ${links}`);

if (fail) { console.error(`\n${fail} check(s) failed`); process.exit(1); }
console.log('\nAll checks green.');
