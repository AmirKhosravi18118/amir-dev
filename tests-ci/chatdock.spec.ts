import { test, expect } from "@playwright/test";

// Floating live-chat widget: opens/closes in place, sends via /api/v1/feedback,
// thread persists across reloads until the user starts a new chat.
test("chat dock: toggle, send, persist, new-chat reset", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  let feedbackPayload: any = null;
  await page.route("**/api/v1/feedback", async (route) => {
    feedbackPayload = route.request().postDataJSON();
    await route.fulfill({ json: { ok: true } });
  });

  await page.goto("/nelurio.html");
  const panel = page.locator("#chat-panel");
  await expect(panel).toBeHidden();

  // open + greeting
  await page.click("#chat-toggle");
  await expect(panel).toBeVisible();
  await expect(page.locator("#chat-toggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".bub.sys").first()).toBeVisible();

  // topic chips: default All topics, pick Finello
  await page.click('#chat-apps button[data-v="finello"]');
  await expect(page.locator('#chat-apps button[data-v="finello"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  // send a message
  await page.fill("#chat-email", "sara@example.com");
  await page.fill("#chat-msg", "Frage zum kostenlosen Testmonat bitte");
  await page.click("#chat-send");
  await expect(page.locator(".bub.me").last()).toContainText("Frage zum kostenlosen Testmonat");
  expect(feedbackPayload).toMatchObject({
    email: "sara@example.com",
  });
  expect(String(feedbackPayload.message)).toContain("[CHAT:finello]");

  // close, reopen — thread persisted
  await page.click("#chat-toggle");
  await expect(panel).toBeHidden();
  await page.click("#chat-toggle");
  await expect(panel).toBeVisible();
  await expect(page.locator(".bub.me").last()).toContainText("Frage zum kostenlosen Testmonat");

  // persistence survives a full reload
  await page.reload();
  await page.click("#chat-toggle");
  await expect(page.locator(".bub.me").last()).toContainText("Frage zum kostenlosen Testmonat");

  // new chat clears the thread (only greeting remains)
  await page.click("#chat-new");
  await expect(page.locator(".bub")).toHaveCount(1);
  await page.reload();
  await page.click("#chat-toggle");
  await expect(page.locator(".bub")).toHaveCount(1);

  // Escape closes
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  expect(errors).toEqual([]);
});

test("chat dock: invalid email shows inline error, no network call", async ({ page }) => {
  let called = 0;
  await page.route("**/api/v1/feedback", async (route) => {
    called += 1;
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto("/nelurio.html");
  await page.click("#chat-toggle");
  await page.fill("#chat-email", "not-an-email");
  await page.fill("#chat-msg", "kurz");
  await page.click("#chat-send");
  await expect(page.locator(".bub.sys").last()).toContainText(/email|E-Mail|ایمیل/);
  expect(called).toBe(0);
});
