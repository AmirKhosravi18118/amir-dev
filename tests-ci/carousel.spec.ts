import { expect, test } from "@playwright/test";

// T001 smoke — required cases 1,2,3,3b,4,5,6,7,8 from docs/tasks/T001-projects-carousel.md.
// localStorage.lang persists between tests → clear storage per scenario (traps #6).
test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

const trackX = (page: import("@playwright/test").Page, pct: number) =>
  expect(page.locator("#carTrack")).toHaveAttribute(
    "style",
    new RegExp(`translateX\\(-?${pct}%\\)`),
  );

test("1: 5 slides, 5 dots, slide 1 (Nelurio) visible on load", async ({ page }) => {
  await expect(page.locator("#carTrack .proj")).toHaveCount(5);
  await expect(page.locator("#carDots .car-dot")).toHaveCount(5);
  await expect(page.locator("#carTrack .proj").first().locator("h3")).toHaveText("Nelurio");
  await trackX(page, 0);
  await expect(page.locator(".car-dot").first()).toHaveClass(/is-active/);
});

test("2: next ×2 → Washhalle, prev ×1 → NexDeutsch; active dot follows", async ({ page }) => {
  await page.locator(".car-next").click();
  await trackX(page, 100);
  await page.locator(".car-next").click();
  await trackX(page, 200);
  await expect(page.locator("#carTrack .proj").nth(2).locator("h3")).toHaveText("Washhalle App");
  await expect(page.locator(".car-dot").nth(2)).toHaveClass(/is-active/);
  await page.locator(".car-prev").click();
  await trackX(page, 100);
  await expect(page.locator("#carTrack .proj").nth(1).locator("h3")).toHaveText("NexDeutsch");
});

test("3: dot 4 → Saad Tattoo; 3b: next until wrap ends Finello→Nelurio", async ({ page }) => {
  await page.locator(".car-dot").nth(3).click();
  await trackX(page, 300);
  await expect(page.locator("#carTrack .proj").nth(3).locator("h3")).toHaveText(
    "Saad Tattoo — Studio Website",
  );

  for (let i = 3; i < 4; i++) await page.locator(".car-next").click();
  await trackX(page, 400);
  const finello = page.locator("#carTrack .proj").nth(4);
  await expect(finello.locator("h3")).toHaveText("Finello");
  await expect(finello.locator('a[href*="finello-app"]')).toBeVisible();
  await page.locator(".car-next").click();
  await trackX(page, 0); // wrapped: …Saad Tattoo → Finello → Nelurio
});

test("4: autoplay advances by itself within 9 s", async ({ page }) => {
  await page.locator("#projCarousel").scrollIntoViewIfNeeded();
  await trackX(page, 0);
  await page.waitForFunction(
    () =>
      /translateX\(-?(?:100|[2-9]\d*|1\d{2,})%\)/.test(
        document.getElementById("carTrack").getAttribute("style") ?? "",
      ),
    { timeout: 9_500 },
  );
  await expect(page.locator(".car-dot").nth(1)).toHaveClass(/is-active/);
});

test("5: view-all modal opens with all 5 projects, body scroll locked", async ({ page }) => {
  await page.click("#viewAllBtn");
  await expect(page.locator("#projModal")).toBeVisible();
  await expect(page.locator("#pmList .proj")).toHaveCount(5);
  await expect(page.locator("#pmTitle")).toHaveText("All projects");
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
});

test("6: ESC closes modal, focus returns to opener", async ({ page }) => {
  await page.click("#viewAllBtn");
  await expect(page.locator("#projModal")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#projModal")).toBeHidden();
  await expect(page.locator("#viewAllBtn")).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});

test("7: DE toggle translates slides + modal; persists over reload", async ({ page }) => {
  await page.click("#btn-de");
  await expect(page.locator("#pmTitle")).toHaveText("Alle Projekte");
  await expect(page.locator('[data-i18n="proj.viewall"]')).toHaveText("Alle ansehen");
  await expect(page.locator('#carTrack [data-i18n="p1.what"]')).toHaveText(
    "KI-Lernassistent für Studierende — live im Beta.",
  );
  await page.reload();
  await expect(page.locator('[data-i18n="nav.projects"]')).toHaveText("Projekte");
  await expect(page.locator("#pmTitle")).toHaveText("Alle Projekte");
});

test("8: every image on the page loads, incl. shot.png + finello.png", async ({ page }) => {
  const imgs = page.locator("#carTrack img");
  await expect(imgs).toHaveCount(5);
  for (let i = 0; i < 5; i++) {
    const src = await imgs.nth(i).getAttribute("src");
    const nw = await imgs.nth(i).evaluate((el) => (el as HTMLImageElement).naturalWidth);
    expect(nw, `${src} must load`).toBeGreaterThan(0);
  }
  const shot = page.locator('#carTrack img[src="shot.png"]');
  expect(await shot.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});
