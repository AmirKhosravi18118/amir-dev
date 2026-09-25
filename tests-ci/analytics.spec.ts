import { expect, test } from "@playwright/test";

// T004 — consent-gated analytics layer (docs/tasks/T004-analytics-consent.md).
// ACTIVE since activation (2026-09-25): the owner's real Measurement ID ships
// in <html data-ga-id>. Hermetic: googletagmanager.com is route-intercepted;
// the synthetic no-ID case strips the attribute by rewriting the served HTML
// (addInitScript would run before documentElement exists and crash).

const GTM = "**/googletagmanager.com/**";

async function withoutId(page: import("@playwright/test").Page) {
  await page.route("**/products.html", async (route) => {
    const res = await route.fetch();
    const body = (await res.text()).replace(/\sdata-ga-id="[^"]*"/, "");
    await route.fulfill({ response: res, body });
  });
}

test.beforeEach(async ({ page }) => {
  await page.route(GTM, (route) => route.fulfill({ status: 200, body: "" }));
});

test("1: synthetic no-ID case — banner hidden, zero googletagmanager scripts", async ({ page }) => {
  await withoutId(page);
  await page.goto("/products.html");
  await expect(page.locator("#consentBanner")).toBeHidden();
  expect(await page.locator('script[src*="googletagmanager.com"]').count()).toBe(0);
});

test("2: shipped ID + undecided — banner visible, no gtag script yet", async ({ page }) => {
  await page.goto("/products.html");
  await expect(page.locator("html")).toHaveAttribute("data-ga-id", /^G-/);
  await expect(page.locator("#consentBanner")).toBeVisible();
  expect(await page.locator('script[src*="googletagmanager.com"]').count()).toBe(0);
});

test("3: accept — gtag injected, consent persisted, banner hidden", async ({ page }) => {
  await page.goto("/products.html");
  await expect(page.locator("#consentBanner")).toBeVisible();
  await page.click("#consent-accept");
  await expect(page.locator("#consentBanner")).toBeHidden();
  await expect(page.locator('script[src*="googletagmanager.com"]').first()).toBeAttached();
  expect(await page.evaluate(() => localStorage.getItem("analytics_consent"))).toBe("granted");
  await page.reload();
  await expect(page.locator("#consentBanner")).toBeHidden(); // decision remembered
  await expect(page.locator('script[src*="googletagmanager.com"]').first()).toBeAttached();
});

test("4: decline + reload — gtag never injected, decision persisted", async ({ page }) => {
  await page.goto("/products.html");
  await page.click("#consent-decline");
  await expect(page.locator("#consentBanner")).toBeHidden();
  expect(await page.locator('script[src*="googletagmanager.com"]').count()).toBe(0);
  await page.reload();
  expect(await page.locator('script[src*="googletagmanager.com"]').count()).toBe(0);
  await expect(page.locator("#consentBanner")).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem("analytics_consent"))).toBe("denied");
});

test("5: lang=de — banner shows German text", async ({ page }) => {
  await page.goto("/products.html");
  await page.click("#btn-de");
  await expect(page.locator('[data-i18n="cons.accept"]')).toHaveText("Akzeptieren");
  await expect(page.locator("#consentBanner p")).toContainText("einwilligungsbasierte");
});
