import { test, expect } from "@playwright/test";

// Platform nav must be identical and functional on EVERY page: Home +
// hash links that point back to the nelurio.com home sections.
const PAGES = ["/checkout.html", "/account.html", "/nelurio.html"];

for (const path of PAGES) {
  test(`nav tabs work on ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(path);
    const tabs = page.locator("nav ul a");
    await expect(tabs.filter({ hasText: "Home" }).first()).toHaveAttribute("href", "/");
    await expect(tabs.filter({ hasText: "Products" })).toHaveAttribute("href", /\/?#products/);
    await expect(tabs.filter({ hasText: "Pricing" }).first()).toHaveAttribute(
      "href",
      /\/?#pricing/,
    );
    // Products tab actually navigates to the home page's products anchor
    await tabs.filter({ hasText: "Products" }).first().click();
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => location.pathname + location.hash)).toMatch(
      /#products$/,
    );
    expect(errors).toEqual([]);
  });
}

test("checkout language dropdown is functional (was dead — no setLang)", async ({ page }) => {
  await page.goto("/checkout.html");
  await page.click("#btn-lang");
  await page.locator("#lang-dd-menu button", { hasText: "Deutsch" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.locator('nav a[data-i18n="nav.home"]')).toHaveText("Start");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "de"); // persisted
});

test("chat nav has the standard tabs", async ({ page }) => {
  await page.goto("/chat.html");
  await expect(page.locator('nav a[data-i18n="nav.home"]')).toHaveAttribute("href", "/");
  await expect(page.locator('nav a[data-i18n="nav.products"]')).toBeVisible();
  await expect(page.locator('nav a[data-i18n="nav.pricing"]')).toBeVisible();
});
