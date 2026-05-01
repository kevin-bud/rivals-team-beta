import { test, expect } from "@playwright/test";

const BASE = process.env.PRODUCT_URL ?? "http://localhost:8787";
const STORAGE_KEY = "common-ground.session.v2";

const PURCHASE_PROMPTS = [
  "What is the purchase, and roughly how much are we talking about?",
  "What would having it actually change about your day-to-day, in a sentence each?",
  "What are you each willing to trade off for it — saving rate, another goal, a different timeframe?",
  "What would have to be true about the rest of your finances for this to feel comfortable rather than tight?",
  "If you imagine yourselves twelve months after the decision — bought it or didn't — what would each of you most want to be able to say?",
];

const OPEN_PROMPTS = [
  "What's one money decision coming up in the next three months that affects both of you?",
  "When you think about money in your household right now, what feels good — and what feels uncertain?",
  "If a windfall of one month's take-home pay turned up tomorrow, no strings attached, what would each of you want to do with it?",
  "What's a recurring expense you'd like to talk about — bigger, smaller, or just understood differently — but haven't?",
  "Looking twelve months ahead, what's one thing about your money you'd like to feel more settled about?",
  "Is there something about money you wish your partner understood about how you grew up with it?",
];

test.describe("Independent second-arc verifier", () => {
  test("1. Prompt header reads 'Prompt N of TOTAL — <arc name>' on each arc", async ({
    page,
  }) => {
    await page.goto(`${BASE}/session?arc=purchase`);
    await page.locator("#name-a").fill("Alex");
    await page.locator("#name-b").fill("Bea");
    await page.locator("#begin-btn").click();
    for (let i = 0; i < PURCHASE_PROMPTS.length; i++) {
      const progress = await page.locator("#progress-text").textContent();
      expect(progress).toContain(`Prompt ${i + 1} of 5`);
      expect(progress).toContain("A big upcoming purchase");
      if (i < PURCHASE_PROMPTS.length - 1) {
        await page.locator("#next-btn").click();
      }
    }

    await page.goto(`${BASE}/session?arc=open`);
    await page.locator("#name-a").fill("Cam");
    await page.locator("#name-b").fill("Dee");
    await page.locator("#begin-btn").click();
    for (let i = 0; i < OPEN_PROMPTS.length; i++) {
      const progress = await page.locator("#progress-text").textContent();
      expect(progress).toContain(`Prompt ${i + 1} of 6`);
      expect(progress).toContain("An open conversation");
      if (i < OPEN_PROMPTS.length - 1) {
        await page.locator("#next-btn").click();
      }
    }
  });

  test("2. sessionStorage uses v2 root keyed by arc id", async ({ page }) => {
    await page.goto(`${BASE}/session?arc=purchase`);
    await page.locator("#name-a").fill("PURCHASE-A");
    await page.locator("#name-b").fill("PURCHASE-B");
    await page.locator("#begin-btn").click();
    await page.locator("textarea").first().fill("PURCHASE-ANSWER-A1");

    const raw = await page.evaluate(
      (key) => sessionStorage.getItem(key),
      STORAGE_KEY,
    );
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string) as Record<string, unknown>;
    expect(parsed).toHaveProperty("purchase");
    expect(JSON.stringify(parsed.purchase)).toContain("PURCHASE-ANSWER-A1");
    expect(JSON.stringify(parsed)).not.toContain("PURCHASE-A_LEAK_INTO_OPEN");

    await page.goto(`${BASE}/`);
    await page.locator('a:has-text("Start an open conversation")').click();
    await expect(page.locator("#name-a")).toHaveValue("");
    await expect(page.locator("#name-b")).toHaveValue("");
    await page.locator("#name-a").fill("OPEN-A");
    await page.locator("#name-b").fill("OPEN-B");
    await page.locator("#begin-btn").click();
    await expect(page.locator("textarea").first()).toHaveValue("");
    await page.locator("textarea").first().fill("OPEN-ANSWER-A1");

    const raw2 = await page.evaluate(
      (key) => sessionStorage.getItem(key),
      STORAGE_KEY,
    );
    const parsed2 = JSON.parse(raw2 as string) as Record<string, unknown>;
    expect(parsed2).toHaveProperty("open");
    expect(parsed2).toHaveProperty("purchase");
    expect(JSON.stringify(parsed2.open)).toContain("OPEN-ANSWER-A1");
    expect(JSON.stringify(parsed2.open)).not.toContain("PURCHASE-ANSWER-A1");
    expect(JSON.stringify(parsed2.purchase)).toContain("PURCHASE-ANSWER-A1");
    expect(JSON.stringify(parsed2.purchase)).not.toContain("OPEN-ANSWER-A1");
  });

  test("3. Reflection step on purchase has 5 rows; on open has 6 rows", async ({
    page,
  }) => {
    // Purchase: 5
    await page.goto(`${BASE}/session?arc=purchase`);
    await page.locator("#name-a").fill("Alex");
    await page.locator("#name-b").fill("Bea");
    await page.locator("#begin-btn").click();
    for (let i = 0; i < 4; i++) {
      await page.locator("#next-btn").click();
    }
    // On prompt 5 — Next should advance to reflection
    await page.locator("#next-btn").click();
    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    const purchaseRows = await page
      .locator("#reflection-list .reflection-row")
      .count();
    expect(purchaseRows).toBe(5);
    const reflectionText =
      (await page.locator("#step-reflection").textContent()) ?? "";
    for (const open of OPEN_PROMPTS) {
      expect(reflectionText).not.toContain(open);
    }

    // Open: 6
    await page.goto(`${BASE}/session?arc=open`);
    await page.locator("#name-a").fill("Cam");
    await page.locator("#name-b").fill("Dee");
    await page.locator("#begin-btn").click();
    for (let i = 0; i < 5; i++) {
      await page.locator("#next-btn").click();
    }
    await page.locator("#next-btn").click();
    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    const openRows = await page
      .locator("#reflection-list .reflection-row")
      .count();
    expect(openRows).toBe(6);
  });

  test("4. Print emulation: heading names the arc on screen and in print", async ({
    page,
  }) => {
    await page.goto(`${BASE}/session?arc=purchase`);
    await page.locator("#name-a").fill("Alex");
    await page.locator("#name-b").fill("Bea");
    await page.locator("#begin-btn").click();
    for (let i = 0; i < 5; i++) {
      if (i > 0) {
        await page.locator("#next-btn").click();
      }
      await page.locator("textarea").first().fill(`a${i + 1}`);
    }
    await page.locator("#next-btn").click(); // to reflection
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click(); // to summary
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
    const summaryHeading = await page.locator("#summary-heading").textContent();
    expect(summaryHeading).toContain("big-purchase");

    await page.emulateMedia({ media: "print" });
    const printHeader = page.locator(".print-only");
    await expect(printHeader).toBeVisible();
    const printText = (await printHeader.textContent()) ?? "";
    expect(printText).toContain("A big upcoming purchase");
  });

  test("5. Landing at 375px stacks arc cards, no horizontal scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(`${BASE}/`);
    const dims = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(dims.sw).toBeLessThanOrEqual(dims.cw + 1);
    await expect(page.locator(".arc-choice")).toHaveCount(2);
  });

  test("6. Network watch through both arcs end-to-end including print", async ({
    page,
  }) => {
    const requests: { method: string; url: string; postData: string | null }[] =
      [];
    page.on("request", (r) => {
      requests.push({
        method: r.method(),
        url: r.url(),
        postData: r.postData(),
      });
    });

    const sentinels: string[] = [];

    // Open arc
    await page.goto(`${BASE}/session?arc=open`);
    await page.evaluate(() => {
      window.print = () => {};
    });
    await page.locator("#name-a").fill("Alex");
    await page.locator("#name-b").fill("Bea");
    await page.locator("#begin-btn").click();
    for (let i = 0; i < 6; i++) {
      const sentinel = `OPEN-SENT-${i}`;
      sentinels.push(sentinel);
      await page.locator("textarea").first().fill(sentinel);
      await page.locator("#next-btn").click();
    }
    // Now on reflection; advance to summary
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    await page.locator("#print-btn").click();

    // Purchase arc
    await page.goto(`${BASE}/session?arc=purchase`);
    await page.evaluate(() => {
      window.print = () => {};
    });
    await page.locator("#name-a").fill("Cam");
    await page.locator("#name-b").fill("Dee");
    await page.locator("#begin-btn").click();
    for (let i = 0; i < 5; i++) {
      const sentinel = `PURCH-SENT-${i}`;
      sentinels.push(sentinel);
      await page.locator("textarea").first().fill(sentinel);
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    await page.locator("#print-btn").click();

    const nonGet = requests.filter((r) => r.method !== "GET");
    expect(nonGet).toEqual([]);
    for (const r of requests) {
      for (const s of sentinels) {
        expect(r.url).not.toContain(s);
        if (r.postData) {
          expect(r.postData).not.toContain(s);
        }
      }
    }
  });
});
