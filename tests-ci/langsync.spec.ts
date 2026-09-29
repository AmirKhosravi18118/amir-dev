import { test, expect } from "@playwright/test";

// Language sync: chosen language persists across pages (same domain),
// travels via ?lang= for cross-domain links, and the personal site
// safely ignores unsupported languages instead of breaking.
test("fa persists across platform pages", async ({ page }) => {
  await page.goto("/nelurio.html");
  await page.evaluate(() => setLang("fa"));
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.goto("/checkout.html");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("h1")).toHaveText("پرداخت");
  await page.goto("/account.html");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await page.goto("/chat.html");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
});

test("?lang= param overrides and persists", async ({ page }) => {
  await page.goto("/checkout.html?lang=de");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.locator('nav a[data-i18n="nav.home"]')).toHaveText("Start");
  await page.goto("/nelurio.html");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
});

test("personal site ignores unsupported lang safely (en fallback)", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("lang", "fa"));
  await page.goto("/index.html");
  await expect(page.locator("html")).toHaveAttribute("lang", "en"); // clamped, not fa
  // language toggle buttons: EN active, no half-broken state
  await expect(page.locator("#btn-en")).toHaveClass(/is-active/);
  await page.goto("/products.html");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("de on personal site works and syncs onward via storage", async ({ page }) => {
  await page.goto("/index.html?lang=de");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  // cross-domain links carry the current language
  const promo = page.locator('.nlp-cta, a[href*="nelurio.com"]').first();
  await expect(promo).toHaveAttribute("href", /lang=de/);
});
