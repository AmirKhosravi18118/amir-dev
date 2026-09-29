import { test, expect } from "@playwright/test";

// Product shelf: 8s story-style autoplay, progress dots, pause on hover.
const step = () => undefined;

test("shelf autoplay: advances within 9s and dots follow", async ({ page }) => {
  await page.goto("/nelurio.html");
  // the autoplay only ticks while the shelf is in view (by design) — bring it into view first
  await page.locator("#products").scrollIntoViewIfNeeded();
  const lib = page.locator(".lib");
  await expect(page.locator("#shelfdots button")).toHaveCount(4);
  await expect(page.locator("#shelfdots button >> nth=0")).toHaveClass(/active/);
  const before = await lib.evaluate((el) => Math.abs(el.scrollLeft));
  await page.waitForTimeout(9200);
  const after = await lib.evaluate((el) => Math.abs(el.scrollLeft));
  expect(after).toBeGreaterThan(before);
  const activeLabel = await page.locator("#shelfdots button.active").getAttribute("aria-label");
  expect(activeLabel).not.toBe("Go to product 1");
});

test("shelf dots: clicking the last segment lands on scroll-end", async ({ page }) => {
  await page.goto("/nelurio.html");
  // at 1280 viewport the far cards are reachable only clamped at scroll-end —
  // the last dot must always land there and light the last segment
  await page.click("#shelfdots button >> nth=3");
  await page.waitForTimeout(1000);
  await expect(page.locator("#shelfdots button >> nth=3")).toHaveClass(/active/);
  const atEnd = await page.evaluate(() => {
    const lib = document.querySelector(".lib");
    return Math.abs(lib.scrollLeft) >= lib.scrollWidth - lib.clientWidth - 4;
  });
  expect(atEnd).toBe(true);
});

test("shelf pauses while hovered, resumes after leave", async ({ page }) => {
  await page.goto("/nelurio.html");
  await page.hover(".lib");
  const before = await page.locator(".lib").evaluate((el) => Math.abs(el.scrollLeft));
  await page.waitForTimeout(9200);
  const during = await page.locator(".lib").evaluate((el) => Math.abs(el.scrollLeft));
  expect(during).toBe(before); // paused — no advance
  await page.mouse.move(10, 10); // leave the section
  await page.waitForTimeout(9200);
  const after = await page.locator(".lib").evaluate((el) => Math.abs(el.scrollLeft));
  expect(after).toBeGreaterThan(during); // resumed
});
