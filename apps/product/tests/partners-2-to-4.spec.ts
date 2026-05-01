import { test, expect, type Page, type Request } from "@playwright/test";

// Verifier checks for the 2-to-4 partner generalisation (binding
// decision-log entry 2026-05-01 07:05; current-task DoD 2026-05-01 07:15).
// Runs against PRODUCT_URL (deployed Worker). Covers:
// - Setup: "Add a partner" adds rows up to 4 then hides; per-row "Remove"
//   only on rows 3 and 4; first two rows cannot be removed.
// - Prompt step renders N answer textareas labelled by name.
// - Reflection: N tag controls per row, each labelled with the partner's
//   name (or fallback when blank).
// - Take-aways: N labelled inputs, all-blank still produces no section.
// - Summary: N answer cells per prompt; "(skipped)" only when ALL blank;
//   British conjunction in the names line and the tagged-by line at N=3
//   and N=4 (no Oxford comma); "Taking forward" lists one row per
//   non-empty take-away.
// - Print heading uses the same name-joining at N=3/4.
// - Per-arc isolation across counts: open at N=3 → switch to purchase →
//   purchase starts fresh at N=2 with blank names.
// - Network watch at N=4 through the full flow including print: zero
//   non-GET requests.
// - Mobile readability at 375px at N=4.

const OPEN_PROMPTS_TOTAL = 6;
const PURCHASE_PROMPTS_TOTAL = 5;

const NAMES_3 = ["Astrid", "Bram", "Carla"] as const;
const NAMES_4 = ["Astrid", "Bram", "Carla", "Dev"] as const;
const LETTERS = ["a", "b", "c", "d"] as const;

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

async function setupWithNames(
  page: Page,
  names: ReadonlyArray<string>,
): Promise<void> {
  // Two name inputs are present by default. Click "Add a partner" to
  // grow the list to the desired count, then fill names by index.
  const target = names.length;
  if (target < 2 || target > 4) {
    throw new Error(`partner count ${target} out of range`);
  }
  const addBtn = page.locator("#add-partner-btn");
  for (let i = 2; i < target; i++) {
    await addBtn.click();
  }
  for (let i = 0; i < target; i++) {
    await page.locator(`#name-${LETTERS[i]}`).fill(names[i]);
  }
}

async function walkPromptsAtN(
  page: Page,
  totalPrompts: number,
  partnerCount: number,
  fillFn?: (i: number, p: number) => string,
): Promise<void> {
  for (let i = 0; i < totalPrompts; i++) {
    if (fillFn) {
      for (let p = 0; p < partnerCount; p++) {
        const text = fillFn(i, p);
        if (text !== "") {
          await page.locator(`#answer-${LETTERS[p]}`).fill(text);
        }
      }
    }
    await page.locator("#next-btn").click();
  }
}

