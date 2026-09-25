import { expect, test } from "@playwright/test";

// T006 — Nelurio Suite product-library landing (docs/tasks/T006-nelurio-suite.md).
// Hermetic: googletagmanager.com route-intercepted for the consent cases.

const GTM = "**/googletagmanager.com/**";

test.beforeEach(async ({ page }) => {
  await page.route(GTM, (route) => route.fulfill({ status: 200, body: "" }));
});

test("1: loads — hero, 5 product cards, zero console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto("/nelurio.html");
  await expect(page.locator("h1")).toContainText("Nelurio");
  await expect(page.locator(".lib .prod")).toHaveCount(5);
  expect(errors).toEqual([]);
});

test("2: every card is real — status chip + https open link", async ({ page }) => {
  await page.goto("/nelurio.html");
  const cards = page.locator(".lib .prod");
  await expect(cards).toHaveCount(5);
  for (let i = 0; i < 5; i++) {
    await expect(cards.nth(i).locator(".status")).toBeVisible();
    await expect(cards.nth(i).locator('a[href^="https://"]').first()).toBeAttached();
  }
  // flagship carries the account CTA (its real auth exists)
  await expect(cards.nth(0).getByRole("link", { name: /create free account/i })).toBeAttached();
});

test("3: DE toggle — hero + cards translate, persists over reload", async ({ page }) => {
  await page.goto("/nelurio.html");
  await page.click("#btn-de");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.locator(".hero .sub")).toContainText("Produktbibliothek von Amir Khosravi");
  await expect(page.locator(".lib .prod").nth(1).locator("h3")).toHaveText("Finello");
  await expect(page.locator('[data-i18n="lib.h2"]')).toHaveText("Fünf Produkte. Ein Regal.");
  await page.reload();
  await expect(page.locator(".hero .sub")).toContainText("Produktbibliothek");
});

test("4: consent — banner visible, no gtag; accept injects and persists", async ({ page }) => {
  await page.goto("/nelurio.html");
  await expect(page.locator("#consentBanner")).toBeVisible();
  expect(await page.locator('script[src*="googletagmanager.com"]').count()).toBe(0);
  await page.click("#consent-accept");
  await expect(page.locator("#consentBanner")).toBeHidden();
  await expect(page.locator('script[src*="googletagmanager.com"]').first()).toBeAttached();
  expect(
    await page.locator('script[src*="googletagmanager.com"]').first().getAttribute("src"),
  ).toContain("G-M5C9K1JWH4");
  expect(await page.evaluate(() => localStorage.getItem("analytics_consent"))).toBe("granted");
});

test("5: structure — how/platform/roadmap + legal and builder links", async ({ page }) => {
  await page.goto("/nelurio.html");
  await expect(page.locator("#how .step")).toHaveCount(3);
  await expect(page.locator("#platform .op")).toHaveCount(6);
  await expect(page.locator("#roadmap .chip")).toHaveCount(3);
  await expect(page.locator('footer a[href*="legal/imprint"]')).toBeAttached();
  await expect(page.locator('footer a[href*="legal/privacy"]')).toBeAttached();
  await expect(page.locator('footer a[href="/"]')).toBeAttached();
  // honesty: no fake pricing/checkout anywhere
  const html = await page.content();
  expect(html.toLowerCase()).not.toContain("checkout");
  expect(html.toLowerCase()).not.toContain("buy now");
});
