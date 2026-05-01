import { test, expect, type Request } from "@playwright/test";

// Verifier checks for the two-arc selector and the new "A big upcoming
// purchase" arc. Runs against PRODUCT_URL (deployed Worker). Covers DoD
// items 1-13 of the second-arc task:
// - both arcs reachable from the landing surface
// - five verbatim purchase prompts in order
// - per-arc state isolation in sessionStorage
// - reflection step references only the chosen arc's prompts
// - summary heading names the arc; print heading also names the arc
// - "Worth coming back to" still works on the new arc
// - network watch through both arcs end-to-end (zero non-GET requests)

const OPEN_PROMPTS: ReadonlyArray<string> = [
  "What's one money decision coming up in the next three months that affects both of you?",
  "When you think about money in your household right now, what feels good — and what feels uncertain?",
  "If a windfall of one month's take-home pay turned up tomorrow, no strings attached, what would each of you want to do with it?",
  "What's a recurring expense you'd like to talk about — bigger, smaller, or just understood differently — but haven't?",
  "Looking twelve months ahead, what's one thing about your money you'd like to feel more settled about?",
  "Is there something about money you wish your partner understood about how you grew up with it?",
];

const PURCHASE_PROMPTS: ReadonlyArray<string> = [
  "What is the purchase, and roughly how much are we talking about?",
  "What would having it actually change about your day-to-day, in a sentence each?",
  "What are you each willing to trade off for it — saving rate, another goal, a different timeframe?",
  "What would have to be true about the rest of your finances for this to feel comfortable rather than tight?",
  "If you imagine yourselves twelve months after the decision — bought it or didn't — what would each of you most want to be able to say?",
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

test.describe("Common Ground arc selector + big-purchase arc", () => {
  test("landing surfaces both arcs as parallel CTAs", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator(".arc-choice");
    await expect(cards).toHaveCount(2);
    // The cards are visibly equal citizens — same component, no
    // "recommended" / "popular" badge, identical visual weight.
    await expect(cards.nth(0)).toContainText("An open conversation");
    await expect(cards.nth(0)).toContainText("Six prompts");
    await expect(cards.nth(1)).toContainText("A big upcoming purchase");
    await expect(cards.nth(1)).toContainText("Five prompts");

    const openCta = page.getByRole("button", {
      name: /start an open conversation/i,
    });
    const purchaseCta = page.getByRole("button", {
      name: /start a big-purchase conversation/i,
    });
    await expect(openCta).toHaveAttribute("href", "/session?arc=open");
    await expect(purchaseCta).toHaveAttribute(
      "href",
      "/session?arc=purchase",
    );

    // Neutral framing — no scoring/ranking/recommendation language.
    const cardsText = (await cards.allTextContents()).join(" ").toLowerCase();
    for (const banned of [
      "recommended",
      "popular",
      "good for beginners",
      "best for",
      "most chosen",
    ]) {
      expect(cardsText).not.toContain(banned);
    }
  });

  test("clicking the big-purchase CTA lands on /session?arc=purchase with arc-aware setup", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: /start a big-purchase conversation/i })
      .click();
    await expect(page).toHaveURL(/\/session\?arc=purchase$/);
    // Setup screen names the arc the partner is starting.
    await expect(page.locator("#step-setup")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(page.locator("#step-setup")).toContainText(
      "A big upcoming purchase",
    );
    // Arc tag in the header.
    await expect(page.locator("#arc-tag")).toContainText(
      "A big upcoming purchase",
    );
    await expect(page.locator("#arc-tag")).toHaveAttribute(
      "data-arc",
      "purchase",
    );
  });

  test("walks the big-purchase arc — five verbatim prompts in order, named summary", async ({
    page,
  }) => {
    await page.goto("/session?arc=purchase");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();

    for (let i = 0; i < PURCHASE_PROMPTS.length; i++) {
      await expect(page.locator("#progress-text")).toContainText(
        `Prompt ${i + 1} of 5 — A big upcoming purchase`,
      );
      await expect(page.locator("#prompt-text")).toHaveText(
        PURCHASE_PROMPTS[i],
      );
      // Reflect on the final prompt.
      if (i === PURCHASE_PROMPTS.length - 1) {
        await expect(page.locator("#next-btn")).toHaveText("Reflect");
      } else {
        await expect(page.locator("#next-btn")).toHaveText("Next");
      }
      await page.locator("#answer-a").fill(`A answer ${i}`);
      await page.locator("#answer-b").fill(`B answer ${i}`);
      await page.locator("#next-btn").click();
    }

    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    // Reflection lists exactly the five purchase prompts (no leakage of
    // open-arc prompts).
    const rows = page.locator("#reflection-list .reflection-row");
    await expect(rows).toHaveCount(PURCHASE_PROMPTS.length);
    for (let i = 0; i < PURCHASE_PROMPTS.length; i++) {
      await expect(rows.nth(i).locator(".row-prompt")).toContainText(
        PURCHASE_PROMPTS[i],
      );
    }
    // Reflection intro names the arc.
    await expect(page.locator("#step-reflection")).toContainText(
      "A big upcoming purchase",
    );
    // None of the open arc's prompts appear on the reflection screen.
    const reflectionText =
      (await page.locator("#step-reflection").textContent()) ?? "";
    for (const openPrompt of OPEN_PROMPTS) {
      expect(reflectionText).not.toContain(openPrompt);
    }

    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );

    // Summary heading names the arc.
    await expect(page.locator("#summary-heading")).toContainText(
      "big-purchase conversation",
    );
    // All five prompts appear on the summary, in order, with the verbatim
    // wording from the brief.
    const blocks = page.locator("#summary-list .summary-prompt");
    await expect(blocks).toHaveCount(PURCHASE_PROMPTS.length);
    for (let i = 0; i < PURCHASE_PROMPTS.length; i++) {
      await expect(blocks.nth(i).locator(".prompt-text")).toHaveText(
        PURCHASE_PROMPTS[i],
      );
      await expect(blocks.nth(i).locator("h2")).toContainText(
        `Prompt ${i + 1} of 5`,
      );
    }
    // None of the open arc's prompts appear on the summary.
    const summaryText =
      (await page.locator("#step-summary").textContent()) ?? "";
    for (const openPrompt of OPEN_PROMPTS) {
      expect(summaryText).not.toContain(openPrompt);
    }
  });

  test("regression — open arc still walks all six prompts in order", async ({
    page,
  }) => {
    await page.goto("/session?arc=open");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    for (let i = 0; i < OPEN_PROMPTS.length; i++) {
      await expect(page.locator("#progress-text")).toContainText(
        `Prompt ${i + 1} of 6 — An open conversation`,
      );
      await expect(page.locator("#prompt-text")).toHaveText(OPEN_PROMPTS[i]);
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
    const blocks = page.locator("#summary-list .summary-prompt");
    await expect(blocks).toHaveCount(OPEN_PROMPTS.length);
    for (let i = 0; i < OPEN_PROMPTS.length; i++) {
      await expect(blocks.nth(i).locator(".prompt-text")).toHaveText(
        OPEN_PROMPTS[i],
      );
    }
    await expect(page.locator("#summary-heading")).toContainText(
      "open conversation",
    );
  });

  test("per-arc state isolation: starting arc B after partial arc A shows empty inputs", async ({
    page,
  }) => {
    // Start the open arc, type some answers, leave partway.
    await page.goto("/session?arc=open");
    await page.locator("#name-a").fill("OpenAlex");
    await page.locator("#name-b").fill("OpenBea");
    await page.locator("#begin-btn").click();
    await page.locator("#answer-a").fill("OPEN-LEAK-A");
    await page.locator("#answer-b").fill("OPEN-LEAK-B");
    await page.locator("#next-btn").click();
    await expect(page.locator("#progress-text")).toContainText(
      "Prompt 2 of 6 — An open conversation",
    );

    // Switch to the big-purchase arc from the landing.
    await page.goto("/");
    await page
      .getByRole("button", { name: /start a big-purchase conversation/i })
      .click();
    await expect(page).toHaveURL(/\/session\?arc=purchase$/);

    // Names are empty in the new arc.
    await expect(page.locator("#name-a")).toHaveValue("");
    await expect(page.locator("#name-b")).toHaveValue("");

    // Begin the purchase arc — inputs on prompt 1 are empty (no leakage).
    await page.locator("#name-a").fill("PurchaseAlex");
    await page.locator("#name-b").fill("PurchaseBea");
    await page.locator("#begin-btn").click();
    await expect(page.locator("#progress-text")).toContainText(
      "Prompt 1 of 5 — A big upcoming purchase",
    );
    await expect(page.locator("#answer-a")).toHaveValue("");
    await expect(page.locator("#answer-b")).toHaveValue("");

    // Type something here, then advance.
    await page.locator("#answer-a").fill("PURCHASE-A");
    await page.locator("#answer-b").fill("PURCHASE-B");
    await page.locator("#next-btn").click();
    await expect(page.locator("#progress-text")).toContainText(
      "Prompt 2 of 5",
    );

    // Hop back to the open arc — its prior state is preserved on its own
    // key, but the purchase arc's state never bled across.
    await page.goto("/");
    await page
      .getByRole("button", { name: /start an open conversation/i })
      .click();
    await expect(page).toHaveURL(/\/session\?arc=open$/);
    // Names from the open arc rehydrate — that's per-arc continuity, not
    // cross-arc leakage.
    await expect(page.locator("#name-a")).toHaveValue("OpenAlex");
    await expect(page.locator("#name-b")).toHaveValue("OpenBea");

    // Inspect raw storage to confirm both arcs are isolated under their own
    // sub-keys.
    type ArcSlot = {
      nameA?: string;
      answers?: Array<{ a?: string; b?: string }>;
    };
    const root = await page.evaluate(() =>
      sessionStorage.getItem("common-ground.session.v2"),
    );
    expect(root).not.toBeNull();
    const parsedRoot = JSON.parse(root || "{}") as Record<string, ArcSlot>;
    expect(parsedRoot.open).toBeDefined();
    expect(parsedRoot.purchase).toBeDefined();
    // Open arc has the OPEN-LEAK markers; purchase arc has the PURCHASE
    // markers; neither bled across.
    expect(JSON.stringify(parsedRoot.open)).toContain("OPEN-LEAK-A");
    expect(JSON.stringify(parsedRoot.open)).not.toContain("PURCHASE-A");
    expect(JSON.stringify(parsedRoot.purchase)).toContain("PURCHASE-A");
    expect(JSON.stringify(parsedRoot.purchase)).not.toContain("OPEN-LEAK-A");
  });

  test("'Start a new session' on one arc clears only that arc", async ({
    page,
  }) => {
    // Seed the open arc.
    await page.goto("/session?arc=open");
    await page.locator("#name-a").fill("KeepMe-A");
    await page.locator("#name-b").fill("KeepMe-B");
    await page.locator("#begin-btn").click();
    await page.locator("#answer-a").fill("OPEN-PRESERVED");
    // Walk all the way through to the summary so we can hit Restart.
    for (let i = 0; i < OPEN_PROMPTS.length; i++) {
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );

    // Now seed the purchase arc.
    await page.goto("/session?arc=purchase");
    await page.locator("#name-a").fill("PurchaseAlex");
    await page.locator("#name-b").fill("PurchaseBea");
    await page.locator("#begin-btn").click();
    await page.locator("#answer-a").fill("PURCHASE-CLEARED");
    for (let i = 0; i < PURCHASE_PROMPTS.length; i++) {
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );

    // "Start a new session" from the purchase summary.
    await page.locator("#restart-link").click();
    await expect(page.locator("#step-setup")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(page.locator("#name-a")).toHaveValue("");

    // The open arc's stored state is untouched.
    type ArcSlot = {
      nameA?: string;
      answers?: Array<{ a?: string; b?: string }>;
    };
    const root = await page.evaluate(() =>
      sessionStorage.getItem("common-ground.session.v2"),
    );
    const parsedRoot = JSON.parse(root || "{}") as Record<string, ArcSlot>;
    expect(parsedRoot.open).toBeDefined();
    expect(parsedRoot.open?.nameA).toBe("KeepMe-A");
    expect(JSON.stringify(parsedRoot.open)).toContain("OPEN-PRESERVED");
    // The purchase arc was cleared by the restart on its own summary.
    if (parsedRoot.purchase) {
      expect(parsedRoot.purchase.nameA ?? "").toBe("");
      if (Array.isArray(parsedRoot.purchase.answers)) {
        for (const entry of parsedRoot.purchase.answers) {
          expect(entry.a ?? "").toBe("");
          expect(entry.b ?? "").toBe("");
        }
      }
    }
  });

  test("Worth coming back to and print emulation work on the big-purchase arc", async ({
    page,
  }) => {
    await page.goto("/session?arc=purchase");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    for (let i = 0; i < PURCHASE_PROMPTS.length; i++) {
      await page.locator("#answer-a").fill(`printable-A-${i}`);
      await page.locator("#answer-b").fill(`printable-B-${i}`);
      await page.locator("#next-btn").click();
    }
    // Tag prompt 2 (Alex) with a note.
    const row = page.locator("#reflection-list .reflection-row").nth(1);
    await row.locator('input[data-tag-input="a"]').check();
    await row
      .locator('input[data-note-input="a"]')
      .fill("Talk over the day-to-day cost again");
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );

    // Worth coming back to renders only the tagged prompt, in original arc
    // order, with verbatim purchase wording.
    const section = page.locator("#revisit-section");
    await expect(section).toBeVisible();
    const items = section.locator(".revisit-item");
    await expect(items).toHaveCount(1);
    await expect(items.nth(0).locator(".revisit-prompt")).toContainText(
      PURCHASE_PROMPTS[1],
    );
    await expect(items.nth(0)).toContainText(NAME_A);
    await expect(items.nth(0)).toContainText(
      "Talk over the day-to-day cost again",
    );

    // Print emulation: heading carries the arc name, revisit-section sits
    // above the per-prompt list, advisory footer stays legible.
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("#step-summary")).toBeVisible();
    await expect(page.locator(".print-only h1")).toContainText(
      "A big upcoming purchase",
    );
    await expect(page.locator("#revisit-section")).toBeVisible();
    const revisitBox = await page.locator("#revisit-section").boundingBox();
    const firstSummary = page.locator("#summary-list .summary-prompt").first();
    const summaryBox = await firstSummary.boundingBox();
    expect(revisitBox).not.toBeNull();
    expect(summaryBox).not.toBeNull();
    if (revisitBox && summaryBox) {
      expect(revisitBox.y).toBeLessThan(summaryBox.y);
    }
    // Advisory footer present once, in legible weight.
    const printFooter = page.locator(".print-footer");
    await expect(printFooter).toBeVisible();
    await expect(printFooter).toContainText(
      "does not provide financial, tax, legal, or investment advice",
    );
    const footerSize = await printFooter.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).fontSize),
    );
    expect(footerSize).toBeGreaterThanOrEqual(11);

    await page.emulateMedia({ media: null });
  });

  test("zero non-GET requests across both arcs end-to-end including print clicks", async ({
    page,
  }) => {
    const writeRequests: { method: string; url: string }[] = [];
    const allRequests: { url: string; postData: string | null }[] = [];
    page.on("request", (request) => {
      allRequests.push({
        url: request.url(),
        postData: request.postData(),
      });
      if (isWriteRequest(request)) {
        writeRequests.push({ method: request.method(), url: request.url() });
      }
    });

    const sentinels: string[] = [];

    // Walk the open arc through to print.
    await page.goto("/session?arc=open");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    for (let i = 0; i < OPEN_PROMPTS.length; i++) {
      const a = `open-A-${i}-${Math.random().toString(36).slice(2)}`;
      const b = `open-B-${i}-${Math.random().toString(36).slice(2)}`;
      sentinels.push(a, b);
      await page.locator("#answer-a").fill(a);
      await page.locator("#answer-b").fill(b);
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await page.evaluate(() => {
      window.print = () => {};
    });
    await page.locator("#print-btn").click();

    // Walk the purchase arc through to print, with sentinel notes too.
    await page.goto("/session?arc=purchase");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    for (let i = 0; i < PURCHASE_PROMPTS.length; i++) {
      const a = `purchase-A-${i}-${Math.random().toString(36).slice(2)}`;
      const b = `purchase-B-${i}-${Math.random().toString(36).slice(2)}`;
      sentinels.push(a, b);
      await page.locator("#answer-a").fill(a);
      await page.locator("#answer-b").fill(b);
      await page.locator("#next-btn").click();
    }
    const noteSentinel = `purchase-note-${Math.random().toString(36).slice(2)}`;
    sentinels.push(noteSentinel);
    const row = page.locator("#reflection-list .reflection-row").nth(2);
    await row.locator('input[data-tag-input="a"]').check();
    await row.locator('input[data-note-input="a"]').fill(noteSentinel);
    await page.locator("#reflection-next-btn").click();
    await page.evaluate(() => {
      window.print = () => {};
    });
    await page.locator("#print-btn").click();

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

  test("served session source for both arcs has no fetch/XHR/sendBeacon and the right prompts", async ({
    request,
  }) => {
    const open = await request.get("/session?arc=open");
    expect(open.status()).toBe(200);
    const openBody = await open.text();
    expect(openBody).not.toMatch(/fetch\s*\(/);
    expect(openBody).not.toMatch(/XMLHttpRequest/);
    expect(openBody).not.toMatch(/sendBeacon/);
    for (const prompt of OPEN_PROMPTS) {
      expect(openBody).toContain(prompt);
    }
    // Purchase prompts should NOT be embedded in the open-arc document.
    for (const prompt of PURCHASE_PROMPTS) {
      expect(openBody).not.toContain(prompt);
    }

    const purchase = await request.get("/session?arc=purchase");
    expect(purchase.status()).toBe(200);
    const purchaseBody = await purchase.text();
    expect(purchaseBody).not.toMatch(/fetch\s*\(/);
    expect(purchaseBody).not.toMatch(/XMLHttpRequest/);
    expect(purchaseBody).not.toMatch(/sendBeacon/);
    for (const prompt of PURCHASE_PROMPTS) {
      expect(purchaseBody).toContain(prompt);
    }
    // Open-arc prompts should NOT be embedded in the purchase document.
    for (const prompt of OPEN_PROMPTS) {
      expect(purchaseBody).not.toContain(prompt);
    }
  });

  test("/session with no arc param defaults to the open arc", async ({
    page,
  }) => {
    await page.goto("/session");
    // Setup screen still shows; arc tag in the header reads "An open
    // conversation" (the default).
    await expect(page.locator("#step-setup")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(page.locator("#arc-tag")).toContainText(
      "An open conversation",
    );
    await page.locator("#begin-btn").click();
    await expect(page.locator("#progress-text")).toContainText(
      "Prompt 1 of 6 — An open conversation",
    );
  });

  test("big-purchase arc is mobile-readable at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/session?arc=purchase");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    const main = page.locator("main");
    const box = await main.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
    // Walk to summary and assert no horizontal scroll there either.
    for (let i = 0; i < PURCHASE_PROMPTS.length; i++) {
      await page.locator("#answer-a").fill(`A${i} answer with some length`);
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    const summaryOverflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(summaryOverflow.scrollWidth).toBeLessThanOrEqual(
      summaryOverflow.clientWidth + 1,
    );
  });

  test("landing page is mobile-readable at 375px and arcs stack", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");
    const main = page.locator("main");
    const box = await main.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }
    const cards = page.locator(".arc-choice");
    await expect(cards).toHaveCount(2);
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });

  test("html lang is en-GB on /session?arc=purchase and copy uses British spelling", async ({
    page,
  }) => {
    await page.goto("/session?arc=purchase");
    expect(await page.locator("html").getAttribute("lang")).toBe("en-GB");
    const text = (await page.locator("body").textContent()) ?? "";
    // Guard against accidental Americanisms in arc copy.
    expect(text).not.toMatch(/\bfavorite\b/i);
    expect(text).not.toMatch(/\bbehavior\b/i);
    expect(text).not.toMatch(/\bcheck\b\s+book/i);
  });
});
