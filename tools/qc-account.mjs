import { chromium } from "@playwright/test";

const b = await chromium.launch();
const shots = [];

// 1. signed-out EN desktop
let ctx = await b.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 900 } });
let p = await ctx.newPage();
await p.goto("http://127.0.0.1:4173/account.html");
await p.waitForTimeout(400);
await p.screenshot({ path: "qc_ac_en.png", fullPage: true });
shots.push("qc_ac_en.png");

// 2. signed-out FA (RTL)
await p.evaluate(() => setLang("fa"));
await p.waitForTimeout(300);
await p.screenshot({ path: "qc_ac_fa.png", fullPage: true });
shots.push("qc_ac_fa.png");

// 3. signed-in mocked desktop
await p.route("**/api/v1/auth/me", (r) =>
  r.fulfill({ json: { data: { email: "sara@example.com", displayName: "Sara Ahmadi" } } }),
);
await p.route("**/api/v1/entitlements", (r) =>
  r.fulfill({
    json: {
      data: [
        { appSlug: "nelurio", status: "trial", daysLeft: 21 },
        { appSlug: "finello", status: "premium" },
        { appSlug: "nexdeutsch", status: "available" },
      ],
    },
  }),
);
await p.goto("http://127.0.0.1:4173/account.html");
await p.evaluate(() => setLang("en"));
await p.waitForTimeout(500);
await p.screenshot({ path: "qc_ac_in.png", fullPage: true });
shots.push("qc_ac_in.png");
await ctx.close();

// 4. signed-out mobile
ctx = await b.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
p = await ctx.newPage();
await p.goto("http://127.0.0.1:4173/account.html");
await p.waitForTimeout(400);
await p.screenshot({ path: "qc_ac_mob.png", fullPage: true });
shots.push("qc_ac_mob.png");
await ctx.close();

await b.close();
console.log("shots:", shots.join(" "));
