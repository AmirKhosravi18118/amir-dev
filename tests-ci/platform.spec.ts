import { expect, test } from "@playwright/test";

// T006 — Nelurio Suite product-library landing (docs/tasks/T006-nelurio-suite.md).
// Hermetic: googletagmanager.com route-intercepted for the consent cases.

const GTM = "**/googletagmanager.com/**";

test.beforeEach(async ({ page }) => {
  await page.route(GTM, (route) => route.fulfill({ status: 200, body: "" }));
});

test("1: loads — hero, 4 product cards, zero console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto("/nelurio.html");
  await expect(page.locator("nav .logo")).toContainText("Nelurio");
  await expect(page.locator("h1 .grad")).toContainText("one library");
  await expect(page.locator(".lib .prod")).toHaveCount(4);
  expect(errors).toEqual([]);
});

test("2: every card is real — status chip + https open link", async ({ page }) => {
  await page.goto("/nelurio.html");
  const cards = page.locator(".lib .prod");
  await expect(cards).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await expect(cards.nth(i).locator(".status")).toBeVisible();
    await expect(cards.nth(i).locator('a[href^="https://"]').first()).toBeAttached();
  }
  for (let i = 0; i < 4; i++) {
    await expect(cards.nth(i).locator(".feat li").first()).toBeVisible();
  }
  // ZERO GitHub links — the platform tunnel is the only sales channel
  expect(await page.locator('a[href*="github.com"]').count()).toBe(0);
  // store funnel: pricing section with 4 plans routing into checkout
  await expect(page.locator(".plans .plan")).toHaveCount(4);
  // 4 library cards + 4 pricing plans route into checkout
  expect(await page.locator('a[href^="checkout.html?app="]').count()).toBe(8);
});

test("3: DE toggle — hero + cards translate, persists over reload", async ({ page }) => {
  await page.goto("/nelurio.html");
  await page.evaluate(() => setLang("de"));
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.locator(".hero .sub")).toContainText("Produktbibliothek von Amir Khosravi");
  await expect(page.locator(".lib .prod").nth(1).locator("h3")).toHaveText("Finello");
  await expect(page.locator('[data-i18n="lib.h2"]')).toHaveText("Vier Produkte. Ein Regal.");
  await page.reload();
  await expect(page.locator(".hero .sub")).toContainText("Produktbibliothek");
});

test("3b: FA toggle — RTL + Persian hero, persists over reload", async ({ page }) => {
  await page.goto("/nelurio.html");
  await page.evaluate(() => setLang("fa"));
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator(".hero .sub")).toContainText("کتابخانه محصولات امیر خسروی");
  await expect(page.locator('[data-i18n="lib.h2"]')).toHaveText("چهار محصول. یک قفسه.");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
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

test("5: structure — support, FAQ and legal links", async ({ page }) => {
  await page.goto("/nelurio.html");
  await expect(page.locator(".steps")).toHaveCount(1);
  await expect(page.locator(".support .supcard")).toHaveCount(2);
  await expect(page.locator(".faq details")).toHaveCount(5);
  await expect(page.locator('footer a[href="/legal/impressum.html"]')).toBeAttached();
  await expect(page.locator('footer a[href="/legal/privacy.html"]')).toBeAttached();
  await expect(page.locator('footer a[href="/legal/terms.html"]')).toBeAttached();
  await expect(page.locator('footer a[href="/legal/widerruf.html"]')).toBeAttached();
  await expect(page.locator('footer a[href="https://amir-khosravi.de"]')).toBeAttached();
  // SEO: structured data present
  expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThanOrEqual(
    2,
  );
});
