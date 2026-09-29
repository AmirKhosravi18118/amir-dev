import { test, expect } from "@playwright/test";

// Account page: auth tabs + languages when signed out, profile + apps when signed in.
test("account: signed-out view — tabs, password toggle, legal links, DE/FA", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/account.html");
  await expect(page.locator("#authview")).toBeVisible();
  await expect(page.locator("#userview")).toBeHidden();

  // register tab reveals the display-name field
  await page.click("#tab-register");
  await expect(page.locator("#f-register")).toBeVisible();
  await expect(page.locator("#f-login")).toBeHidden();
  await expect(page.locator("#tab-register")).toHaveAttribute("aria-selected", "true");
  await page.click("#tab-login");
  await expect(page.locator("#f-login")).toBeVisible();

  // password eye toggles the input type
  await expect(page.locator("#li-pass")).toHaveJSProperty("type", "password");
  await page.click(".pw .eye >> nth=0");
  await expect(page.locator("#li-pass")).toHaveJSProperty("type", "text");

  // legal microcopy links into /legal/
  await page.click("#tab-register");
  await expect(page.locator('#f-register a[href="/legal/terms.html"]')).toBeAttached();
  await expect(page.locator('#f-register a[href="/legal/privacy.html"]')).toBeAttached();

  // DE translates + persists over reload; FA switches the page to RTL
  await page.evaluate(() => setLang("de"));
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await page.evaluate(() => setLang("fa"));
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  expect(errors).toEqual([]);
});

test("account: signed-in view — profile header, badges, trial upsell, empty state", async ({
  page,
}) => {
  await page.route("**/api/v1/auth/me", (route) =>
    route.fulfill({
      json: { data: { email: "sara@example.com", displayName: "Sara Ahmadi" } },
    }),
  );
  await page.route("**/api/v1/entitlements", (route) =>
    route.fulfill({
      json: {
        data: [
          { appSlug: "nelurio", status: "trial", daysLeft: 21 },
          { appSlug: "finello", status: "premium" },
          { appSlug: "washhalle", status: "available" },
        ],
      },
    }),
  );
  await page.goto("/account.html");
  await expect(page.locator("#userview")).toBeVisible();
  await expect(page.locator("#authview")).toBeHidden();
  await expect(page.locator("#p-name")).toHaveText("Sara Ahmadi");
  await expect(page.locator("#p-email")).toHaveText("sara@example.com");
  await expect(page.locator("#p-initials")).toHaveText("SA");

  const rows = page.locator(".approw");
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0).locator(".badge")).toHaveText(/21/); // trial with days left
  await expect(rows.nth(0).locator('a[href="checkout.html?app=nelurio"]')).toBeAttached(); // trial→buy upsell
  await expect(rows.nth(1).locator(".badge")).toHaveText("Premium");
  await expect(rows.nth(1).locator("a.act")).toHaveCount(0); // premium needs no upsell
  await expect(rows.nth(2).locator("button.act")).toBeAttached(); // available→start trial
});

test("account: signed-in with zero entitlements shows the empty state", async ({ page }) => {
  await page.route("**/api/v1/auth/me", (route) =>
    route.fulfill({ json: { data: { email: "x@example.com", displayName: "X" } } }),
  );
  await page.route("**/api/v1/entitlements", (route) => route.fulfill({ json: { data: [] } }));
  await page.goto("/account.html");
  await expect(page.locator("#userview")).toBeVisible();
  await expect(page.locator("#entempty")).toBeVisible();
  await expect(page.locator(".approw")).toHaveCount(0);
});
