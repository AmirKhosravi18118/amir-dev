// Syntax-checks every inline <script> block in the given HTML files.
// The site's JS lives inline (ADR-001); this is the gate that keeps it honest.
import { readFileSync } from "node:fs";
import { Script } from "node:vm";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: node tools/check-inline-js.mjs <file.html> [...]");
  process.exit(2);
}

let blocks = 0;
let failed = false;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  // skip external scripts (src=) and non-JS script types (JSON-LD, importmap…)
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    if (/\bsrc=/.test(attrs)) continue;
    if (/\btype\s*=\s*["'](?!text\/javascript["']|module["'])/i.test(attrs)) continue;
    blocks++;
    try {
      new Script(m[2], { filename: `${file}#block${blocks}` });
      console.log(`ok  ${file} block ${blocks} (${m[2].length} bytes)`);
    } catch (err) {
      failed = true;
      console.error(`ERR ${file} block ${blocks}: ${err.message}`);
    }
  }
}

console.log(`checked ${blocks} inline script block(s)`);
process.exit(failed ? 1 : 0);
