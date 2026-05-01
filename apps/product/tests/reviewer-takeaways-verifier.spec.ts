/**
 * Independent reviewer verifier for the take-aways slice.
 * Run against the deployed URL — does not trust engineer claims.
 */
import { test, expect } from "@playwright/test";

const NAME_A = "Reviewer-A";
const NAME_B = "Reviewer-B";

test.describe("Reviewer — take-aways slice (independent)", () => {
  test("session storage shape: only common-ground.session.v2, with takeaways {a,b}", async ({
    page,
  }) => {
    await page.goto("/session?arc=open");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    // Walk through all six prompts.
    for (let i = 0; i < 6; i++) {
      await page.locator("#next-btn").click();
    }
    // Skip reflection.
    await page.locator("#reflection-next-btn").click();
    // On take-aways step: enter a thought.
    await page.locator("#takeaway-a").fill("Independent A take-away");
    await page.locator("#takeaway-b").fill("Independent B take-away");
    // Inspect sessionStorage keys before advancing.
    const keys = await page.evaluate(() => {
      return Object.keys(sessionStorage);
    });
    expect(keys).toEqual(["common-ground.session.v2"]);
    const raw = await page.evaluate(() =>
      sessionStorage.getItem("common-ground.session.v2"),
    );
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw ?? "{}");
    // Per-arc shape: open arc carries a takeaways array, indexed by
    // partner. Two partners by default → length-2 array. The N-partner
    // generalisation (DoD 2026-05-01 07:15) replaced the legacy {a,b}
    // object shape with an array.
    expect(parsed.open).toBeDefined();
    expect(parsed.open.takeaways).toBeDefined();
    expect(parsed.open.takeaways).toEqual([
      "Independent A take-away",
      "Independent B take-away",
    ]);
    // No top-level takeaways key.
    expect(parsed.takeaways).toBeUndefined();
  });

  test("per-arc isolation: enter take-aways on open, leave to landing, start purchase — inputs empty", async ({
    page,
  }) => {
    await page.goto("/session?arc=open");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    for (let i = 0; i < 6; i++) {
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-a").fill("Open-arc only");
    await page.locator("#takeaway-b").fill("Open-arc only B");
    // Navigate to landing, then start the purchase arc fresh.
    await page.goto("/");
    await page.goto("/session?arc=purchase");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    // Walk through five prompts on the purchase arc.
    for (let i = 0; i < 5; i++) {
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-takeaways")).toHaveAttribute(
      "data-active",
      "true",
    );
    // Inputs must be empty.
    await expect(page.locator("#takeaway-a")).toHaveValue("");
    await expect(page.locator("#takeaway-b")).toHaveValue("");
  });

  test("inputs are <input type='text'> with no example placeholder", async ({
    page,
  }) => {
    await page.goto("/session?arc=open");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    for (let i = 0; i < 6; i++) {
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    const aInput = page.locator("#takeaway-a");
    const bInput = page.locator("#takeaway-b");
    await expect(aInput).toHaveAttribute("type", "text");
    await expect(bInput).toHaveAttribute("type", "text");
    const aPlaceholder = await aInput.getAttribute("placeholder");
    const bPlaceholder = await bInput.getAttribute("placeholder");
    expect(aPlaceholder ?? "").toBe("");
    expect(bPlaceholder ?? "").toBe("");
    // No textarea.
    expect(await aInput.evaluate((e) => e.tagName)).toBe("INPUT");
    expect(await bInput.evaluate((e) => e.tagName)).toBe("INPUT");
  });

  test("heading is an open question and helper line states skipping is fine", async ({
    page,
  }) => {
    await page.goto("/session?arc=open");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    for (let i = 0; i < 6; i++) {
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    const heading = page.locator("#takeaways-heading");
    const headingText = (await heading.textContent()) ?? "";
    // Open question, ends with a question mark.
    expect(headingText.trim()).toMatch(/\?$/);
    // No directive verbs.
    expect(headingText.toLowerCase()).not.toContain("decide on");
    expect(headingText.toLowerCase()).not.toContain("commit to");
    expect(headingText.toLowerCase()).not.toContain("action items");
    expect(headingText.toLowerCase()).not.toContain("next steps");
    // Helper line says skipping is fine.
    const helper = page.locator("#step-takeaways .reflection-intro");
    const helperText = (await helper.textContent()) ?? "";
    expect(helperText.toLowerCase()).toContain("skip");
    // No anchoring example list ("e.g.", "for example", "such as").
    expect(helperText.toLowerCase()).not.toContain("e.g.");
    expect(helperText.toLowerCase()).not.toContain("for example");
    expect(helperText.toLowerCase()).not.toContain("such as");
  });

  test("partner labels reflect setup names", async ({ page }) => {
    await page.goto("/session?arc=purchase");
    await page.locator("#name-a").fill("Astrid");
    await page.locator("#name-b").fill("Bram");
    await page.locator("#begin-btn").click();
    for (let i = 0; i < 5; i++) {
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#takeaway-label-a")).toHaveText("Astrid");
    await expect(page.locator("#takeaway-label-b")).toHaveText("Bram");
  });

  test("print path: ordering on both arcs is revisit → take-aways → prompt list", async ({
    page,
  }) => {
    // Open arc.
    await page.goto("/session?arc=open");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    for (let i = 0; i < 6; i++) {
      await page.locator("#next-btn").click();
    }
    // Tag the first prompt so revisit section also renders.
    const firstRow = page.locator("#reflection-list .reflection-row").first();
    await firstRow.locator('input[data-tag-input="a"]').check();
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-a").fill("Forward thought A");
    await page.locator("#takeaway-b").fill("Forward thought B");
    await page.locator("#takeaway-next-btn").click();
    await page.emulateMedia({ media: "print" });
    const orderOpen = await page.evaluate(() => {
      const summary = document.getElementById("step-summary");
      if (!summary) {
        return null;
      }
      const elements = ["#revisit-section", "#takeaways-section", "#summary-list"].map(
        (sel) => summary.querySelector(sel),
      );
      const all = Array.from(summary.querySelectorAll("*"));
      return elements.map((el) => (el ? all.indexOf(el as Element) : -1));
    });
    expect(orderOpen).not.toBeNull();
    if (orderOpen) {
      expect(orderOpen[0]).toBeGreaterThanOrEqual(0);
      expect(orderOpen[1]).toBeGreaterThan(orderOpen[0]);
      expect(orderOpen[2]).toBeGreaterThan(orderOpen[1]);
    }
    // Print heading names the open arc.
    const printHeadingOpen = await page
      .locator("#step-summary .print-only h1")
      .textContent();
    expect((printHeadingOpen ?? "").toLowerCase()).toContain("open");

    // Reset media and run the purchase arc.
    await page.emulateMedia({ media: "screen" });
    await page.goto("/session?arc=purchase");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    for (let i = 0; i < 5; i++) {
      await page.locator("#next-btn").click();
    }
    const firstRowP = page.locator("#reflection-list .reflection-row").first();
    await firstRowP.locator('input[data-tag-input="a"]').check();
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-a").fill("Purchase forward A");
    await page.locator("#takeaway-b").fill("Purchase forward B");
    await page.locator("#takeaway-next-btn").click();
    await page.emulateMedia({ media: "print" });
    const orderPurchase = await page.evaluate(() => {
      const summary = document.getElementById("step-summary");
      if (!summary) {
        return null;
      }
      const elements = ["#revisit-section", "#takeaways-section", "#summary-list"].map(
        (sel) => summary.querySelector(sel),
      );
      const all = Array.from(summary.querySelectorAll("*"));
      return elements.map((el) => (el ? all.indexOf(el as Element) : -1));
    });
    expect(orderPurchase).not.toBeNull();
    if (orderPurchase) {
      expect(orderPurchase[0]).toBeGreaterThanOrEqual(0);
      expect(orderPurchase[1]).toBeGreaterThan(orderPurchase[0]);
      expect(orderPurchase[2]).toBeGreaterThan(orderPurchase[1]);
    }
    const printHeadingPurchase = await page
      .locator("#step-summary .print-only h1")
      .textContent();
    expect((printHeadingPurchase ?? "").toLowerCase()).toContain("purchase");
  });

  test("network watch on full purchase-arc flow + print click: zero non-GET", async ({
    page,
  }) => {
    const nonGet: string[] = [];
    page.on("request", (req) => {
      if (req.method() !== "GET") {
        nonGet.push(`${req.method()} ${req.url()}`);
      }
    });
    await page.goto("/session?arc=purchase");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    for (let i = 0; i < 5; i++) {
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-a").fill("Network watch A");
    await page.locator("#takeaway-b").fill("Network watch B");
    await page.locator("#takeaway-next-btn").click();
    // Click Save as PDF — but stub print to avoid real dialogue.
    await page.evaluate(() => {
      window.print = () => {
        /* stub */
      };
    });
    await page.locator("#print-btn").click();
    expect(nonGet).toEqual([]);
  });
});
