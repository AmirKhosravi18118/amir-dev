import { expect, test } from "@playwright/test";

// Hermetic smoke — boots the repo's own static server (see playwright.config.ts).
// Storage is cleared before every scenario: localStorage.lang persists between
// tests and would race the DE/EN assertions (CONTRIBUTING traps #6).
test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});

test("page loads: hero, nav, no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  await page.goto("/index.html");
  await expect(page.locator("h1")).toContainText("I like building things");
  await expect(page.locator("nav")).toBeVisible();
  expect(errors).toEqual([]);
});

test("all sections anchor-resolve", async ({ page }) => {
  await page.goto("/index.html");
  for (const id of ["projects", "skills", "certificates", "about", "contact"]) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
});

test("every project card renders: title, links, tags", async ({ page }) => {
  await page.goto("/index.html#projects");
  const cards = page.locator("#carTrack .proj"); // modal clones exist too — scope to the track
  await expect(cards).toHaveCount(5);
  await expect(page.locator("#carTrack .proj h3").filter({ hasText: "Nelurio" })).toBeVisible();
  await expect(page.locator('#carTrack a[href*="nelurio.duckdns.org"]').first()).toBeVisible();
});

test("all images load (naturalWidth > 0)", async ({ page }) => {
  await page.goto("/index.html");
  const imgs = page.locator("img");
  const count = await imgs.count();
  expect(count).toBeGreaterThanOrEqual(5);
  for (let i = 0; i < count; i++) {
    const nw = await imgs.nth(i).evaluate((el) => (el as HTMLImageElement).naturalWidth);
    expect(nw, `image #${i} (${await imgs.nth(i).getAttribute("src")}) must load`).toBeGreaterThan(
      0,
    );
  }
});

test("i18n invariant: DE switch translates nav + projects lead", async ({ page }) => {
  await page.goto("/index.html");
  await page.click("#btn-de");
  await expect(page.locator('[data-i18n="nav.projects"]')).toHaveText("Projekte");
  const lead = page.locator('[data-i18n="proj.lead"]');
  await expect(lead).not.toHaveText(/Four products/);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
});

test("reload keeps persisted language", async ({ page }) => {
  await page.goto("/index.html");
  await page.click("#btn-de");
  await page.reload();
  await expect(page.locator('[data-i18n="nav.projects"]')).toHaveText("Projekte");
});
