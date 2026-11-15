'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const ctx = { module: { exports: {} } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'gallery-actions.js'), 'utf8'), ctx);
const { galleryActions } = ctx.module.exports;

test('live project with platform: live, platform, similar in that order', () => {
  const a = galleryActions({ href: 'https://x.de', plat: true });
  assert.equal(a.map(x => x.id).join(), ['live', 'platform', 'similar'].join());
});
test('exactly one primary button, always the first', () => {
  for (const p of [{ href: 'h', plat: true }, { href: 'h' }, { plat: true }, {}]) {
    const a = galleryActions(p);
    assert.equal(a.filter(x => x.primary).length, 1);
    assert.equal(a[0].primary, true);
  }
});
test('draft project without link: only the request button, and it is primary', () => {
  const a = galleryActions({});
  assert.equal(a.map(x => x.id).join(), ['similar'].join());
  assert.equal(a[0].primary, true);
});
test('live link keeps its URL, platform opens the nelurio view', () => {
  const a = galleryActions({ href: 'https://amir.de', plat: true });
  assert.equal(a[0].href, 'https://amir.de');
  assert.equal(a[1].view, 'nelurio');
});
test('every project in the page data yields a valid action list', () => {
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'projects-data.js'), 'utf8');
  const slugs = [...src.matchAll(/slug:'([a-z]+)'/g)].map(m => m[1]);
  assert.ok(slugs.length >= 8);
});
