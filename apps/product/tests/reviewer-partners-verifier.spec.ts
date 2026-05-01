import { test, expect, type Page, type Request } from "@playwright/test";

// Independent Reviewer verifier for the 2-to-4 partner generalisation.
// Mirrors the partners-2-to-4 engineer suite but from a fresh angle:
//   1. Storage shape probe: only one top-level sessionStorage key
//      (`common-ground.session.v2`); per-arc slot has `partners` array,
//      `answers`/`tags`/`notes` arrays-of-arrays indexed
//      [promptIndex][partnerIndex], `takeaways` length-N array; and the
//      engineer-noted N=2 back-compat mirror fields `nameA`/`nameB`
//      coexist with the canonical `partners` array at N>=2.
//   2. N=4 print emulation on the *purchase* arc — heading meta line
//      shows four names joined with a single British "and" (no Oxford
//      comma), date in en-GB long form, on-screen chrome hidden,
//      print-only header visible, and no truncated names within the
//      printable A4 area at 794 CSS pixels.
//   3. Per-arc isolation across N change: walk the open arc to N=3
//      (with answers + tags), navigate back to landing, start the
//      purchase arc — purchase arc setup must be at N=2 with blank
//      names *and* no answers/tags/takeaways from open leak into
//      purchase storage.
//   4. Reflection at N=4 + 6 prompts on the open arc at 375px width —
//      the most likely place for a layout regression: 6 rows × 4
//      partners' tag controls. Asserts no horizontal scroll at every
//      reflection-step navigation point.

const NAMES_4 = ["Astrid", "Bram", "Carla", "Dev"] as const;
const LETTERS = ["a", "b", "c", "d"] as const;

type SessionRoot = Record<string, ArcSlot>;
type ArcSlot = {
  partnerCount: number;
  partners: Array<string>;
  answers: Array<Array<string>>;
  tags: Array<Array<boolean>>;
  notes: Array<Array<string>>;
  takeaways: Array<string>;
  summaryDate?: string;
  nameA?: string;
  nameB?: string;
  step?: string;
  promptIndex?: number;
};

function isWriteRequest(request: Request): boolean {
  const method = request.method().toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return false;
  }
  return true;
}

async function gotoSession(
  page: Page,
  arc: "open" | "purchase",
): Promise<void> {
  await page.goto(`/session?arc=${arc}`);
  await expect(page.locator("#step-setup")).toHaveAttribute(
    "data-active",
    "true",
  );
}

async function addPartnersTo(page: Page, count: number): Promise<void> {
  if (count < 2 || count > 4) {
    throw new Error(`count ${count} out of range`);
  }
  const addBtn = page.locator("#add-partner-btn");
  for (let i = 2; i < count; i++) {
    await addBtn.click();
  }
}

async function fillNames(
  page: Page,
  names: ReadonlyArray<string>,
): Promise<void> {
  for (let i = 0; i < names.length; i++) {
    await page.locator(`#name-${LETTERS[i]}`).fill(names[i]);
  }
}

async function readSession(page: Page): Promise<SessionRoot | null> {
  return await page.evaluate<SessionRoot | null>(() => {
    const raw = sessionStorage.getItem("common-ground.session.v2");
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw) as SessionRoot;
  });
}

