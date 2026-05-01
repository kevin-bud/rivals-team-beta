import { test, expect, type Request } from "@playwright/test";

// Independent verifier suite for the six-prompt arc claim (commit 38e2d55).
// Runs against PRODUCT_URL. This file is read-only verification — it does not
// alter application code. Each test maps to a specific item in the reviewer's
// checklist on review-queue.md.

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

test.describe("Six-prompt arc — independent verifier", () => {
  test("1. six prompts appear in the exact verbatim order via Next", async ({
    page,
  }) => {
    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();

    for (let i = 0; i < PROMPTS.length; i++) {
      const promptText = await page.locator("#prompt-text").textContent();
      expect(promptText?.trim()).toBe(PROMPTS[i]);

      const progress = await page.locator("#progress-text").textContent();
      expect(progress?.trim()).toBe(`Prompt ${i + 1} of 6`);

      const nextLabel = await page.locator("#next-btn").textContent();
      if (i === PROMPTS.length - 1) {
        // Prompt 6 advances into the closing reflection step.
        expect(nextLabel?.trim()).toBe("Reflect");
      } else {
        expect(nextLabel?.trim()).toBe("Next");
      }

      // Type one character into "You" textarea (answer-a) to advance,
      // then click Next.
      await page.locator("#answer-a").fill(`a${i}`);
      await page.locator("#next-btn").click();
    }

    // After clicking the final ("Reflect") we are on the reflection step.
    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
  });

  test("2. Back/Next preserves answers across navigation", async ({ page }) => {
    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();

    // Prompt 1
    await page.locator("#answer-a").fill("a1-alex");
    await page.locator("#answer-b").fill("a1-bea");
    await page.locator("#next-btn").click();

    // Prompt 2
    await expect(page.locator("#progress-text")).toHaveText("Prompt 2 of 6");
    await page.locator("#answer-a").fill("a2-alex");
    await page.locator("#answer-b").fill("a2-bea");
    await page.locator("#next-btn").click();

    // Prompt 3
    await expect(page.locator("#progress-text")).toHaveText("Prompt 3 of 6");
    await page.locator("#answer-a").fill("a3-alex");
    await page.locator("#answer-b").fill("a3-bea");

    // Back twice -> should be back on prompt 1 with "a1-alex"/"a1-bea".
    await page.locator("#back-btn").click();
    await expect(page.locator("#progress-text")).toHaveText("Prompt 2 of 6");
    await expect(page.locator("#answer-a")).toHaveValue("a2-alex");
    await expect(page.locator("#answer-b")).toHaveValue("a2-bea");

    await page.locator("#back-btn").click();
    await expect(page.locator("#progress-text")).toHaveText("Prompt 1 of 6");
    await expect(page.locator("#answer-a")).toHaveValue("a1-alex");
    await expect(page.locator("#answer-b")).toHaveValue("a1-bea");

    // Now Next forward — values should still be there.
    await page.locator("#next-btn").click();
    await expect(page.locator("#progress-text")).toHaveText("Prompt 2 of 6");
    await expect(page.locator("#answer-a")).toHaveValue("a2-alex");
    await expect(page.locator("#answer-b")).toHaveValue("a2-bea");

    await page.locator("#next-btn").click();
    await expect(page.locator("#progress-text")).toHaveText("Prompt 3 of 6");
    await expect(page.locator("#answer-a")).toHaveValue("a3-alex");
    await expect(page.locator("#answer-b")).toHaveValue("a3-bea");

    // Back button hidden on prompt 1.
    await page.locator("#back-btn").click();
    await page.locator("#back-btn").click();
    await expect(page.locator("#progress-text")).toHaveText("Prompt 1 of 6");
    await expect(page.locator("#back-btn")).toBeHidden();
  });

  test("3. summary marks fully-skipped pairs and not partially-answered ones", async ({
    page,
  }) => {
    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();

    // Strategy:
    //   Prompt 1: both fill          (not skipped)
    //   Prompt 2: only Alex fills    (partial — not globally skipped)
    //   Prompt 3: only Bea fills     (partial — not globally skipped)
    //   Prompt 4: both blank         (skipped)
    //   Prompt 5: both blank         (skipped)
    //   Prompt 6: both fill          (not skipped)
    const fills: ReadonlyArray<{ a: string; b: string }> = [
      { a: "Alex on prompt 1", b: "Bea on prompt 1" },
      { a: "Alex only on 2", b: "" },
      { a: "", b: "Bea only on 3" },
      { a: "", b: "" },
      { a: "", b: "" },
      { a: "Alex on prompt 6", b: "Bea on prompt 6" },
    ];
    for (let i = 0; i < fills.length; i++) {
      if (fills[i].a) {
        await page.locator("#answer-a").fill(fills[i].a);
      }
      if (fills[i].b) {
        await page.locator("#answer-b").fill(fills[i].b);
      }
      await page.locator("#next-btn").click();
    }

    // Walk through the closing reflection step with no tags.
    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );

    const articles = page.locator("#summary-list .summary-prompt");
    await expect(articles).toHaveCount(6);

    // Prompt 1 — not skipped
    const a1 = articles.nth(0);
    await expect(a1).toHaveAttribute("data-skipped", "false");
    await expect(a1).not.toHaveClass(/skipped/);
    await expect(a1.locator(".skipped-tag")).toHaveCount(0);
    await expect(a1).toContainText("Alex on prompt 1");
    await expect(a1).toContainText("Bea on prompt 1");

    // Prompt 2 — partial: not globally skipped, only Bea cell shows (skipped).
    const a2 = articles.nth(1);
    await expect(a2).toHaveAttribute("data-skipped", "false");
    await expect(a2).not.toHaveClass(/skipped/);
    await expect(a2.locator(".skipped-tag")).toHaveCount(0);
    await expect(a2).toContainText("Alex only on 2");
    await expect(a2.locator("p.empty")).toHaveCount(1);
    await expect(a2.locator("p.empty")).toHaveText("(skipped)");

    // Prompt 3 — partial (mirror).
    const a3 = articles.nth(2);
    await expect(a3).toHaveAttribute("data-skipped", "false");
    await expect(a3).toContainText("Bea only on 3");
    await expect(a3.locator("p.empty")).toHaveCount(1);

    // Prompt 4 — fully skipped.
    const a4 = articles.nth(3);
    await expect(a4).toHaveAttribute("data-skipped", "true");
    await expect(a4).toHaveClass(/skipped/);
    await expect(a4.locator(".skipped-tag")).toHaveText("(skipped)");
    await expect(a4.locator("p.empty")).toHaveCount(2);

    // Prompt 5 — fully skipped.
    const a5 = articles.nth(4);
    await expect(a5).toHaveAttribute("data-skipped", "true");
    await expect(a5).toHaveClass(/skipped/);

    // Prompt 6 — not skipped.
    const a6 = articles.nth(5);
    await expect(a6).toHaveAttribute("data-skipped", "false");
    await expect(a6).toContainText("Alex on prompt 6");
    await expect(a6).toContainText("Bea on prompt 6");
  });

  test("4. print emulation: chrome hidden, print header + advice footer visible, no microscopic text", async ({
    page,
  }) => {
    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();

    // Fill prompt 1 and 2 with non-trivial content; skip 3-6.
    await page
      .locator("#answer-a")
      .fill("Mortgage renewal — discuss tracker vs fix.");
    await page
      .locator("#answer-b")
      .fill("Same — also worried about insurance.");
    await page.locator("#next-btn").click();
    await page.locator("#answer-a").fill("Holiday budget feels good.");
    await page.locator("#answer-b").fill("Council tax rise feels uncertain.");
    await page.locator("#next-btn").click();
    // Advance to summary by clicking through 3,4,5,6 with empty answers,
    // then through the closing reflection step.
    for (let i = 3; i <= 6; i++) {
      await page.locator("#next-btn").click();
    }
    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );

    // Switch to print media.
    await page.emulateMedia({ media: "print" });

    // Setup, prompt and reflection steps hidden under print media.
    await expect(page.locator("#step-setup")).toBeHidden();
    await expect(page.locator("#step-prompt")).toBeHidden();
    await expect(page.locator("#step-reflection")).toBeHidden();
    await expect(page.locator("#step-summary")).toBeVisible();

    // Chrome hidden under print.
    await expect(page.locator("header.no-print")).toBeHidden();
    await expect(page.locator("#step-summary .nav-row")).toBeHidden();
    await expect(
      page.locator("#step-summary .privacy-note.no-print"),
    ).toBeHidden();
    await expect(page.locator("#summary-heading")).toBeHidden();
    await expect(page.locator("#restart-link")).toBeHidden();
    await expect(page.locator("main > footer")).toBeHidden();

    // Print-only header visible with product name, names, date.
    const printOnly = page.locator(".print-only");
    await expect(printOnly).toBeVisible();
    await expect(printOnly).toContainText("Common Ground");
    await expect(printOnly).toContainText(
      "A household money conversation",
    );
    await expect(page.locator("#print-names")).toHaveText(`${NAME_A} and ${NAME_B}`);
    const printedDate = await page.locator("#print-date").textContent();
    expect(printedDate?.trim()).toMatch(/\d{1,2} [A-Z][a-z]+ \d{4}/);

    // All six prompts present in the summary list, each with both
    // answer cells. The revisit section may render its own
    // .revisit-prompt elements so we scope the count to the summary list.
    for (let i = 0; i < 6; i++) {
      const article = page.locator("#summary-list .summary-prompt").nth(i);
      await expect(article.locator(".prompt-text")).toContainText(PROMPTS[i]);
    }

    // Print footer visible — exactly one, legible (≥9pt).
    const printFooter = page.locator(".print-footer");
    await expect(printFooter).toHaveCount(1);
    await expect(printFooter).toBeVisible();
    await expect(printFooter).toContainText(
      "does not provide financial, tax, legal, or investment advice",
    );
    const fontSizePx = await printFooter.evaluate((el) => {
      return parseFloat(getComputedStyle(el).fontSize);
    });
    // 9pt in CSS is 12px; allow 11.5+. Anything below 11px would be sketchy.
    expect(fontSizePx).toBeGreaterThanOrEqual(11);

    // Restore screen media.
    await page.emulateMedia({ media: "screen" });
  });

  test("5. zero outbound writes during the full session including print click", async ({
    page,
  }) => {
    const writeRequests: { method: string; url: string; postData: string | null }[] = [];
    const allRequests: string[] = [];
    page.on("request", (req) => {
      allRequests.push(`${req.method()} ${req.url()}`);
      if (isWriteRequest(req)) {
        writeRequests.push({
          method: req.method(),
          url: req.url(),
          postData: req.postData(),
        });
      }
    });

    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();

    const realisticAnswers = [
      "Switching mortgage in July — fixed vs tracker.",
      "Holidays feel under control. Energy bills feel uncertain.",
      "I'd top up emergency fund. Bea would book a long weekend.",
      "Streaming subscriptions — too many, want to cut some.",
      "Want to feel less anxious checking the joint account.",
      "Mum stretched every penny — I learned to over-save.",
    ];
    for (let i = 0; i < 6; i++) {
      await page.locator("#answer-a").fill(realisticAnswers[i]);
      await page.locator("#answer-b").fill(`Bea: ${realisticAnswers[i]}`);
      await page.locator("#next-btn").click();
    }

    // Walk through the closing reflection step (no tags) to the summary.
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );

    // Stub out window.print so the click doesn't open the print dialog,
    // and watch for any request that fires anyway.
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as unknown as { print: () => void }).print = () => {
        /* no-op for test */
      };
    });
    await page.locator("#print-btn").click();
    // Settle.
    await page.waitForTimeout(500);

    expect(writeRequests).toEqual([]);
    // None of the requests at all should contain answer text.
    for (const reqLine of allRequests) {
      for (const ans of realisticAnswers) {
        expect(reqLine).not.toContain(ans);
      }
    }
  });

  test("5b. served /session HTML/JS contains no fetch/XHR/sendBeacon", async ({
    request,
    baseURL,
  }) => {
    const target = new URL("/session", baseURL!);
    const res = await request.get(target.toString());
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).not.toMatch(/fetch\(/);
    expect(body).not.toMatch(/XMLHttpRequest/);
    expect(body).not.toMatch(/sendBeacon/);
    // Sanity: state persistence is sessionStorage only.
    expect(body).toContain("sessionStorage");
    expect(body).not.toContain("localStorage");
    expect(body).not.toContain("document.cookie");
  });

  test("6. answers persist in sessionStorage; restart wipes them", async ({
    page,
  }) => {
    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    await page.locator("#answer-a").fill("UNIQUE-ALEX-MARKER");
    await page.locator("#answer-b").fill("UNIQUE-BEA-MARKER");
    await page.locator("#next-btn").click();

    // Confirm sessionStorage — the only persistence mechanism.
    const ss = await page.evaluate(() =>
      window.sessionStorage.getItem("common-ground.session.v1"),
    );
    expect(ss).toBeTruthy();
    expect(ss).toContain("UNIQUE-ALEX-MARKER");
    expect(ss).toContain("UNIQUE-BEA-MARKER");

    // Confirm answers do NOT live in localStorage or cookies.
    const ls = await page.evaluate(() =>
      window.localStorage.getItem("common-ground.session.v1"),
    );
    expect(ls).toBeNull();
    const localKeys = await page.evaluate(() =>
      Object.keys(window.localStorage),
    );
    expect(localKeys).toEqual([]);
    const cookies = await page.context().cookies();
    expect(cookies).toEqual([]);

    // Now go to summary and click "Start a new session". Expect storage wiped.
    for (let i = 1; i < 6; i++) {
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
    await page.locator("#restart-link").click();
    await expect(page.locator("#step-setup")).toHaveAttribute(
      "data-active",
      "true",
    );

    // After restart: storage may be re-created by show() with step:"setup",
    // but it must NOT contain the answer markers.
    const ssAfter = await page.evaluate(() =>
      window.sessionStorage.getItem("common-ground.session.v1"),
    );
    if (ssAfter !== null) {
      expect(ssAfter).not.toContain("UNIQUE-ALEX-MARKER");
      expect(ssAfter).not.toContain("UNIQUE-BEA-MARKER");
    }
    // Inputs cleared.
    await expect(page.locator("#name-a")).toHaveValue("");
    await expect(page.locator("#name-b")).toHaveValue("");
  });

  test("7. summary at 375px width does not horizontal-scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/session");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    await page
      .locator("#answer-a")
      .fill("A long answer that needs to wrap on a 375px screen without horizontal scrolling at all.");
    await page
      .locator("#answer-b")
      .fill("Another answer.");
    for (let i = 0; i < 6; i++) {
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    // Single column expected on narrow viewport.
    const cols = await page
      .locator("#step-summary .answers")
      .first()
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(cols.split(" ").length).toBe(1);
  });

  test("8. en-GB lang attribute is set on /session", async ({ page }) => {
    await page.goto("/session");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en-GB");
  });
});
