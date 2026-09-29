import { chromium } from "@playwright/test";
const b = await chromium.launch();
const ctx = await b.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push("JS: " + e.message.slice(0, 80)));
p.on("console", (m) => {
  if (m.type() === "error") errors.push("CONSOLE: " + m.text().slice(0, 80));
});
await p.goto("http://127.0.0.1:4199/nelurio.html");
await p.waitForTimeout(1500);
await p.evaluate(() => document.getElementById("shelf-next").click());
await p.waitForTimeout(600);
const scrolled = await p.evaluate(() => {
  const el = document.querySelector(".lib");
  return el ? Math.abs(el.scrollLeft) > 0 : false;
});
console.log("shelf scrolled after arrow:", scrolled);
console.log("JS errors:", errors.length === 0 ? "NONE" : errors.join("; "));
await b.close();
