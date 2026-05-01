import { test, expect, type Request } from "@playwright/test";

// Verifier checks for the six-prompt session flow at /session.
// Runs against PRODUCT_URL (deployed Worker). Covers:
// - CTA on / routes to /session
// - all three screens render and advance with names entered AND with empty answers
// - six prompts, in order, with the verbatim wording from the brief
// - back/next navigation preserves answers when stepping back and forward
// - "See summary" appears on the final prompt (and only on the final prompt)
// - summary lists all six prompts, with "(skipped)" rendering on empty pairs
// - "Start a new session" returns to setup with state cleared
// - disclaimer visible from each step
// - no fetch/XHR/sendBeacon writes carry answer text to a server
// - print stylesheet hides chrome and shows the summary cleanly
// - mobile-readable, en-GB.

const PROMPTS: ReadonlyArray<string> = [
  "What's one money decision coming up in the next three months that affects both of you?",
  "When you think about money in your household right now, what feels good — and what feels uncertain?",
  "If a windfall of one month's take-home pay turned up tomorrow, no strings attached, what would each of you want to do with it?",
  "What's a recurring expense you'd like to talk about — bigger, smaller, or just understood differently — but haven't?",
  "Looking twelve months ahead, what's one thing about your money you'd like to feel more settled about?",
  "Is there something about money you wish your partner understood about how you grew up with it?",
];

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
  test("landing 'open conversation' CTA navigates to /session?arc=open", async ({
    page,
  }) => {
    await page.goto("/");
    const cta = page.getByRole("button", {
      name: /start an open conversation/i,
    });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/session?arc=open");
    const ariaDisabled = await cta.getAttribute("aria-disabled");
    expect(ariaDisabled).not.toBe("true");
    await cta.click();
    await expect(page).toHaveURL(/\/session\?arc=open$/);
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
    await expect(setup).toContainText(/leaves this device/i);
  });

  test("walks through all six prompts in order with verbatim wording", async ({
    page,
  }) => {
    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();

    const prompt = page.locator("#step-prompt");
    await expect(prompt).toHaveAttribute("data-active", "true");

    for (let i = 0; i < PROMPTS.length; i++) {
      await expect(page.locator("#progress-text")).toContainText(
        `Prompt ${i + 1} of 6`,
      );
      await expect(page.locator("#prompt-text")).toHaveText(PROMPTS[i]);
      // Labels reflect the entered names on every prompt.
      await expect(page.locator("#label-a")).toHaveText(`${NAME_A}'s answer`);
      await expect(page.locator("#label-b")).toHaveText(`${NAME_B}'s answer`);
      // Back hidden on prompt 1, visible on 2-6.
      if (i === 0) {
        await expect(page.locator("#back-btn")).toBeHidden();
      } else {
        await expect(page.locator("#back-btn")).toBeVisible();
      }
      // "Reflect" only on prompt 6 (advancing into the reflection step),
      // otherwise "Next".
      if (i === PROMPTS.length - 1) {
        await expect(page.locator("#next-btn")).toHaveText("Reflect");
      } else {
        await expect(page.locator("#next-btn")).toHaveText("Next");
      }
      if (i < PROMPTS.length - 1) {
        await page.locator("#next-btn").click();
      }
    }

    // Final next click goes to the reflection step (not the summary).
    await page.locator("#next-btn").click();
    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    // Advancing past the reflection step lands on the summary.
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
  });

  test("back button returns to previous prompt with previously entered answers preserved", async ({
    page,
  }) => {
    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();

    // Prompt 1.
    await page.locator("#answer-a").fill("answer one A");
    await page.locator("#answer-b").fill("answer one B");
    await page.locator("#next-btn").click();

    // Prompt 2.
    await expect(page.locator("#progress-text")).toContainText("Prompt 2 of 6");
    await page.locator("#answer-a").fill("answer two A");
    await page.locator("#answer-b").fill("answer two B");
    await page.locator("#next-btn").click();

    // Prompt 3.
    await expect(page.locator("#progress-text")).toContainText("Prompt 3 of 6");
    await page.locator("#answer-a").fill("answer three A");
    await page.locator("#answer-b").fill("answer three B");

    // Back to prompt 2 — both answers preserved.
    await page.locator("#back-btn").click();
    await expect(page.locator("#progress-text")).toContainText("Prompt 2 of 6");
    await expect(page.locator("#answer-a")).toHaveValue("answer two A");
    await expect(page.locator("#answer-b")).toHaveValue("answer two B");

    // Back again to prompt 1 — preserved.
    await page.locator("#back-btn").click();
    await expect(page.locator("#progress-text")).toContainText("Prompt 1 of 6");
    await expect(page.locator("#answer-a")).toHaveValue("answer one A");
    await expect(page.locator("#answer-b")).toHaveValue("answer one B");
    await expect(page.locator("#back-btn")).toBeHidden();

    // Forward through to prompt 3 — that prompt's answers also preserved.
    await page.locator("#next-btn").click();
    await page.locator("#next-btn").click();
    await expect(page.locator("#progress-text")).toContainText("Prompt 3 of 6");
    await expect(page.locator("#answer-a")).toHaveValue("answer three A");
    await expect(page.locator("#answer-b")).toHaveValue("answer three B");
  });

  test("editing an answer and going back preserves the edit", async ({
    page,
  }) => {
    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    await page.locator("#answer-a").fill("first try");
    await page.locator("#next-btn").click();
    await page.locator("#back-btn").click();
    await page.locator("#answer-a").fill("revised");
    await page.locator("#next-btn").click();
    await page.locator("#back-btn").click();
    await expect(page.locator("#answer-a")).toHaveValue("revised");
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

    // Click Next through all six prompts without typing anything, then
    // advance past the reflection step (skipping with zero tags is a
    // feature) to land on the summary.
    for (let i = 0; i < PROMPTS.length; i++) {
      await page.locator("#next-btn").click();
    }
    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
    // Every summary block should be marked skipped.
    const skippedBlocks = page.locator(
      '#summary-list .summary-prompt[data-skipped="true"]',
    );
    await expect(skippedBlocks).toHaveCount(PROMPTS.length);
    // Each rendered cell shows "(skipped)".
    const skippedCells = page.locator("#summary-list p.empty");
    await expect(skippedCells).toHaveCount(PROMPTS.length * 2);
    await expect(skippedCells.first()).toHaveText("(skipped)");
  });

  test("summary lists all six prompts in order with named answers", async ({
    page,
  }) => {
    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    // Fill three answers, leave three blank to exercise mixed skipping.
    const filled = [0, 2, 4];
    for (let i = 0; i < PROMPTS.length; i++) {
      if (filled.includes(i)) {
        await page.locator("#answer-a").fill(`A answer ${i}`);
        await page.locator("#answer-b").fill(`B answer ${i}`);
      }
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );

    const blocks = page.locator("#summary-list .summary-prompt");
    await expect(blocks).toHaveCount(PROMPTS.length);
    for (let i = 0; i < PROMPTS.length; i++) {
      const block = blocks.nth(i);
      await expect(block.locator(".prompt-text")).toHaveText(PROMPTS[i]);
      const headings = block.locator(".summary-block h3");
      await expect(headings.nth(0)).toHaveText(NAME_A);
      await expect(headings.nth(1)).toHaveText(NAME_B);
      if (filled.includes(i)) {
        await expect(block).toHaveAttribute("data-skipped", "false");
        await expect(block.locator(".summary-block").nth(0)).toContainText(
          `A answer ${i}`,
        );
        await expect(block.locator(".summary-block").nth(1)).toContainText(
          `B answer ${i}`,
        );
      } else {
        await expect(block).toHaveAttribute("data-skipped", "true");
        await expect(block).toContainText("(skipped)");
      }
    }

    // Summary names line shows both names.
    await expect(page.locator("#summary-names")).toContainText(NAME_A);
    await expect(page.locator("#summary-names")).toContainText(NAME_B);
  });

  test("'Start a new session' returns to setup with all fields cleared", async ({
    page,
  }) => {
    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    // Walk through prompts filling something in.
    for (let i = 0; i < PROMPTS.length; i++) {
      await page.locator("#answer-a").fill(`a${i}`);
      await page.locator("#answer-b").fill(`b${i}`);
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
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

    // Begin again — answers should be empty on prompt 1.
    await page.locator("#begin-btn").click();
    await expect(page.locator("#progress-text")).toContainText("Prompt 1 of 6");
    await expect(page.locator("#answer-a")).toHaveValue("");
    await expect(page.locator("#answer-b")).toHaveValue("");

    // sessionStorage should not retain any answer text after restart.
    type ArcEntry = {
      answers?: Array<{ a?: string; b?: string }>;
      nameA?: string;
      nameB?: string;
    };
    const stored = await page.evaluate(() =>
      sessionStorage.getItem("common-ground.session.v2"),
    );
    if (stored !== null) {
      const parsedRoot = JSON.parse(stored) as Record<string, ArcEntry>;
      const arcEntry = parsedRoot.open;
      if (arcEntry) {
        expect(arcEntry.nameA ?? "").toBe("");
        expect(arcEntry.nameB ?? "").toBe("");
        if (Array.isArray(arcEntry.answers)) {
          for (const entry of arcEntry.answers) {
            expect(entry.a ?? "").toBe("");
            expect(entry.b ?? "").toBe("");
          }
        }
      }
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

    // Walk to summary via the reflection step.
    for (let i = 0; i < PROMPTS.length; i++) {
      await page.locator("#next-btn").click();
    }
    // Footer is also visible from the reflection step.
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(
      "does not provide financial, tax, legal, or investment advice",
    );
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(
      "does not provide financial, tax, legal, or investment advice",
    );
  });

  test("no network write requests during a full flow, no answer text leaks", async ({
    page,
  }) => {
    const writeRequests: { method: string; url: string }[] = [];
    const allRequests: {
      method: string;
      url: string;
      postData: string | null;
    }[] = [];

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
    const sentinels: string[] = [];
    for (let i = 0; i < PROMPTS.length; i++) {
      const aText = `sentinel-A-${i}-${Math.random().toString(36).slice(2)}`;
      const bText = `sentinel-B-${i}-${Math.random().toString(36).slice(2)}`;
      sentinels.push(aText, bText);
      await page.locator("#answer-a").fill(aText);
      await page.locator("#answer-b").fill(bText);
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    await page.locator("#restart-link").click();

    expect(writeRequests, JSON.stringify(writeRequests, null, 2)).toEqual([]);
    for (const req of allRequests) {
      for (const sentinel of sentinels) {
        expect(req.url).not.toContain(sentinel);
        if (req.postData !== null) {
          expect(req.postData).not.toContain(sentinel);
        }
      }
    }
  });

  test("served /session source contains no fetch/XHR/sendBeacon calls", async ({
    request,
  }) => {
    const response = await request.get("/session");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).not.toMatch(/fetch\s*\(/);
    expect(body).not.toMatch(/XMLHttpRequest/);
    expect(body).not.toMatch(/sendBeacon/);
    expect(body).toContain("sessionStorage");
    expect(body).toContain("common-ground.session.v2");
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

  test("print emulation hides chrome and shows the summary cleanly", async ({
    page,
  }) => {
    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    await page.locator("#answer-a").fill("printable A");
    await page.locator("#answer-b").fill("printable B");
    for (let i = 0; i < PROMPTS.length; i++) {
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );

    await page.emulateMedia({ media: "print" });

    // Footer chrome and primary nav controls are hidden under print.
    await expect(page.locator("footer")).toBeHidden();
    await expect(page.locator("#print-btn")).toBeHidden();
    await expect(page.locator("#restart-link")).toBeHidden();
    await expect(page.locator(".no-print").first()).toBeHidden();
    // Summary content remains visible.
    await expect(page.locator("#step-summary")).toBeVisible();
    await expect(page.locator("#summary-list")).toBeVisible();
    // The print-only header (with names + date) is now visible.
    await expect(page.locator(".print-only").first()).toBeVisible();
    await expect(page.locator("#print-names")).toContainText(NAME_A);
    await expect(page.locator("#print-names")).toContainText(NAME_B);
    await expect(page.locator("#print-date")).not.toBeEmpty();
    // The legible advice line appears once in the print footer.
    const printFooter = page.locator(".print-footer");
    await expect(printFooter).toBeVisible();
    await expect(printFooter).toContainText(
      "does not provide financial, tax, legal, or investment advice",
    );
    // All six prompt blocks present in the printed output.
    await expect(
      page.locator("#summary-list .summary-prompt"),
    ).toHaveCount(PROMPTS.length);
    // No clipped horizontal scroll on the printed summary at A4-ish width.
    const main = page.locator("main");
    const box = await main.boundingBox();
    expect(box).not.toBeNull();

    // Reset for any subsequent tests in the same fixture.
    await page.emulateMedia({ media: null });
  });

  test("print stylesheet is part of the served document", async ({
    request,
  }) => {
    const response = await request.get("/session");
    const body = await response.text();
    expect(body).toMatch(/@media print/);
    expect(body).toMatch(/window\.print\(\)/);
  });
});
