'use strict';
/* Pure ordering rules for the action buttons in a project's gallery panel.
   Order is fixed: 1. live link, 2. platform link, 3. request a similar project.
   Exactly one primary button: the first one that exists. */
(function (root) {
  function galleryActions(p) {
    const list = [];
    if (p && p.href) list.push({ id: 'live', kind: 'link', href: p.href });
    if (p && p.plat) list.push({ id: 'platform', kind: 'view', view: 'nelurio' });
    list.push({ id: 'similar', kind: 'scroll', target: 'anfrage' });
    return list.map((a, i) => Object.assign({ primary: i === 0 }, a));
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { galleryActions };
  else root.galleryActions = galleryActions;
})(typeof window !== 'undefined' ? window : globalThis);