test.describe("Reviewer — 2-to-4 partners (independent)", () => {
  test("storage shape: one top-level key, partners[] / answers[][] / tags[][] / notes[][] / takeaways[] of expected lengths, mirror nameA/nameB", async ({
    page,
  }) => {
    await gotoSession(page, "open");
    await addPartnersTo(page, 3);
    await fillNames(page, ["Astrid", "Bram", "Carla"]);
    await page.locator("#begin-btn").click();
    await expect(page.locator("#step-prompt")).toHaveAttribute(
      "data-active",
      "true",
    );
    // Fill the first prompt for partners 0 and 2 only — leaves partner
    // 1 blank to confirm the per-prompt array shape stores empty
    // strings at the partner index, not a sparse array.
    await page.locator("#answer-a").fill("astrid-says-A");
    await page.locator("#answer-c").fill("carla-says-A");
    await page.locator("#next-btn").click();

    const topLevelKeys = await page.evaluate<Array<string>>(() => {
      return Object.keys(sessionStorage);
    });
    expect(topLevelKeys).toEqual(["common-ground.session.v2"]);

    const root = await readSession(page);
    expect(root).not.toBeNull();
    if (root === null) {
      throw new Error("session root unexpectedly null");
    }
    const slot = root["open"];
    expect(slot).toBeTruthy();
    expect(slot.partnerCount).toBe(3);
    expect(slot.partners).toEqual(["Astrid", "Bram", "Carla"]);

    // partners array length matches partnerCount.
    expect(slot.partners.length).toBe(slot.partnerCount);

    // answers is array-of-arrays indexed [prompt][partner]. The open
    // arc has 6 prompts; each row is length-3 here.
    expect(Array.isArray(slot.answers)).toBe(true);
    expect(slot.answers.length).toBe(6);
    for (const row of slot.answers) {
      expect(Array.isArray(row)).toBe(true);
      expect(row.length).toBe(3);
    }
    expect(slot.answers[0][0]).toBe("astrid-says-A");
    expect(slot.answers[0][1]).toBe("");
    expect(slot.answers[0][2]).toBe("carla-says-A");

    // tags is [prompt][partner] booleans, length 6 × 3.
    expect(slot.tags.length).toBe(6);
    for (const row of slot.tags) {
      expect(row.length).toBe(3);
      for (const cell of row) {
        expect(typeof cell).toBe("boolean");
      }
    }

    // notes is [prompt][partner] strings, length 6 × 3.
    expect(slot.notes.length).toBe(6);
    for (const row of slot.notes) {
      expect(row.length).toBe(3);
      for (const cell of row) {
        expect(typeof cell).toBe("string");
      }
    }

    // takeaways is length-N array of strings.
    expect(Array.isArray(slot.takeaways)).toBe(true);
    expect(slot.takeaways.length).toBe(3);
    for (const cell of slot.takeaways) {
      expect(typeof cell).toBe("string");
    }

    // Mirror back-compat fields exist alongside the canonical array.
    expect(slot.nameA).toBe("Astrid");
    expect(slot.nameB).toBe("Bram");
  });

  test("per-arc isolation across N change: open at N=3 with answers/tags/takeaway → purchase starts fresh at N=2 with blank names and no leaked data", async ({
    page,
  }) => {
    await gotoSession(page, "open");
    await addPartnersTo(page, 3);
    await fillNames(page, ["Astrid", "Bram", "Carla"]);
    await page.locator("#begin-btn").click();

    // Walk all six open-arc prompts, filling some answers and tagging
    // a couple to make sure non-trivial data lands in storage.
    for (let i = 0; i < 6; i++) {
      if (i === 1) {
        await page.locator("#answer-a").fill(`open-A-${i}`);
        await page.locator("#answer-c").fill(`open-C-${i}`);
      }
      await page.locator("#next-btn").click();
    }
    // Reflection step: tag prompt 1 by Astrid.
    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    const tagToggle = page.locator(
      '#reflection-list .reflection-row[data-index="1"] .reflection-tag input[type="checkbox"]',
    );
    await tagToggle.first().check();
    await page.locator("#reflection-next-btn").click();

    await expect(page.locator("#step-takeaways")).toHaveAttribute(
      "data-active",
      "true",
    );
    await page.locator("#takeaway-a").fill("astrid-takes-this-forward");
    await page.locator("#takeaway-next-btn").click();

    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );

    // Now navigate back to landing and start the purchase arc cold.
    await page.goto("/");
    const purchaseCta = page.locator('[data-arc-cta="purchase"]');
    await purchaseCta.click();
    await expect(page).toHaveURL(/arc=purchase/);
    await expect(page.locator("#step-setup")).toHaveAttribute(
      "data-active",
      "true",
    );

    // Purchase arc must show two name rows by default and they must be
    // empty.
    const nameRows = page.locator("#partners-list .partner-row");
    await expect(nameRows).toHaveCount(2);
    await expect(page.locator("#name-a")).toHaveValue("");
    await expect(page.locator("#name-b")).toHaveValue("");

    // Storage probe: open slot retains its data; purchase slot is
    // either absent or, if initialised, has partnerCount === 2 with
    // empty partners[] entries and empty answers/tags/takeaways.
    const root = await readSession(page);
    expect(root).not.toBeNull();
    if (root === null) {
      throw new Error("session root unexpectedly null");
    }
    expect(root["open"]).toBeTruthy();
    expect(root["open"].partnerCount).toBe(3);
    expect(root["open"].takeaways[0]).toBe("astrid-takes-this-forward");
    expect(root["open"].tags[1].some((t) => t)).toBe(true);

    const purchase = root["purchase"];
    if (purchase !== undefined) {
      expect(purchase.partnerCount).toBe(2);
      expect(purchase.partners.every((p) => p === "")).toBe(true);
      // No answers from the open arc must appear here.
      const purchaseAnswerText = JSON.stringify(purchase.answers ?? []);
      expect(purchaseAnswerText).not.toContain("open-A-");
      expect(purchaseAnswerText).not.toContain("open-C-");
      // Takeaways for purchase must not echo the open-arc takeaway.
      const purchaseTakeawayText = JSON.stringify(purchase.takeaways ?? []);
      expect(purchaseTakeawayText).not.toContain(
        "astrid-takes-this-forward",
      );
    }
  });

  test("N=4 print emulation on the purchase arc: heading meta names use British conjunction; date is en-GB long form; chrome hidden", async ({
    page,
  }) => {
    await gotoSession(page, "purchase");
    await addPartnersTo(page, 4);
    await fillNames(page, [...NAMES_4]);
    await page.locator("#begin-btn").click();

    // Walk all five purchase prompts with one answer per partner on
    // prompt 0 only; the rest left blank.
    await page.locator("#answer-a").fill("a-purchase-0");
    await page.locator("#answer-b").fill("b-purchase-0");
    await page.locator("#answer-c").fill("c-purchase-0");
    await page.locator("#answer-d").fill("d-purchase-0");
    for (let i = 0; i < 5; i++) {
      await page.locator("#next-btn").click();
    }
    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-takeaways")).toHaveAttribute(
      "data-active",
      "true",
    );
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );

    // On screen the names line must already use British joining.
    const summaryNames = await page.locator("#summary-names").textContent();
    expect(summaryNames).toBe("Astrid, Bram, Carla and Dev");
    expect(summaryNames).not.toContain(", and ");

    // Switch to print media and assert the print-only header.
    await page.emulateMedia({ media: "print" });

    const printHeader = page.locator(".print-only");
    await expect(printHeader).toBeVisible();

    // The on-screen H1 ("Your big-purchase conversation") must remain
    // arc-named.
    const h1 = await page.locator("#summary-heading").textContent();
    expect((h1 ?? "").toLowerCase()).toContain("purchase");

    const printNames = await page.locator("#print-names").textContent();
    expect(printNames).toBe("Astrid, Bram, Carla and Dev");
    expect(printNames).not.toContain(", and ");

    // Date format en-GB long form: "1 May 2026" style.
    const printDate = await page.locator("#print-date").textContent();
    expect(printDate).toMatch(/\d{1,2}\s\w+\s\d{4}/);

    // On-screen chrome must be hidden under print media. We check that
    // each `.no-print` block has zero rendered height.
    const noPrintHeights = await page.locator(".no-print").evaluateAll(
      (els) =>
        els.map((el) => (el as HTMLElement).getBoundingClientRect().height),
    );
    for (const h of noPrintHeights) {
      expect(h).toBe(0);
    }

    // Force an A4 width (210mm at 96dpi ≈ 794 CSS px) and check no
    // horizontal overflow on the printed summary content.
    await page.setViewportSize({ width: 794, height: 1123 });
    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        scroll: root.scrollWidth,
        client: root.clientWidth,
      };
    });
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1);

    // None of the four print summary partner names should be visually
    // truncated. The first prompt block has all four .summary-block
    // headings; assert each contains exactly one of the four names.
    const firstBlockHeadings = await page
      .locator('#summary-list .summary-prompt')
      .first()
      .locator('.summary-block h3')
      .allTextContents();
    expect(firstBlockHeadings).toEqual([
      "Astrid",
      "Bram",
      "Carla",
      "Dev",
    ]);
  });

  test("reflection at N=4 with 6 prompt rows fits 375px width without horizontal scroll, with no non-GET requests on the way", async ({
    page,
  }) => {
    const writeReqs: Array<string> = [];
    page.on("request", (req) => {
      if (isWriteRequest(req)) {
        writeReqs.push(`${req.method()} ${req.url()}`);
      }
    });
    await page.setViewportSize({ width: 375, height: 720 });

    await gotoSession(page, "open");
    await addPartnersTo(page, 4);
    await fillNames(page, [...NAMES_4]);

    // Setup at 375px N=4: no horizontal scroll.
    let metrics = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(metrics.scroll).toBeLessThanOrEqual(metrics.client + 1);

    await page.locator("#begin-btn").click();

    // Walk through six prompts; check 375px width holds at each.
    for (let i = 0; i < 6; i++) {
      metrics = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      expect(metrics.scroll).toBeLessThanOrEqual(metrics.client + 1);
      await page.locator("#next-btn").click();
    }

    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );

    metrics = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(metrics.scroll).toBeLessThanOrEqual(metrics.client + 1);

    // Tag the third prompt's row by partners 1 and 3 (b and d) and
    // confirm width still holds — note input on those partners now
    // visible.
    const rowChecks = page.locator(
      '#reflection-list .reflection-row[data-index="2"] .reflection-tag input[type="checkbox"]',
    );
    await rowChecks.nth(1).check();
    await rowChecks.nth(3).check();

    metrics = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(metrics.scroll).toBeLessThanOrEqual(metrics.client + 1);

    // Scroll the reflection list to the bottom and check again — six
    // rows × four partners is the densest layout in the app.
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    metrics = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(metrics.scroll).toBeLessThanOrEqual(metrics.client + 1);

    expect(writeReqs).toEqual([]);
  });
});
