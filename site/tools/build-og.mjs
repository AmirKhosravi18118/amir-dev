/* Build-time OG image generator: renders site/og/*.png (1200x630) via @resvg/resvg-js,
   installed throwaway in a temp dir (nothing from there is committed).
   Run: node site/tools/build-og.mjs */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tmp = path.join(os.tmpdir(), 'ak-og-build');
fs.mkdirSync(tmp, { recursive: true });
if (!fs.existsSync(path.join(tmp, 'node_modules', '@resvg', 'resvg-js'))) {
  fs.writeFileSync(path.join(tmp, 'package.json'), '{"private":true}');
  execSync('npm install @resvg/resvg-js --no-audit --no-fund', { cwd: tmp, stdio: 'inherit' });
}
const { Resvg } = createRequire(path.join(tmp, 'package.json'))('@resvg/resvg-js');

const BG = '#0B0B0C', CREAM = '#EDE6D8', MUTE = '#9B958A', GOLD = '#C9A96E', HAIR = '#17171A';
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function svg(lines) {
  let y = 320;
  const body = lines.map(l => {
    const el = `<text x="72" y="${y}" font-family="Arial, sans-serif" font-size="${l.fs}" font-weight="${l.fw || 600}" fill="${l.fill || CREAM}">${esc(l.t)}</text>`;
    y += l.fs + 42;
    return el;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${BG}"/><rect x="72" y="96" width="88" height="6" fill="${GOLD}"/><text x="72" y="182" font-family="Arial, sans-serif" font-size="28" letter-spacing="10" fill="${MUTE}">AMIR KHOSRAVI</text>${body}<text x="72" y="560" font-family="Arial, sans-serif" font-size="26" fill="${MUTE}">amir-khosravi.de</text><rect x="72" y="594" width="1056" height="2" fill="${HAIR}"/></svg>`;
}

const EN = { home: ['Websites & apps', 'built for your business'], projects: ['Selected', 'work'] };
const { PROJECTS } = new Function(fs.readFileSync(path.join(root, 'js/projects-data.js'), 'utf8') + ';return {PROJECTS};')();

const pages = [
  ['home', [{ t: EN.home[0], fs: 84 }, { t: EN.home[1], fs: 84, fill: GOLD }]],
  ['projects', [{ t: EN.projects[0], fs: 84 }, { t: EN.projects[1], fs: 84, fill: GOLD }]],
  ...PROJECTS.map(p => [p.slug, [{ t: p.name, fs: 88 }, { t: p.kind.en, fs: 40, fill: GOLD, fw: 400 }]]),
  ['legal', [{ t: 'Legal notice', fs: 84 }, { t: '& privacy policy', fs: 84, fill: GOLD }]],
];

fs.mkdirSync(path.join(root, 'og'), { recursive: true });
for (const [name, lines] of pages) {
  const png = new Resvg(svg(lines), { fitTo: { mode: 'width', value: 1200 }, font: { loadSystemFonts: true, defaultFontFamily: 'Arial' } }).render().asPng();
  const out = path.join(root, 'og', name + '.png');
  fs.writeFileSync(out, png);
  const kb = (fs.statSync(out).size / 1024).toFixed(1);
  if (fs.statSync(out).size > 300 * 1024) throw new Error('og/' + name + '.png over 300 KB');
  console.log('ok   og/' + name + '.png  ' + kb + ' KB');
}
console.log('OG images written.');
