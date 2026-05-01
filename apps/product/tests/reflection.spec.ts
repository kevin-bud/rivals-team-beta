import { test, expect, type Request } from "@playwright/test";

// Verifier checks for the closing reflection step at /session.
// Runs against PRODUCT_URL (deployed Worker). Covers DoD items for the
// seventh screen between prompt 6 and the summary:
// - reflection screen is inserted between prompt 6 and the summary
// - tagging works for either partner; tags persist across Back/Next
// - notes are only visible/usable once a partner has tagged that prompt
// - skipping the reflection entirely renders the summary exactly as before
// - tagged prompts appear in the "Worth coming back to" section with
//   correct partner labels and notes
// - print emulation shows "Worth coming back to" at the top of the printed
//   output when tags exist
// - zero non-GET requests across the full flow including the print click
// - mobile-readable at 375px width

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

async function setupAndAdvanceToReflection(
  page: import("@playwright/test").Page,
  options: { fillNames?: boolean; answers?: ReadonlyArray<{ a: string; b: string }> } = {},
): Promise<void> {
  await page.goto("/session");
  if (options.fillNames !== false) {
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
  }
  await page.locator("#begin-btn").click();
  for (let i = 0; i < PROMPTS.length; i++) {
    const ans = options.answers?.[i];
    if (ans) {
      if (ans.a !== "") {
        await page.locator("#answer-a").fill(ans.a);
      }
      if (ans.b !== "") {
        await page.locator("#answer-b").fill(ans.b);
      }
    }
    await page.locator("#next-btn").click();
  }
  await expect(page.locator("#step-reflection")).toHaveAttribute(
    "data-active",
    "true",
  );
}

