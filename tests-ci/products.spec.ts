import { expect, test } from "@playwright/test";

// T003 — products.html storefront (docs/tasks/T003-products-storefront.md).

test("1: loads with 5 product cards and zero console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/products.html");
  await expect(page.locator(".prod")).toHaveCount(5);
  await expect(page.locator("h1")).toContainText("Not demo projects");
  expect(errors).toEqual([]);
});

test("2: all cover images load", async ({ page }) => {
  await page.goto("/products.html");
  const imgs = page.locator(".prod img");
  await expect(imgs).toHaveCount(5);
  for (let i = 0; i < 5; i++) {
    const nw = await imgs.nth(i).evaluate((el) => (el as HTMLImageElement).naturalWidth);
    expect(nw, `cover #${i} must load`).toBeGreaterThan(0);
  }
});

test("3: every product carries its live link", async ({ page }) => {
  await page.goto("/products.html");
  for (const url of [
    "https://nelurio.duckdns.org",
    "https://amirkhosravi18118.github.io/finello-app/",
    "https://waschhalle-92-5-111-34.sslip.io",
    "https://nexdeutsch-92-5-111-34.sslip.io",
    "https://www.saadtattoo.de",
  ]) {
    await expect(page.locator(`.prod a[href="${url}"]`)).toHaveCount(1);
  }
});

test("4: DE toggle translates hero + cards, persists over reload", async ({ page }) => {
  await page.goto("/products.html");
  await page.click("#btn-de");
  await expect(page.locator("h1")).toContainText("Keine Demo-Projekte");
  await expect(page.locator('[data-i18n="ops.h2"]')).toHaveText(
    "Ein VPS. Kein Drama. Alles überwacht.",
  );
  await page.reload();
  await expect(page.locator('[data-i18n="nav.products"]')).toHaveText("Produkte");
});

test("5: index nav links to Products with i18n", async ({ page }) => {
  await page.goto("/index.html");
  const link = page.locator('nav a[href="products.html"]');
  await expect(link).toHaveCount(1);
  await link.click();
  await expect(page).toHaveURL(/products\.html/);
  await expect(page.locator(".prod")).toHaveCount(5);
  await page.click("#btn-de");
  await expect(page.locator('nav a[href="products.html"]')).toHaveText("Produkte");
});

test("6: platform strip lists the ops facts", async ({ page }) => {
  await page.goto("/products.html");
  await expect(page.locator(".op")).toHaveCount(6);
  const text = (await page.locator("#platform").innerText()).toLowerCase();
  for (const fact of ["vps", "caddy", "ci/cd", "monitoring", "gdpr"]) {
    expect(text, `platform strip must mention ${fact}`).toContain(fact);
  }
});