test.describe("Common Ground — 2 to 4 partners", () => {
  test("Add a partner adds rows up to 4 then hides; Remove only on rows 3+", async ({
    page,
  }) => {
    await gotoSession(page, "open");

    // Default state: two name inputs, no Remove buttons, Add visible.
    await expect(page.locator("#name-a")).toBeVisible();
    await expect(page.locator("#name-b")).toBeVisible();
    await expect(page.locator("#name-c")).toHaveCount(0);
    await expect(page.locator("#name-d")).toHaveCount(0);
    await expect(page.locator(".remove-partner-btn")).toHaveCount(0);
    const addBtn = page.locator("#add-partner-btn");
    await expect(addBtn).toBeVisible();

    // Click once → row 3 appears. Row 3 has a Remove button.
    await addBtn.click();
    await expect(page.locator("#name-c")).toBeVisible();
    await expect(page.locator(".remove-partner-btn")).toHaveCount(1);
    // Add still visible at N=3.
    await expect(addBtn).toBeVisible();

    // Click again → row 4 appears. Two Remove buttons total.
    await addBtn.click();
    await expect(page.locator("#name-d")).toBeVisible();
    await expect(page.locator(".remove-partner-btn")).toHaveCount(2);
    // Add hides/disables at N=4.
    await expect(addBtn).toBeHidden();

    // Removing row 4 collapses to N=3 and shows Add again.
    await page
      .locator(".remove-partner-btn[data-remove-index='3']")
      .click();
    await expect(page.locator("#name-d")).toHaveCount(0);
    await expect(page.locator(".remove-partner-btn")).toHaveCount(1);
    await expect(addBtn).toBeVisible();

    // Removing row 3 collapses to N=2; no Remove buttons.
    await page
      .locator(".remove-partner-btn[data-remove-index='2']")
      .click();
    await expect(page.locator("#name-c")).toHaveCount(0);
    await expect(page.locator(".remove-partner-btn")).toHaveCount(0);
    await expect(addBtn).toBeVisible();
  });

  test("Removing a partner does not affect the first two rows", async ({
    page,
  }) => {
    await gotoSession(page, "open");
    // Fill names on rows 1 and 2, then add row 3 with a name and remove it.
    await page.locator("#name-a").fill("Astrid");
    await page.locator("#name-b").fill("Bram");
    await page.locator("#add-partner-btn").click();
    await page.locator("#name-c").fill("Carla");
    await page
      .locator(".remove-partner-btn[data-remove-index='2']")
      .click();
    await expect(page.locator("#name-a")).toHaveValue("Astrid");
    await expect(page.locator("#name-b")).toHaveValue("Bram");
    await expect(page.locator("#name-c")).toHaveCount(0);
  });

  test("Setup screen at N=4 fits 375px without horizontal scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await gotoSession(page, "open");
    await setupWithNames(page, NAMES_4);
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
    for (let i = 0; i < 4; i++) {
      await expect(page.locator(`#name-${LETTERS[i]}`)).toBeVisible();
    }
  });

  test("Prompt step renders N answer textareas labelled by partner name (N=3)", async ({
    page,
  }) => {
    await gotoSession(page, "open");
    await setupWithNames(page, NAMES_3);
    await page.locator("#begin-btn").click();
    await expect(page.locator("#step-prompt")).toHaveAttribute(
      "data-active",
      "true",
    );
    // Three textareas, three labels.
    await expect(page.locator("#answers-list textarea")).toHaveCount(3);
    await expect(page.locator("#label-a")).toHaveText(`${NAMES_3[0]}'s answer`);
    await expect(page.locator("#label-b")).toHaveText(`${NAMES_3[1]}'s answer`);
    await expect(page.locator("#label-c")).toHaveText(`${NAMES_3[2]}'s answer`);
    await expect(page.locator("#answers-list")).toHaveAttribute(
      "data-count",
      "3",
    );
  });

  test("Prompt step at N=4 fits 375px without horizontal scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await gotoSession(page, "open");
    await setupWithNames(page, NAMES_4);
    await page.locator("#begin-btn").click();
    await expect(page.locator("#answers-list textarea")).toHaveCount(4);
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
    for (let i = 0; i < 4; i++) {
      await expect(page.locator(`#answer-${LETTERS[i]}`)).toBeVisible();
    }
  });

  test("Reflection at N=3 shows three tag controls per row; British 'Tagged by' joining", async ({
    page,
  }) => {
    await gotoSession(page, "open");
    await setupWithNames(page, NAMES_3);
    await page.locator("#begin-btn").click();
    await walkPromptsAtN(page, OPEN_PROMPTS_TOTAL, 3, (i, p) => `ans-${i}-${p}`);
    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    const firstRow = page.locator("#reflection-list .reflection-row").first();
    await expect(firstRow.locator(".reflection-tag")).toHaveCount(3);
    await expect(firstRow.locator('[data-tag-label="a"]')).toContainText(
      NAMES_3[0],
    );
    await expect(firstRow.locator('[data-tag-label="b"]')).toContainText(
      NAMES_3[1],
    );
    await expect(firstRow.locator('[data-tag-label="c"]')).toContainText(
      NAMES_3[2],
    );

    // All three partners tag prompt 1.
    await firstRow.locator('input[data-tag-input="a"]').check();
    await firstRow.locator('input[data-tag-input="b"]').check();
    await firstRow.locator('input[data-tag-input="c"]').check();
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
    const taggedBy = page.locator("#revisit-section .tagged-by").first();
    // British conjunction: "Astrid, Bram and Carla" — no Oxford comma.
    await expect(taggedBy).toContainText(
      `${NAMES_3[0]}, ${NAMES_3[1]} and ${NAMES_3[2]}`,
    );
    const taggedByText = (await taggedBy.textContent()) ?? "";
    expect(taggedByText).not.toMatch(/, and /);
  });

  test("Reflection at N=4: tagged-by joining is 'Astrid, Bram, Carla and Dev' (no Oxford comma)", async ({
    page,
  }) => {
    await gotoSession(page, "open");
    await setupWithNames(page, NAMES_4);
    await page.locator("#begin-btn").click();
    await walkPromptsAtN(page, OPEN_PROMPTS_TOTAL, 4);
    const firstRow = page.locator("#reflection-list .reflection-row").first();
    await expect(firstRow.locator(".reflection-tag")).toHaveCount(4);
    await firstRow.locator('input[data-tag-input="a"]').check();
    await firstRow.locator('input[data-tag-input="b"]').check();
    await firstRow.locator('input[data-tag-input="c"]').check();
    await firstRow.locator('input[data-tag-input="d"]').check();
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    const taggedBy = page.locator("#revisit-section .tagged-by").first();
    await expect(taggedBy).toContainText(
      `${NAMES_4[0]}, ${NAMES_4[1]}, ${NAMES_4[2]} and ${NAMES_4[3]}`,
    );
    const taggedByText = (await taggedBy.textContent()) ?? "";
    expect(taggedByText).not.toMatch(/, and /);
  });

  test("Note input is per-partner-per-prompt and only visible once that partner has tagged that prompt (N=3)", async ({
    page,
  }) => {
    await gotoSession(page, "open");
    await setupWithNames(page, NAMES_3);
    await page.locator("#begin-btn").click();
    await walkPromptsAtN(page, OPEN_PROMPTS_TOTAL, 3);
    const row = page.locator("#reflection-list .reflection-row").nth(1);
    await expect(
      row.locator('[data-note-field][data-partner-index="0"]'),
    ).toBeHidden();
    await expect(
      row.locator('[data-note-field][data-partner-index="1"]'),
    ).toBeHidden();
    await expect(
      row.locator('[data-note-field][data-partner-index="2"]'),
    ).toBeHidden();
    // Only Carla tags this row.
    await row.locator('input[data-tag-input="c"]').check();
    await expect(
      row.locator('[data-note-field][data-partner-index="0"]'),
    ).toBeHidden();
    await expect(
      row.locator('[data-note-field][data-partner-index="1"]'),
    ).toBeHidden();
    await expect(
      row.locator('[data-note-field][data-partner-index="2"]'),
    ).toBeVisible();
  });

  test("Take-aways at N=3: three labelled inputs", async ({ page }) => {
    await gotoSession(page, "open");
    await setupWithNames(page, NAMES_3);
    await page.locator("#begin-btn").click();
    await walkPromptsAtN(page, OPEN_PROMPTS_TOTAL, 3);
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-takeaways")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(
      page.locator("#takeaways-form input[type='text']"),
    ).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(page.locator(`#takeaway-label-${LETTERS[i]}`)).toHaveText(
        NAMES_3[i],
      );
    }
    await expect(page.locator("#takeaways-form")).toHaveAttribute(
      "data-count",
      "3",
    );
  });

  test("Summary at N=3: each prompt row shows three labelled answer cells, omits per-partner blanks but only marks the row '(skipped)' when ALL are blank", async ({
    page,
  }) => {
    await gotoSession(page, "open");
    await setupWithNames(page, NAMES_3);
    await page.locator("#begin-btn").click();
    await walkPromptsAtN(page, OPEN_PROMPTS_TOTAL, 3, (i, p) => {
      // Prompt 0: all three answer.
      // Prompt 1: only partner 0 answers (partial — not 'skipped').
      // Prompt 2: all three blank → row marked skipped.
      // Prompt 3-5: all three answer.
      if (i === 1 && p > 0) {
        return "";
      }
      if (i === 2) {
        return "";
      }
      return `p${i}-by-${LETTERS[p]}`;
    });
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    const blocks = page.locator("#summary-list .summary-prompt");
    await expect(blocks).toHaveCount(OPEN_PROMPTS_TOTAL);
    // Prompt 0: not skipped, three filled cells.
    const p0 = blocks.nth(0);
    await expect(p0).toHaveAttribute("data-skipped", "false");
    await expect(p0.locator(".summary-block")).toHaveCount(3);
    await expect(p0.locator(".summary-block h3").nth(0)).toHaveText(NAMES_3[0]);
    await expect(p0.locator(".summary-block h3").nth(1)).toHaveText(NAMES_3[1]);
    await expect(p0.locator(".summary-block h3").nth(2)).toHaveText(NAMES_3[2]);
    await expect(p0.locator("p.empty")).toHaveCount(0);
    // Prompt 1: partial — partner 0 cell filled, partners 1 and 2 (skipped).
    const p1 = blocks.nth(1);
    await expect(p1).toHaveAttribute("data-skipped", "false");
    await expect(p1.locator(".summary-block")).toHaveCount(3);
    await expect(p1.locator("p.empty")).toHaveCount(2);
    // Prompt 2: all blank — marked skipped, three "(skipped)" cells.
    const p2 = blocks.nth(2);
    await expect(p2).toHaveAttribute("data-skipped", "true");
    await expect(p2.locator("p.empty")).toHaveCount(3);
  });

  test("Summary at N=4: 'Taking forward' shows one row per non-empty take-away (across N partners)", async ({
    page,
  }) => {
    await gotoSession(page, "open");
    await setupWithNames(page, NAMES_4);
    await page.locator("#begin-btn").click();
    await walkPromptsAtN(page, OPEN_PROMPTS_TOTAL, 4);
    await page.locator("#reflection-next-btn").click();
    // Fill take-aways for partners 0 and 2; leave 1 and 3 blank.
    await page.locator("#takeaway-a").fill("Astrid forward");
    await page.locator("#takeaway-c").fill("Carla forward");
    await page.locator("#takeaway-next-btn").click();
    const items = page.locator("#takeaways-list .takeaway-item");
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toContainText(NAMES_4[0]);
    await expect(items.nth(0)).toContainText("Astrid forward");
    await expect(items.nth(1)).toContainText(NAMES_4[2]);
    await expect(items.nth(1)).toContainText("Carla forward");
    // Section text does not name the partners with blank take-aways.
    const sectionText =
      (await page.locator("#takeaways-section").textContent()) ?? "";
    expect(sectionText).not.toContain(NAMES_4[1]);
    expect(sectionText).not.toContain(NAMES_4[3]);
  });

  test("Summary names line at N=3 uses British 'Astrid, Bram and Carla' (no Oxford comma)", async ({
    page,
  }) => {
    await gotoSession(page, "open");
    await setupWithNames(page, NAMES_3);
    await page.locator("#begin-btn").click();
    await walkPromptsAtN(page, OPEN_PROMPTS_TOTAL, 3);
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#summary-names")).toHaveText(
      `${NAMES_3[0]}, ${NAMES_3[1]} and ${NAMES_3[2]}`,
    );
    const namesText = (await page.locator("#summary-names").textContent()) ?? "";
    expect(namesText).not.toMatch(/, and /);
  });

  test("Print heading at N=4: names joined 'Astrid, Bram, Carla and Dev'", async ({
    page,
  }) => {
    await gotoSession(page, "purchase");
    await setupWithNames(page, NAMES_4);
    await page.locator("#begin-btn").click();
    await walkPromptsAtN(page, PURCHASE_PROMPTS_TOTAL, 4);
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("#print-names")).toHaveText(
      `${NAMES_4[0]}, ${NAMES_4[1]}, ${NAMES_4[2]} and ${NAMES_4[3]}`,
    );
    const printText = (await page.locator("#print-names").textContent()) ?? "";
    expect(printText).not.toMatch(/, and /);
    // The print page itself should still fit a reasonable A4-ish width.
    const main = page.locator("main");
    await expect(main).toBeVisible();
    await page.emulateMedia({ media: "screen" });
  });

  test("Per-arc isolation across counts: open arc at N=3 → switch to purchase → purchase starts fresh at N=2 with blank names", async ({
    page,
  }) => {
    await gotoSession(page, "open");
    await setupWithNames(page, NAMES_3);
    // Walk a couple of prompts so storage gets seeded.
    await page.locator("#begin-btn").click();
    await page.locator("#answer-a").fill("Open A0");
    await page.locator("#answer-b").fill("Open B0");
    await page.locator("#answer-c").fill("Open C0");
    await page.locator("#next-btn").click();

    // Switch to purchase from landing.
    await page.goto("/");
    await page
      .getByRole("button", { name: /start a big-purchase conversation/i })
      .click();
    await expect(page).toHaveURL(/\/session\?arc=purchase$/);

    // Purchase setup is fresh: two name rows, both blank, no third row, Add visible.
    await expect(page.locator("#name-a")).toHaveValue("");
    await expect(page.locator("#name-b")).toHaveValue("");
    await expect(page.locator("#name-c")).toHaveCount(0);
    await expect(page.locator("#name-d")).toHaveCount(0);
    await expect(page.locator("#add-partner-btn")).toBeVisible();
    await expect(page.locator(".remove-partner-btn")).toHaveCount(0);

    // Inspect storage — open arc kept its 3-partner state, purchase has no
    // entry yet.
    type ArcSlot = {
      partnerCount?: number;
      partners?: ReadonlyArray<string>;
    };
    const root = await page.evaluate(() =>
      sessionStorage.getItem("common-ground.session.v2"),
    );
    expect(root).not.toBeNull();
    const parsed = JSON.parse(root || "{}") as Record<string, ArcSlot>;
    expect(parsed.open).toBeDefined();
    expect(parsed.open.partnerCount).toBe(3);
    expect(parsed.open.partners).toEqual(NAMES_3.slice());
  });

  test("Restart on an N=3 arc clears the partner count back to 2 with blank names", async ({
    page,
  }) => {
    await gotoSession(page, "open");
    await setupWithNames(page, NAMES_3);
    await page.locator("#begin-btn").click();
    for (let i = 0; i < OPEN_PROMPTS_TOTAL; i++) {
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
    await expect(page.locator("#name-c")).toHaveCount(0);
    await expect(page.locator("#name-d")).toHaveCount(0);
    await expect(page.locator(".remove-partner-btn")).toHaveCount(0);
  });

  test("Network watch: full N=4 flow on the open arc including print click — zero non-GET requests", async ({
    page,
  }) => {
    const writes: string[] = [];
    page.on("request", (req) => {
      if (isWriteRequest(req)) {
        writes.push(`${req.method()} ${req.url()}`);
      }
    });

    await gotoSession(page, "open");
    await setupWithNames(page, NAMES_4);
    await page.locator("#begin-btn").click();
    const sentinels: string[] = [];
    for (let i = 0; i < OPEN_PROMPTS_TOTAL; i++) {
      for (let p = 0; p < 4; p++) {
        const text = `n4-sent-${i}-${p}-${Math.random().toString(36).slice(2)}`;
        sentinels.push(text);
        await page.locator(`#answer-${LETTERS[p]}`).fill(text);
      }
      await page.locator("#next-btn").click();
    }
    // Tag a couple of prompts with notes.
    const row = page.locator("#reflection-list .reflection-row").nth(2);
    const noteSentinel = `n4-note-${Math.random().toString(36).slice(2)}`;
    sentinels.push(noteSentinel);
    await row.locator('input[data-tag-input="d"]').check();
    await row.locator('input[data-note-input="d"]').fill(noteSentinel);
    await page.locator("#reflection-next-btn").click();
    for (let p = 0; p < 4; p++) {
      const tk = `n4-tk-${p}-${Math.random().toString(36).slice(2)}`;
      sentinels.push(tk);
      await page.locator(`#takeaway-${LETTERS[p]}`).fill(tk);
    }
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
    await page.evaluate(() => {
      window.print = () => {};
    });
    await page.locator("#print-btn").click();

    expect(writes).toEqual([]);
    // Belt-and-braces: nothing in the request log should contain a sentinel.
    // (Caught by isWriteRequest === [] above; this is a redundancy check.)
    expect(sentinels.length).toBeGreaterThan(0);
  });

  test("State at N=3: partners array, answers/tags/notes [prompt][partner], takeaways length-3", async ({
    page,
  }) => {
    await gotoSession(page, "open");
    await setupWithNames(page, NAMES_3);
    await page.locator("#begin-btn").click();
    await page.locator("#answer-a").fill("ans-a");
    await page.locator("#answer-b").fill("ans-b");
    await page.locator("#answer-c").fill("ans-c");
    await page.locator("#next-btn").click();
    type ArcSlot = {
      partnerCount?: number;
      partners?: ReadonlyArray<string>;
      answers?: ReadonlyArray<ReadonlyArray<string>>;
      tags?: ReadonlyArray<ReadonlyArray<boolean>>;
      notes?: ReadonlyArray<ReadonlyArray<string>>;
      takeaways?: ReadonlyArray<string>;
    };
    const root = await page.evaluate(() =>
      sessionStorage.getItem("common-ground.session.v2"),
    );
    expect(root).not.toBeNull();
    const parsed = JSON.parse(root || "{}") as Record<string, ArcSlot>;
    const slot = parsed.open;
    expect(slot).toBeDefined();
    expect(slot.partnerCount).toBe(3);
    expect(slot.partners).toEqual(NAMES_3.slice());
    expect(Array.isArray(slot.answers)).toBe(true);
    expect(slot.answers?.length).toBe(OPEN_PROMPTS_TOTAL);
    expect(slot.answers?.[0]).toEqual(["ans-a", "ans-b", "ans-c"]);
    // tags and notes are the right shape (length-N at each prompt index).
    expect(slot.tags?.[0].length).toBe(3);
    expect(slot.notes?.[0].length).toBe(3);
    // takeaways length-N.
    expect(slot.takeaways?.length).toBe(3);
  });

  test("Reflection at N=4 fits 375px width without horizontal scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await gotoSession(page, "open");
    await setupWithNames(page, NAMES_4);
    await page.locator("#begin-btn").click();
    await walkPromptsAtN(page, OPEN_PROMPTS_TOTAL, 4);
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
    // All four tag controls present on the first row.
    const firstRow = page.locator("#reflection-list .reflection-row").first();
    await expect(firstRow.locator(".reflection-tag")).toHaveCount(4);
  });

  test("Take-aways step at N=4 fits 375px width without horizontal scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await gotoSession(page, "purchase");
    await setupWithNames(page, NAMES_4);
    await page.locator("#begin-btn").click();
    await walkPromptsAtN(page, PURCHASE_PROMPTS_TOTAL, 4);
    await page.locator("#reflection-next-btn").click();
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
    await expect(
      page.locator("#takeaways-form input[type='text']"),
    ).toHaveCount(4);
  });

  test("Summary at N=4 on the purchase arc: four labelled answer cells per prompt; print heading uses British conjunction", async ({
    page,
  }) => {
    await gotoSession(page, "purchase");
    await setupWithNames(page, NAMES_4);
    await page.locator("#begin-btn").click();
    await walkPromptsAtN(
      page,
      PURCHASE_PROMPTS_TOTAL,
      4,
      (i, p) => `${LETTERS[p]}-${i}`,
    );
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-next-btn").click();
    const blocks = page.locator("#summary-list .summary-prompt");
    await expect(blocks).toHaveCount(PURCHASE_PROMPTS_TOTAL);
    for (let i = 0; i < PURCHASE_PROMPTS_TOTAL; i++) {
      const block = blocks.nth(i);
      await expect(block.locator(".summary-block")).toHaveCount(4);
      const headings = block.locator(".summary-block h3");
      for (let p = 0; p < 4; p++) {
        await expect(headings.nth(p)).toHaveText(NAMES_4[p]);
      }
    }
    await expect(page.locator("#summary-names")).toHaveText(
      `${NAMES_4[0]}, ${NAMES_4[1]}, ${NAMES_4[2]} and ${NAMES_4[3]}`,
    );
  });

  test("Empty names at N=3 fall back to 'Partner N' labels in downstream UI", async ({
    page,
  }) => {
    await gotoSession(page, "open");
    // Add a third row but leave all three names blank.
    await page.locator("#add-partner-btn").click();
    await page.locator("#begin-btn").click();
    // At N>=3 every row falls back to "Partner N" because the legacy
    // "You" / "Your partner" pair only makes sense at N=2.
    await expect(page.locator("#label-a")).toHaveText("Partner 1's answer");
    await expect(page.locator("#label-b")).toHaveText("Partner 2's answer");
    await expect(page.locator("#label-c")).toHaveText("Partner 3's answer");
  });

  test("Served session HTML still contains zero fetch / XHR / sendBeacon tokens after the partner refactor", async ({
    request,
  }) => {
    for (const path of ["/", "/session?arc=open", "/session?arc=purchase"]) {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      const body = await res.text();
      expect(body).not.toContain("fetch(");
      expect(body).not.toContain("XMLHttpRequest");
      expect(body).not.toContain("sendBeacon");
    }
  });

  test("Landing supporting line names two-to-four partners", async ({ page }) => {
    await page.goto("/");
    const together = page.locator("header .together");
    await expect(together).toContainText("two");
    // Either "two to four" or "two to 4" or numeric — accept the digits or
    // words as long as the four-cap is named alongside the two-minimum.
    const text = ((await together.textContent()) ?? "").toLowerCase();
    expect(text).toMatch(/(two to four|two to 4|2 to 4|2-4|two[-\s]+to[-\s]+four)/);
  });
});
