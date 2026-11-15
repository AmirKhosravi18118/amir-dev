/* One-off build step: inject project texts from js/projects-data.js into the i18n catalogs
   as proj.<slug>.* keys. Run: node site/tools/build-i18n.mjs  (idempotent) */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = fs.readFileSync(path.join(root, 'js', 'projects-data.js'), 'utf8');
const { PROJECTS, STORY } = vm.runInNewContext(src + ';({ PROJECTS, STORY })', {});

for (const lang of ['de', 'en']) {
  const file = path.join(root, 'i18n', lang + '.json');
  const cat = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const p of PROJECTS) {
    const story = STORY[p.slug] || {};
    cat['proj.' + p.slug + '.name'] = p.name;
    cat['proj.' + p.slug + '.kind'] = p.kind[lang];
    cat['proj.' + p.slug + '.task'] = p.task[lang];
    cat['proj.' + p.slug + '.sol'] = p.sol[lang];
    if (story.about) cat['proj.' + p.slug + '.about'] = story.about[lang];
    if (story.looks) cat['proj.' + p.slug + '.looks'] = story.looks[lang];
    (story.does ? story.does[lang] : []).forEach((x, i) => { cat['proj.' + p.slug + '.does.' + i] = x; });
    if (p.priceLine) cat['proj.' + p.slug + '.priceline'] = p.priceLine[lang];
    if (p.badge) cat['proj.' + p.slug + '.badge'] = p.badge[lang];
    if (p.soon) cat['proj.' + p.slug + '.soon'] = p.soon[lang];
  }
  delete cat['__proj__'];
  fs.writeFileSync(file, JSON.stringify(cat, null, 2) + '\n');
  console.log(lang + ': ' + Object.keys(cat).length + ' keys');
}
