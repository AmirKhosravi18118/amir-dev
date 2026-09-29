import { chromium } from "@playwright/test";

// Responsive mechanical audit: viewports x pages. Flags:
//  - user-scrollable horizontal overflow (real bug)
//  - interactive elements smaller than 44x44 tap target (with exceptions)
//  - nav usability: are nav links visible/clickable at mobile width?
const PAGES = [
  "/index.html", "/nelurio.html", "/products.html",
  "/checkout.html", "/account.html", "/chat.html",
];
const VPS = [320, 390, 768, 1024];
const b = await chromium.launch();
const report = [];

for (const width of VPS) {
  for (const path of PAGES) {
    const ctx = await b.newContext({ viewport: { width, height: 844 } });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e).slice(0, 80)));
    await p.goto("http://127.0.0.1:4173" + path, { waitUntil: "load" });
    await p.waitForTimeout(250);
    const res = await p.evaluate(() => {
      const cw = document.documentElement.clientWidth;
      // real horizontal scroll test
      window.scrollTo(9999, 0);
      const scrolled = window.scrollX;
      window.scrollTo(0, 0);
      // nav usable? classic links OR burger pattern (burger visible + menu links exist)
      const navLinks = Array.from(document.querySelectorAll("nav ul a, nav ul button, nav .right a"));
      const navVisible = navLinks.filter((a) => {
        const r = a.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      }).length;
      const burger = document.getElementById("nav-burger");
      const burgerOK = burger && burger.getBoundingClientRect().width > 0 && document.querySelectorAll("#nav-mobile a").length > 0;
      // tiny tap targets among interactive elements
      const tiny = [];
      document.querySelectorAll("button, a, input, select, textarea, [role='button']").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        if (el.tagName === "INPUT" && (el.type === "radio" || el.type === "checkbox")) return; // label is the target
        if (r.width < 40 && r.height < 44) {
          const st = getComputedStyle(el);
          if (st.visibility !== "hidden" && st.display !== "none") {
            tiny.push(el.tagName + (el.id ? "#" + el.id : "") + "[" + Math.round(r.width) + "x" + Math.round(r.height) + "]:" + (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 18));
          }
        }
      });
      return { scrolled, navTotal: navLinks.length, navVisible, burgerOK, tiny: tiny.slice(0, 4) };
    });
    const issues = [];
    if (res.scrolled > 0) issues.push("HSCROLL");
    if (width <= 768 && res.navVisible === 0 && !res.burgerOK) issues.push("NAV-HIDDEN-NO-MENU");
    if (res.tiny.length) issues.push("TINY:" + res.tiny.join(" | "));
    if (errs.length) issues.push("JSERR:" + errs[0]);
    report.push(`${width}px ${path}: ${issues.length ? issues.join(" ;; ") : "OK"}`);
    await ctx.close();
  }
}
console.log(report.join("\n"));
await b.close();
