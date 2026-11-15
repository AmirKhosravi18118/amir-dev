/* Build-time QR generation: writes site/qr.svg (committed).
   Points to https://amir-khosravi.de/?utm_source=qr&utm_medium=card
   Requires the `qrcode` package at BUILD TIME ONLY (never shipped, never a runtime dep):
     npm i -D qrcode      (anywhere reachable, then: NODE_PATH=<that>/node_modules node site/tools/build-qr.mjs)
   Run: NODE_PATH=./node_modules node site/tools/build-qr.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const URL_TARGET = 'https://amir-khosravi.de/?utm_source=qr&utm_medium=card';
const require2 = createRequire(import.meta.url);
let QR;
const candidates = [process.env.NODE_PATH, path.join(root, 'node_modules'), '/tmp/qrb/node_modules'].filter(Boolean);
for (const c of candidates) {
  try { QR = require2(path.join(c, 'qrcode')); break; } catch (e) {}
}
if (!QR) {
  console.error('qrcode package not found. Run: npm i -D qrcode (build-time only), then set NODE_PATH.');
  process.exit(1);
}
const svg = await QR.toString(URL_TARGET, { type: 'svg', errorCorrectionLevel: 'M', margin: 1, width: 512, color: { dark: '#0B0B0C', light: '#EDE6D8' } });
fs.writeFileSync(path.join(root, 'qr.svg'), svg.replace('<svg', '<svg role="img" aria-label="QR-Code zu amir-khosravi.de"'));
console.log('qr.svg written (' + URL_TARGET + ')');