test.describe("Common Ground closing reflection", () => {
  test("reflection screen sits between prompt 6 and the summary", async ({
    page,
  }) => {
    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    // On prompt 6 the next button reads "Reflect", not "See summary".
    for (let i = 0; i < PROMPTS.length - 1; i++) {
      await page.locator("#next-btn").click();
    }
    await expect(page.locator("#progress-text")).toContainText("Prompt 6 of 6");
    await expect(page.locator("#next-btn")).toHaveText("Reflect");
    await page.locator("#next-btn").click();
    // The reflection screen is now active, summary not yet.
    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "false",
    );
    await expect(
      page.getByRole("heading", { name: /anything to come back to/i }),
    ).toBeVisible();
    // One row per prompt, each row showing the verbatim prompt text.
    const rows = page.locator("#reflection-list .reflection-row");
    await expect(rows).toHaveCount(PROMPTS.length);
    for (let i = 0; i < PROMPTS.length; i++) {
      await expect(rows.nth(i).locator(".row-prompt")).toContainText(
        PROMPTS[i],
      );
    }
  });

  test("each partner has their own tag toggle, labelled by their name", async ({
    page,
  }) => {
    await setupAndAdvanceToReflection(page);
    const firstRow = page.locator("#reflection-list .reflection-row").first();
    await expect(firstRow.locator('[data-tag-label="a"]')).toContainText(
      NAME_A,
    );
    await expect(firstRow.locator('[data-tag-label="b"]')).toContainText(
      NAME_B,
    );
    // Defaults to off.
    await expect(
      firstRow.locator('input[data-tag-input="a"]'),
    ).not.toBeChecked();
    await expect(
      firstRow.locator('input[data-tag-input="b"]'),
    ).not.toBeChecked();
    // Note inputs are hidden until the corresponding partner tags it.
    await expect(firstRow.locator('[data-note-field="a"]')).toBeHidden();
    await expect(firstRow.locator('[data-note-field="b"]')).toBeHidden();
  });

  test("tagging reveals the note input for that partner only", async ({
    page,
  }) => {
    await setupAndAdvanceToReflection(page);
    const row = page.locator("#reflection-list .reflection-row").nth(2);
    await row.locator('input[data-tag-input="a"]').check();
    await expect(row.locator('[data-note-field="a"]')).toBeVisible();
    await expect(row.locator('[data-note-field="b"]')).toBeHidden();
    // Untag clears visibility.
    await row.locator('input[data-tag-input="a"]').uncheck();
    await expect(row.locator('[data-note-field="a"]')).toBeHidden();
  });

  test("Back returns to prompt 6 with answers and tag state preserved", async ({
    page,
  }) => {
    const answers = PROMPTS.map((_, i) => ({
      a: `A answer ${i}`,
      b: `B answer ${i}`,
    }));
    await setupAndAdvanceToReflection(page, { answers });
    const row3 = page.locator("#reflection-list .reflection-row").nth(2);
    await row3.locator('input[data-tag-input="a"]').check();
    await row3.locator('input[data-note-input="a"]').fill("Mortgage call");
    const row5 = page.locator("#reflection-list .reflection-row").nth(4);
    await row5.locator('input[data-tag-input="b"]').check();

    await page.locator("#reflection-back-btn").click();
    await expect(page.locator("#step-prompt")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(page.locator("#progress-text")).toContainText("Prompt 6 of 6");
    // Prompt 6 answers preserved.
    await expect(page.locator("#answer-a")).toHaveValue("A answer 5");
    await expect(page.locator("#answer-b")).toHaveValue("B answer 5");
    // Step back further to prompt 1 to confirm nothing was lost.
    for (let i = 0; i < 5; i++) {
      await page.locator("#back-btn").click();
    }
    await expect(page.locator("#progress-text")).toContainText("Prompt 1 of 6");
    await expect(page.locator("#answer-a")).toHaveValue("A answer 0");
    await expect(page.locator("#answer-b")).toHaveValue("B answer 0");
    // Forward to reflection again.
    for (let i = 0; i < PROMPTS.length; i++) {
      await page.locator("#next-btn").click();
    }
    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    // Tag and note state preserved.
    const row3Again = page
      .locator("#reflection-list .reflection-row")
      .nth(2);
    await expect(
      row3Again.locator('input[data-tag-input="a"]'),
    ).toBeChecked();
    await expect(row3Again.locator('input[data-note-input="a"]')).toHaveValue(
      "Mortgage call",
    );
    const row5Again = page
      .locator("#reflection-list .reflection-row")
      .nth(4);
    await expect(
      row5Again.locator('input[data-tag-input="b"]'),
    ).toBeChecked();
    await expect(
      row5Again.locator('input[data-tag-input="a"]'),
    ).not.toBeChecked();
  });

  test("skipping the reflection entirely renders the summary with no extra section", async ({
    page,
  }) => {
    await setupAndAdvanceToReflection(page, {
      answers: PROMPTS.map((_, i) => ({ a: `A${i}`, b: `B${i}` })),
    });
    // Click See summary with zero tags and zero notes.
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
    // The Worth coming back to section is not shown.
    await expect(page.locator("#revisit-section")).toBeHidden();
    // Summary still has six prompt blocks, in order, with the answers.
    const blocks = page.locator("#summary-list .summary-prompt");
    await expect(blocks).toHaveCount(PROMPTS.length);
    for (let i = 0; i < PROMPTS.length; i++) {
      await expect(blocks.nth(i).locator(".prompt-text")).toHaveText(
        PROMPTS[i],
      );
    }
    // No "(none)" placeholder anywhere on the summary.
    await expect(page.locator("#step-summary")).not.toContainText("(none)");
  });

  test("tagged prompts appear in Worth coming back to with names and notes", async ({
    page,
  }) => {
    await setupAndAdvanceToReflection(page, {
      answers: PROMPTS.map((_, i) => ({ a: `A${i}`, b: `B${i}` })),
    });
    // Alex tags prompt 1 with a note.
    const row1 = page.locator("#reflection-list .reflection-row").nth(0);
    await row1.locator('input[data-tag-input="a"]').check();
    await row1
      .locator('input[data-note-input="a"]')
      .fill("Switching mortgage in July");
    // Bea tags prompt 4 with a note.
    const row4 = page.locator("#reflection-list .reflection-row").nth(3);
    await row4.locator('input[data-tag-input="b"]').check();
    await row4.locator('input[data-note-input="b"]').fill("Streaming bills");
    // Both tag prompt 5 — only Alex adds a note.
    const row5 = page.locator("#reflection-list .reflection-row").nth(4);
    await row5.locator('input[data-tag-input="a"]').check();
    await row5.locator('input[data-tag-input="b"]').check();
    await row5
      .locator('input[data-note-input="a"]')
      .fill("Pension review window");

    await page.locator("#reflection-next-btn").click();

    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );

    const section = page.locator("#revisit-section");
    await expect(section).toBeVisible();
    await expect(
      section.getByRole("heading", { name: /worth coming back to/i }),
    ).toBeVisible();

    const items = section.locator(".revisit-item");
    await expect(items).toHaveCount(3);
    // Items are ordered by original prompt order — prompts 1, 4, 5.
    await expect(items.nth(0).locator(".revisit-prompt")).toContainText(
      PROMPTS[0],
    );
    await expect(items.nth(0).locator(".tagged-by")).toContainText(NAME_A);
    await expect(items.nth(0).locator(".tagged-by")).not.toContainText(
      NAME_B,
    );
    await expect(items.nth(0)).toContainText("Switching mortgage in July");

    await expect(items.nth(1).locator(".revisit-prompt")).toContainText(
      PROMPTS[3],
    );
    await expect(items.nth(1).locator(".tagged-by")).toContainText(NAME_B);
    await expect(items.nth(1).locator(".tagged-by")).not.toContainText(
      NAME_A,
    );
    await expect(items.nth(1)).toContainText("Streaming bills");

    await expect(items.nth(2).locator(".revisit-prompt")).toContainText(
      PROMPTS[4],
    );
    await expect(items.nth(2).locator(".tagged-by")).toContainText(NAME_A);
    await expect(items.nth(2).locator(".tagged-by")).toContainText(NAME_B);
    await expect(items.nth(2)).toContainText("Pension review window");

    // Six-prompt list still rendered below as before.
    await expect(page.locator("#summary-list .summary-prompt")).toHaveCount(
      PROMPTS.length,
    );
  });

  test("revisit item with no notes still shows partner labels", async ({
    page,
  }) => {
    await setupAndAdvanceToReflection(page, {
      answers: PROMPTS.map((_, i) => ({ a: `A${i}`, b: `B${i}` })),
    });
    const row2 = page.locator("#reflection-list .reflection-row").nth(1);
    await row2.locator('input[data-tag-input="a"]').check();
    // No note typed — empty notes are allowed.
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    const item = page.locator("#revisit-section .revisit-item").first();
    await expect(item.locator(".tagged-by")).toContainText(NAME_A);
    // No revisit-note paragraph rendered when the note is empty.
    await expect(item.locator(".revisit-note")).toHaveCount(0);
  });

  test("Start a new session clears tags and notes too", async ({ page }) => {
    await setupAndAdvanceToReflection(page);
    const row = page.locator("#reflection-list .reflection-row").first();
    await row.locator('input[data-tag-input="a"]').check();
    await row.locator('input[data-note-input="a"]').fill("KEEP-NOT");
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#revisit-section")).toBeVisible();
    await page.locator("#restart-link").click();
    await expect(page.locator("#step-setup")).toHaveAttribute(
      "data-active",
      "true",
    );
    // Begin again and walk to reflection — no checkboxes should be on.
    await page.locator("#begin-btn").click();
    for (let i = 0; i < PROMPTS.length; i++) {
      await page.locator("#next-btn").click();
    }
    const checkboxes = page.locator(
      '#reflection-list input[type="checkbox"]',
    );
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked();
    }
    // Stored state has no answer/tag content.
    const stored = await page.evaluate(() =>
      sessionStorage.getItem("common-ground.session.v2"),
    );
    if (stored !== null) {
      expect(stored).not.toContain("KEEP-NOT");
    }
  });

  test("print emulation shows Worth coming back to at the top when tags exist", async ({
    page,
  }) => {
    await setupAndAdvanceToReflection(page, {
      answers: PROMPTS.map((_, i) => ({ a: `printable A${i}`, b: `printable B${i}` })),
    });
    const row = page.locator("#reflection-list .reflection-row").nth(2);
    await row.locator('input[data-tag-input="a"]').check();
    await row.locator('input[data-note-input="a"]').fill("Print-note alpha");
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );

    await page.emulateMedia({ media: "print" });

    // Reflection step is hidden under print. Setup and prompt steps too.
    await expect(page.locator("#step-reflection")).toBeHidden();
    await expect(page.locator("#step-setup")).toBeHidden();
    await expect(page.locator("#step-prompt")).toBeHidden();
    // Summary visible, revisit section visible at the top.
    await expect(page.locator("#step-summary")).toBeVisible();
    await expect(page.locator("#revisit-section")).toBeVisible();
    // Worth coming back to renders before the six-prompt list — assert
    // ordering using bounding boxes.
    const revisitBox = await page.locator("#revisit-section").boundingBox();
    const firstSummaryBlock = page
      .locator("#summary-list .summary-prompt")
      .first();
    const summaryBox = await firstSummaryBlock.boundingBox();
    expect(revisitBox).not.toBeNull();
    expect(summaryBox).not.toBeNull();
    if (revisitBox && summaryBox) {
      expect(revisitBox.y).toBeLessThan(summaryBox.y);
    }
    // Legible weight — at least 11px.
    const promptFontSize = await page
      .locator("#revisit-section .revisit-prompt")
      .first()
      .evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
    expect(promptFontSize).toBeGreaterThanOrEqual(11);
    const sectionHeadingFontSize = await page
      .locator("#revisit-section h2")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
    expect(sectionHeadingFontSize).toBeGreaterThanOrEqual(11);

    await page.emulateMedia({ media: null });
  });

  test("print emulation hides Worth coming back to when no tags exist", async ({
    page,
  }) => {
    await setupAndAdvanceToReflection(page, {
      answers: PROMPTS.map((_, i) => ({ a: `A${i}`, b: `B${i}` })),
    });
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("#revisit-section")).toBeHidden();
    await expect(page.locator("#step-summary")).toBeVisible();
    await page.emulateMedia({ media: null });
  });

  test("zero non-GET requests across full flow including print click", async ({
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
    // Reflection — tag two prompts with sentinel notes.
    const noteSentinelA = `note-sentinel-A-${Math.random().toString(36).slice(2)}`;
    const noteSentinelB = `note-sentinel-B-${Math.random().toString(36).slice(2)}`;
    sentinels.push(noteSentinelA, noteSentinelB);
    const row1 = page.locator("#reflection-list .reflection-row").nth(0);
    await row1.locator('input[data-tag-input="a"]').check();
    await row1.locator('input[data-note-input="a"]').fill(noteSentinelA);
    const row3 = page.locator("#reflection-list .reflection-row").nth(2);
    await row3.locator('input[data-tag-input="b"]').check();
    await row3.locator('input[data-note-input="b"]').fill(noteSentinelB);
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    // Stub print and click the button.
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

  test("served /session source still has no fetch/XHR/sendBeacon tokens", async ({
    request,
  }) => {
    const response = await request.get("/session");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).not.toMatch(/fetch\s*\(/);
    expect(body).not.toMatch(/XMLHttpRequest/);
    expect(body).not.toMatch(/sendBeacon/);
    expect(body).toContain("step-reflection");
    expect(body).toContain("revisit-section");
  });

  test("reflection screen is mobile-readable at 375px width", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await setupAndAdvanceToReflection(page);
    const main = page.locator("main");
    const box = await main.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }
    // No horizontal scroll.
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
    // Tag controls remain usable — exercise one to make sure layout is not
    // hiding controls offscreen.
    const row = page.locator("#reflection-list .reflection-row").first();
    await row.locator('input[data-tag-input="a"]').check();
    await expect(row.locator('[data-note-field="a"]')).toBeVisible();
  });

  test("html lang is en-GB and copy uses British spelling", async ({
    page,
  }) => {
    await setupAndAdvanceToReflection(page);
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en-GB");
    // The reflection copy uses British phrasing ("the lot", "homework
    // list"). These are not Americanisms but the test guards against
    // accidental American spellings ("favorite", "color", "behavior").
    const text = await page.locator("#step-reflection").textContent();
    expect(text || "").not.toMatch(/\bfavorite\b/i);
    expect(text || "").not.toMatch(/\bbehavior\b/i);
    // "color" appears in CSS property names but not in user-visible copy.
    expect(text || "").not.toMatch(/\bcolor\b/);
  });
});
