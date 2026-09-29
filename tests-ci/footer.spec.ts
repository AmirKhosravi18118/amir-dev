import { test, expect } from "@playwright/test";

// CODE-FIREWALL: the footer must be the SAME standard block on every
// platform page — balanced 4 columns (brand / platform / support / legal),
// no product links (owner order), consistent base row.
const PAGES = ["/nelurio.html", "/checkout.html", "/account.html", "/chat.html"];

for (const path of PAGES) {
  test(`standard footer on ${path}`, async ({ page }) => {
    await page.goto(path);
    const footer = page.locator("footer");
    await expect(footer.locator(".fbrand .logo")).toBeVisible();
    await expect(footer.locator(".fchip")).toContainText("EU-hosted");
    await expect(footer.locator('h4[data-i18n="f.platform"]')).toBeVisible();
    await expect(footer.locator('h4[data-i18n="f.support"]')).toBeVisible();
    await expect(footer.locator('h4[data-i18n="ft.legal"]')).toBeVisible();
    // legal column: the four compliance pages must stay linked
    for (const page_name of ["f.imprint", "f.privacy", "f.terms", "f.withdraw"]) {
      await expect(footer.locator(`a[data-i18n="${page_name}"]`)).toBeAttached();
    }
    // support column: the three real channels
    await expect(footer.locator('a[data-i18n="f.whatsapp"]')).toBeAttached();
    await expect(footer.locator('a[data-i18n="f.livechat"]')).toBeAttached();
    await expect(footer.locator('a[data-i18n="f.contact"]')).toBeAttached();
    // owner order: NO product links in the footer
    expect(await footer.locator('a[href*="#p-"]').count()).toBe(0);
    // base row
    await expect(footer.locator('span[data-i18n="f.rights"]')).toContainText("2026");
  });
}

test("nelurio.com footer includes the cookie-settings reopen", async ({ page }) => {
  await page.goto("/nelurio.html");
  await expect(page.locator('footer a[data-i18n="f.cookies"]')).toBeAttached();
});
