/* Build-time sitemap generator: site/sitemap.xml with xhtml:link alternates for all
   DE+EN pages, and site/robots.txt. Run: node site/tools/build-sitemap.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const O = 'https://amir-khosravi.de';
const slugs = ['nelurio', 'akstudio', 'monfared', 'saad', 'washhalle', 'raha', 'finello', 'nexdeutsch', 'record'];
const pages = ['/', '/projekte/', ...slugs.map(s => `/projekte/${s}/`), '/impressum.html', '/datenschutz.html', '/qr.html'];
const en = p => p === '/' ? '/en/' : p === '/projekte/' ? '/en/projects/' : p.startsWith('/projekte/') ? '/en' + p : '/en' + p;

const today = new Date().toISOString().slice(0, 10);
const urls = pages.map(p => {
  const de = O + p, enu = O + en(p);
  return `  <url><loc>${de}</loc><lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="de" href="${de}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${enu}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${de}"/>
  </url>
  <url><loc>${enu}</loc><lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="de" href="${de}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${enu}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${de}"/>
  </url>`;
}).join('\n');

fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`);
fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${O}/sitemap.xml\n`);
console.log('ok   sitemap.xml (' + pages.length * 2 + ' urls), robots.txt');
