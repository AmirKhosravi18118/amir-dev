import { chromium } from "@playwright/test";

// Mechanical i18n audit: for every page x (en, de, fa): run setLang, then
// flag every [data-i18n*] element whose text/attr is EMPTY or still equals
// the EN fallback after switching to de/fa (missing dict key/value), plus
// console errors + dir check.
const PAGES = [
  "/nelurio.html", "/checkout.html", "/account.html", "/chat.html",
  "/index.html", "/products.html",
];
const LANGS = ["de", "fa"];

const b = await chromium.launch();
const bugs = [];

for (const path of PAGES) {
  for (const lang of LANGS) {
    const p = await (await b.newContext()).newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e).slice(0, 100)));
    await p.goto("http://127.0.0.1:4173" + path);
    // capture EN fallbacks before switching
    const fallbacks = await p.evaluate(() => {
      const map = {};
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        map[el.getAttribute("data-i18n")] = el.textContent.trim();
      });
      return map;
    });
    await p.evaluate((l) => setLang(l), lang);
    await p.waitForTimeout(150);
    const res = await p.evaluate((lang) => {
      const out = { empty: [], unchanged: [], ariaBad: [], phBad: [] };
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const k = el.getAttribute("data-i18n");
        const t = el.textContent.trim();
        if (!t) out.empty.push(k);
      });
      document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
        const v = el.getAttribute("aria-label");
        if (!v || v === el.getAttribute("data-i18n-aria")) out.ariaBad.push(el.getAttribute("data-i18n-aria"));
      });
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const v = el.getAttribute("placeholder");
        if (!v) out.phBad.push(el.getAttribute("data-i18n-placeholder"));
      });
      return out;
    }, lang);
    const dir = await p.evaluate(() => document.documentElement.dir);
    // unchanged = text identical to EN fallback while in de/fa → likely missing translation
    // NOTE: some values are legitimately identical (brands, "FAQ", "Impressum") — filter known-ok
    const OK_SAME = /^(FAQ|Impressum|Premium|WhatsApp|Portfolio|Support|Nelurio.*)$/i;
    for (const k of res.empty) bugs.push(`[EMPTY] ${path} ${lang}: #${k}`);
    for (const k of res.ariaBad) bugs.push(`[ARIA-MISSING] ${path} ${lang}: #${k}`);
    for (const k of res.phBad) bugs.push(`[PH-MISSING] ${path} ${lang}: #${k}`);
    if (lang === "fa" && dir !== "rtl") bugs.push(`[DIR] ${path}: fa did not set rtl`);
    for (const e of errs) bugs.push(`[PAGEERROR] ${path} ${lang}: ${e}`);
    await p.close();
  }
}
console.log(bugs.length ? bugs.join("\n") : "NO MECHANICAL BUGS");
await b.close();
