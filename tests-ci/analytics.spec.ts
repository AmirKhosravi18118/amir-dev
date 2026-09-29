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
  await expect(page.locator('[data-i18n="cons.accept"]')).toHaveText("Alle akzeptieren");
  await expect(page.locator("#consentBanner p")).toContainText("notwendige Speicherung");
});

test("6: customize — statistics off saves denied (no gtag), on saves granted", async ({ page }) => {
  await page.goto("/products.html");
  await expect(page.locator("#consentBanner")).toBeVisible();
  await page.click("#consent-customize");
  await expect(page.locator("#consent-detail")).toBeVisible();
  // essential checkbox is locked on
  await expect(page.locator("#consent-detail input").first()).toBeDisabled();
  await page.uncheck("#consent-stats");
  await page.click("#consent-save");
  await expect(page.locator("#consentBanner")).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem("analytics_consent"))).toBe("denied");
  expect(await page.evaluate(() => typeof window.gtag)).toBe("undefined");

  // reopen via openConsent() (the footer link's handler opens collapsed) — expand settings
  await page.evaluate(() => openConsent());
  await page.click("#consent-customize");
  await expect(page.locator("#consent-detail")).toBeVisible();
  await expect(page.locator("#consent-stats")).not.toBeChecked();
  await page.check("#consent-stats");
  await page.click("#consent-save");
  expect(await page.evaluate(() => localStorage.getItem("analytics_consent"))).toBe("granted");
  await expect(page.locator('script[src*="googletagmanager.com"]').first()).toBeAttached();
});

test("7: footer cookie-settings link reopens the banner on nelurio.com", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("analytics_consent", "denied"));
  await page.goto("/nelurio.html");
  await expect(page.locator("#consentBanner")).toBeHidden();
  await page.click('a[data-i18n="f.cookies"]');
  await expect(page.locator("#consentBanner")).toBeVisible();
  await page.click("#consent-accept");
  expect(await page.evaluate(() => localStorage.getItem("analytics_consent"))).toBe("granted");
});
