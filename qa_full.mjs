import { chromium } from "@playwright/test";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const pages = [
  ["nelurio", "/nelurio.html"],
  ["checkout", "/checkout.html"],
  ["account", "/account.html"],
];
for (const [name, path] of pages) {
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push("JS: " + e.message.slice(0, 80)));
  p.on("console", (m) => {
    if (m.type() === "error") errors.push("CONSOLE: " + m.text().slice(0, 80));
  });
  await p.goto("http://amir.nelurio.duckdns.org" + path);
  await p.waitForTimeout(1500);
  const header = await p.evaluate(() => {
    const nav = document.querySelector("nav");
    return nav ? "HAS NAV" : "NO NAV";
  });
  const footer = await p.evaluate(() => {
    const f = document.querySelector("footer");
    return f ? "HAS FOOTER" : "NO FOOTER";
  });
  const dark = await p.evaluate(() => {
    const s = getComputedStyle(document.body);
    return "bg:" + s.backgroundColor.slice(0, 20);
  });
  console.log(`\n=== ${name} ===`);
  console.log("URL:", p.url());
  console.log(
    "Header:",
    header,
    "| Footer:",
    footer,
    "| Dark bg:",
    dark.includes("13, 11, 29") || dark.includes("13,11,29"),
  );
  if (errors.length) console.log("ERRORS:", errors.slice(0, 3));
  await p.close();
}
await b.close();
