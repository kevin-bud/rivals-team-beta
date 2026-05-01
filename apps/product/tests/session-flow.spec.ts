import { test, expect, type Request } from "@playwright/test";

// Verifier checks for the three-step session flow at /session.
// Runs against PRODUCT_URL (deployed Worker). Covers the explicit checklist
// in coordination/review-queue.md for commit f42ca71:
// - CTA on / routes to /session
// - all three screens render and advance with names entered AND with empty answers
// - summary labels each answer with the partner name from setup
// - "Start a new session" returns to setup with state cleared
// - disclaimer visible on all three screens
// - no fetch/XHR/sendBeacon writes carry answer text to a server
// - mobile-readable, en-GB.

const ANSWER_A = "Considering remortgage in July";
const ANSWER_B = "Want to sort the holiday fund first";
const NAME_A = "Alex";
const NAME_B = "Bea";

function isWriteRequest(request: Request): boolean {
  const method = request.method().toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return false;
  }
  return true;
}

test.describe("Common Ground session flow", () => {
  test("landing CTA navigates to /session and is no longer disabled", async ({
    page,
  }) => {
    await page.goto("/");
    const cta = page.getByRole("button", { name: /start a session/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/session");
    const ariaDisabled = await cta.getAttribute("aria-disabled");
    expect(ariaDisabled).not.toBe("true");
    await cta.click();
    await expect(page).toHaveURL(/\/session$/);
  });

  test("setup is the default active step on /session", async ({ page }) => {
    await page.goto("/session");
    const setup = page.locator("#step-setup");
    const prompt = page.locator("#step-prompt");
    const summary = page.locator("#step-summary");
    await expect(setup).toHaveAttribute("data-active", "true");
    await expect(prompt).toHaveAttribute("data-active", "false");
    await expect(summary).toHaveAttribute("data-active", "false");
    await expect(setup).toBeVisible();
    await expect(prompt).toBeHidden();
    await expect(summary).toBeHidden();
    // Privacy note on setup screen.
    await expect(setup).toContainText(/leaves this device/i);
  });

  test("advances setup -> prompt -> summary with names entered, labels carry the names", async ({
    page,
  }) => {
    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();

    const prompt = page.locator("#step-prompt");
    await expect(prompt).toHaveAttribute("data-active", "true");
    await expect(prompt).toContainText(
      "What's one money decision coming up in the next three months that affects both of you?",
    );

    // Labels reflect the entered names.
    await expect(page.locator("#label-a")).toHaveText(`${NAME_A}'s answer`);
    await expect(page.locator("#label-b")).toHaveText(`${NAME_B}'s answer`);

    await page.locator("#answer-a").fill(ANSWER_A);
    await page.locator("#answer-b").fill(ANSWER_B);
    await page.locator("#see-summary-btn").click();

    const summary = page.locator("#step-summary");
    await expect(summary).toHaveAttribute("data-active", "true");
    await expect(page.locator("#summary-name-a")).toHaveText(NAME_A);
    await expect(page.locator("#summary-name-b")).toHaveText(NAME_B);
    await expect(page.locator("#summary-answer-a")).toHaveText(ANSWER_A);
    await expect(page.locator("#summary-answer-b")).toHaveText(ANSWER_B);
    // Restated prompt visible on summary too.
    await expect(summary).toContainText(
      "What's one money decision coming up in the next three months that affects both of you?",
    );
  });

  test("advances through all screens with empty answers (no blocking)", async ({
    page,
  }) => {
    await page.goto("/session");
    // Leave names empty so the labels fall back to "You" / "Your partner".
    await page.locator("#begin-btn").click();
    const prompt = page.locator("#step-prompt");
    await expect(prompt).toHaveAttribute("data-active", "true");
    await expect(page.locator("#label-a")).toHaveText("You's answer");
    await expect(page.locator("#label-b")).toHaveText("Your partner's answer");

    // Click straight through with both textareas empty.
    await page.locator("#see-summary-btn").click();
    const summary = page.locator("#step-summary");
    await expect(summary).toHaveAttribute("data-active", "true");
    await expect(page.locator("#summary-name-a")).toHaveText("You");
    await expect(page.locator("#summary-name-b")).toHaveText("Your partner");
    await expect(page.locator("#summary-answer-a")).toHaveText("(no answer)");
    await expect(page.locator("#summary-answer-b")).toHaveText("(no answer)");
  });

  test("'Start a new session' returns to setup with all four fields cleared", async ({
    page,
  }) => {
    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    await page.locator("#answer-a").fill(ANSWER_A);
    await page.locator("#answer-b").fill(ANSWER_B);
    await page.locator("#see-summary-btn").click();

    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );

    await page.locator("#restart-link").click();
    await expect(page.locator("#step-setup")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(page.locator("#name-a")).toHaveValue("");
    await expect(page.locator("#name-b")).toHaveValue("");
    await expect(page.locator("#answer-a")).toHaveValue("");
    await expect(page.locator("#answer-b")).toHaveValue("");

    // sessionStorage should not retain any answer text after restart.
    const stored = await page.evaluate(() =>
      sessionStorage.getItem("common-ground.session.v1"),
    );
    if (stored !== null) {
      const parsed = JSON.parse(stored) as Record<string, unknown>;
      expect(parsed.nameA ?? "").toBe("");
      expect(parsed.nameB ?? "").toBe("");
      expect(parsed.answerA ?? "").toBe("");
      expect(parsed.answerB ?? "").toBe("");
    }
  });

  test("disclaimer is visible from each of the three step states", async ({
    page,
  }) => {
    await page.goto("/session");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(
      "does not provide financial, tax, legal, or investment advice",
    );

    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(
      "does not provide financial, tax, legal, or investment advice",
    );

    await page.locator("#see-summary-btn").click();
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(
      "does not provide financial, tax, legal, or investment advice",
    );
  });

  test("no network write requests occur during the full flow, and answer text never appears in any request", async ({
    page,
  }) => {
    const writeRequests: { method: string; url: string }[] = [];
    const allRequests: { method: string; url: string; postData: string | null }[] = [];

    page.on("request", (request) => {
      allRequests.push({
        method: request.method(),
        url: request.url(),
        postData: request.postData(),
      });
      if (isWriteRequest(request)) {
        writeRequests.push({
          method: request.method(),
          url: request.url(),
        });
      }
    });

    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    await page.locator("#answer-a").fill(ANSWER_A);
    await page.locator("#answer-b").fill(ANSWER_B);
    await page.locator("#see-summary-btn").click();
    await page.locator("#restart-link").click();

    // No POST/PUT/PATCH/DELETE to anywhere.
    expect(writeRequests, JSON.stringify(writeRequests, null, 2)).toEqual([]);

    // Belt-and-braces: no request URL or body should leak the answer text.
    for (const req of allRequests) {
      expect(req.url).not.toContain(ANSWER_A);
      expect(req.url).not.toContain(ANSWER_B);
      if (req.postData !== null) {
        expect(req.postData).not.toContain(ANSWER_A);
        expect(req.postData).not.toContain(ANSWER_B);
      }
    }
  });

  test("served /session source contains no fetch/XHR/sendBeacon calls", async ({
    request,
  }) => {
    const response = await request.get("/session");
    expect(response.status()).toBe(200);
    const body = await response.text();
    // Allow the literal strings inside privacy copy, but the JS APIs themselves
    // must not appear. Match call-site-style tokens.
    expect(body).not.toMatch(/fetch\s*\(/);
    expect(body).not.toMatch(/XMLHttpRequest/);
    expect(body).not.toMatch(/sendBeacon/);
    // Confirm sessionStorage is the persistence layer.
    expect(body).toContain("sessionStorage");
    expect(body).toContain("common-ground.session.v1");
  });

  test("session page is single-column at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/session");
    const main = page.locator("main");
    await expect(main).toBeVisible();
    const box = await main.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }
  });

  test("html lang is en-GB on /session", async ({ page }) => {
    await page.goto("/session");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en-GB");
  });
});
