import { test, expect } from "@playwright/test";

// The money page: app preselect, order summary math, honest payment methods.
test("checkout: ?app preselect + order summary total", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/checkout.html?app=finello");
  await expect(page.locator(".appopt")).toHaveCount(4);
  await expect(page.locator('input[name="app"][value="finello"]')).toBeChecked();
  await expect(page.locator("#sum-app")).toHaveText("finello");
  await expect(page.locator("#sum-total")).toHaveText("€2.99/mo");
  await page.selectOption("#plan", "yearly");
  await expect(page.locator("#sum-plan")).toHaveText("Yearly — 2 months free");
  await expect(page.locator("#sum-total")).toHaveText("€29.90/yr");
  expect(errors).toEqual([]);
});

test("checkout: PayPal live, card/bank honestly Coming soon, no dead pay path", async ({
  page,
}) => {
  await page.goto("/checkout.html");
  const pp = page.locator('input[name="method"][value="paypal"]');
  await expect(pp).toBeChecked();
  await expect(pp).toHaveAttribute("data-url", /paypal\.me\/amirhoseinkhosravi\/4\.99EUR/);
  for (const m of ["stripe", "bank"]) {
    await expect(page.locator(`input[name="method"][value="${m}"]`)).toHaveAttribute(
      "data-url",
      "soon",
    );
  }
  await expect(page.locator(".method:has-text('Überweisung') .soon")).toBeVisible();
  // empty email must block navigation (no /bank-style 404 hops)
  await page.click("#pay");
  await expect(page).toHaveURL(/checkout\.html/);
  await expect(page.locator("#cknote")).toContainText("email");
});
