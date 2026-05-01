import { test, expect, type Page, type Request } from "@playwright/test";

// Verifier checks for the take-aways step at /session?arc=open and
// /session?arc=purchase. Runs against PRODUCT_URL (deployed Worker).
// Covers DoD items 1-12 of the take-aways task:
// - new screen renders between the closing reflection and the summary on
//   both arcs, with two labelled inputs
// - take-aways persist across Back/Next
// - per-arc isolation: open-arc take-aways do not appear on the purchase arc
// - both blank: summary identical to the pre-slice summary (no extra
//   section element)
// - one or both non-empty: summary shows the new section in the correct
//   position relative to "Worth coming back to" and the prompt list
// - print emulation shows the new section in correct printed order when
//   present, omitted when blank
// - network watch through both arcs end-to-end including the print click:
//   zero non-GET requests

const OPEN_PROMPTS_TOTAL = 6;
const PURCHASE_PROMPTS_TOTAL = 5;

const NAME_A = "Alex";
const NAME_B = "Bea";

function isWriteRequest(request: Request): boolean {
  const method = request.method().toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return false;
  }
  return true;
}

async function advanceToTakeaways(
  page: Page,
  options: { arc?: "open" | "purchase"; total?: number } = {},
): Promise<void> {
  const arc = options.arc ?? "open";
  const total =
    options.total ??
    (arc === "purchase" ? PURCHASE_PROMPTS_TOTAL : OPEN_PROMPTS_TOTAL);
  await page.goto(`/session?arc=${arc}`);
  await page.locator("#name-a").fill(NAME_A);
  await page.locator("#name-b").fill(NAME_B);
  await page.locator("#begin-btn").click();
  for (let i = 0; i < total; i++) {
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
}

test.describe("Common Ground take-aways step", () => {
  test("on the open arc: take-aways screen sits between reflection and summary", async ({
    page,
  }) => {
    await page.goto("/session?arc=open");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    for (let i = 0; i < OPEN_PROMPTS_TOTAL; i++) {
      await page.locator("#next-btn").click();
    }
    // Reflection is active; summary is not.
    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(page.locator("#step-takeaways")).toHaveAttribute(
      "data-active",
      "false",
    );
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "false",
    );
    // Reflection's next button advances to the take-aways screen, not the
    // summary.
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-takeaways")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "false",
    );
    // The take-aways screen has the elicit-not-prescribe heading.
    await expect(
      page.getByRole("heading", { name: /anything you're each taking/i }),
    ).toBeVisible();
    // Helper line is explicit that skipping is fine and gives no examples
    // about what to write (no "for example", no bulleted suggestions).
    const intro = page.locator("#step-takeaways .reflection-intro");
    await expect(intro).toContainText(/skipping is fine/i);
    // Two single-line text inputs labelled with the partners' setup names.
    const inputA = page.locator("#takeaway-a");
    const inputB = page.locator("#takeaway-b");
    await expect(inputA).toHaveAttribute("type", "text");
    await expect(inputB).toHaveAttribute("type", "text");
    await expect(page.locator("#takeaway-label-a")).toHaveText(NAME_A);
    await expect(page.locator("#takeaway-label-b")).toHaveText(NAME_B);
    // No example placeholder text on either input.
    const placeholderA = await inputA.getAttribute("placeholder");
    const placeholderB = await inputB.getAttribute("placeholder");
    expect(placeholderA == null || placeholderA === "").toBe(true);
    expect(placeholderB == null || placeholderB === "").toBe(true);
  });

  test("on the purchase arc: take-aways screen also sits between reflection and summary", async ({
    page,
  }) => {
    await advanceToTakeaways(page, { arc: "purchase" });
    await expect(
      page.getByRole("heading", { name: /anything you're each taking/i }),
    ).toBeVisible();
    await expect(page.locator("#takeaway-label-a")).toHaveText(NAME_A);
    await expect(page.locator("#takeaway-label-b")).toHaveText(NAME_B);
  });

  test("Back returns to closing reflection with prior state preserved", async ({
    page,
  }) => {
    await advanceToTakeaways(page, { arc: "open" });
    // Tag prompt 1 for partner A on the reflection screen first by going
    // back, tagging, and forward again.
    await page.locator("#takeaway-back-btn").click();
    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    const firstRow = page.locator("#reflection-list .reflection-row").first();
    await firstRow.locator('input[data-tag-input="a"]').check();
    await firstRow
      .locator('input[data-note-input="a"]')
      .fill("Worth a follow-up");
    // Forward to take-aways again.
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-takeaways")).toHaveAttribute(
      "data-active",
      "true",
    );
    // Fill in take-aways and go back: the inputs hold their values when
    // we return.
    await page.locator("#takeaway-a").fill("Pay attention to grocery spend");
    await page.locator("#takeaway-b").fill("Set a Friday money chat");
    await page.locator("#takeaway-back-btn").click();
    await expect(page.locator("#step-reflection")).toHaveAttribute(
      "data-active",
      "true",
    );
    // Tag and note are preserved.
    await expect(
      firstRow.locator('input[data-tag-input="a"]'),
    ).toBeChecked();
    await expect(firstRow.locator('input[data-note-input="a"]')).toHaveValue(
      "Worth a follow-up",
    );
    // Forward again — take-aways inputs are preserved.
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#takeaway-a")).toHaveValue(
      "Pay attention to grocery spend",
    );
    await expect(page.locator("#takeaway-b")).toHaveValue(
      "Set a Friday money chat",
    );
  });

  test("per-arc isolation: open-arc take-aways do not leak to the purchase arc", async ({
    page,
  }) => {
    await advanceToTakeaways(page, { arc: "open" });
    await page.locator("#takeaway-a").fill("Open-arc thought from Alex");
    await page.locator("#takeaway-b").fill("Open-arc thought from Bea");
    // Leave to the landing page and start the purchase arc.
    await page.goto("/");
    await page
      .getByRole("button", { name: /start a big-purchase conversation/i })
      .click();
    await expect(page).toHaveURL(/\/session\?arc=purchase$/);
    // Walk through the purchase arc to its take-aways screen.
    await page.locator("#name-a").fill("Cam");
    await page.locator("#name-b").fill("Dee");
    await page.locator("#begin-btn").click();
    for (let i = 0; i < PURCHASE_PROMPTS_TOTAL; i++) {
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-takeaways")).toHaveAttribute(
      "data-active",
      "true",
    );
    // Take-aways inputs are blank on the purchase arc despite the open arc
    // having values.
    await expect(page.locator("#takeaway-a")).toHaveValue("");
    await expect(page.locator("#takeaway-b")).toHaveValue("");
    // Inverse: returning to the open arc still has its take-aways.
    await page.goto("/session?arc=open");
    // The page reloads on setup, but state survives in sessionStorage.
    // Walk forward to the take-aways screen and assert values intact.
    await page.locator("#begin-btn").click();
    for (let i = 0; i < OPEN_PROMPTS_TOTAL; i++) {
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-takeaways")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(page.locator("#takeaway-a")).toHaveValue(
      "Open-arc thought from Alex",
    );
    await expect(page.locator("#takeaway-b")).toHaveValue(
      "Open-arc thought from Bea",
    );
  });

  test("summary with both take-aways blank has no take-aways section", async ({
    page,
  }) => {
    await advanceToTakeaways(page, { arc: "open" });
    // Both blank — advance straight through.
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
    // Section element exists in the DOM but is hidden.
    const section = page.locator("#takeaways-section");
    await expect(section).toBeHidden();
    // No take-away items rendered.
    await expect(page.locator("#takeaways-list .takeaway-item")).toHaveCount(0);
  });

  test("summary with one non-empty take-away shows the section and only that partner's line", async ({
    page,
  }) => {
    await advanceToTakeaways(page, { arc: "open" });
    await page.locator("#takeaway-a").fill("Pay closer attention to grocery spend");
    // B is left blank.
    await page.locator("#takeaway-next-btn").click();
    const section = page.locator("#takeaways-section");
    await expect(section).toBeVisible();
    const items = page.locator("#takeaways-list .takeaway-item");
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText(NAME_A);
    await expect(items.first()).toContainText(
      "Pay closer attention to grocery spend",
    );
    // No "(blank)" placeholder or struck-through row for partner B.
    const sectionText = await section.textContent();
    expect(sectionText ?? "").not.toContain(NAME_B);
    expect((sectionText ?? "").toLowerCase()).not.toContain("(blank)");
  });

  test("summary with both take-aways non-empty: section sits below 'Worth coming back to' and above the prompt list", async ({
    page,
  }) => {
    await page.goto("/session?arc=open");
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    for (let i = 0; i < OPEN_PROMPTS_TOTAL; i++) {
      await page.locator("#next-btn").click();
    }
    // Tag prompt 1 for both partners so the revisit section also renders.
    const firstRow = page.locator("#reflection-list .reflection-row").first();
    await firstRow.locator('input[data-tag-input="a"]').check();
    await firstRow.locator('input[data-tag-input="b"]').check();
    await page.locator("#reflection-next-btn").click();
    await page.locator("#takeaway-a").fill("Talk again next Friday");
    await page.locator("#takeaway-b").fill("Look at the streaming subs");
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
    // Both top sections visible.
    await expect(page.locator("#revisit-section")).toBeVisible();
    await expect(page.locator("#takeaways-section")).toBeVisible();
    // Two items in the take-aways list.
    const items = page.locator("#takeaways-list .takeaway-item");
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toContainText(NAME_A);
    await expect(items.nth(0)).toContainText("Talk again next Friday");
    await expect(items.nth(1)).toContainText(NAME_B);
    await expect(items.nth(1)).toContainText("Look at the streaming subs");
    // DOM order: revisit-section before takeaways-section before summary-list.
    const order = await page.evaluate(() => {
      const summary = document.getElementById("step-summary");
      if (!summary) {
        return null;
      }
      const revisit = summary.querySelector("#revisit-section");
      const takeaways = summary.querySelector("#takeaways-section");
      const list = summary.querySelector("#summary-list");
      const all = Array.from(summary.querySelectorAll("*"));
      return {
        revisit: revisit ? all.indexOf(revisit as Element) : -1,
        takeaways: takeaways ? all.indexOf(takeaways as Element) : -1,
        list: list ? all.indexOf(list as Element) : -1,
      };
    });
    expect(order).not.toBeNull();
    if (order) {
      expect(order.revisit).toBeGreaterThanOrEqual(0);
      expect(order.takeaways).toBeGreaterThan(order.revisit);
      expect(order.list).toBeGreaterThan(order.takeaways);
    }
  });

  test("print emulation on the open arc shows the take-aways section in correct order when present", async ({
    page,
  }) => {
    await advanceToTakeaways(page, { arc: "open" });
    await page.locator("#takeaway-a").fill("Make space for the conversation");
    await page.locator("#takeaway-b").fill("Look up that pension thing");
    await page.locator("#takeaway-next-btn").click();
    await page.emulateMedia({ media: "print" });
    // Take-aways section visible under print emulation.
    await expect(page.locator("#takeaways-section")).toBeVisible();
    // Revisit section is hidden (no tags applied), prompt list is visible.
    await expect(page.locator("#revisit-section")).toBeHidden();
    await expect(page.locator("#summary-list")).toBeVisible();
    // Hidden chrome stays hidden in print.
    await expect(page.locator("#print-btn")).toBeHidden();
    await expect(page.locator("#restart-link")).toBeHidden();
  });

  test("print emulation on the purchase arc with both take-aways blank: section omitted", async ({
    page,
  }) => {
    await advanceToTakeaways(page, { arc: "purchase" });
    // Skip both take-aways.
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("#takeaways-section")).toBeHidden();
    // Print heading still names the arc.
    await expect(
      page.locator(".print-only h1"),
    ).toContainText("A big upcoming purchase");
  });

  test("network watch — full flow on open arc with non-empty take-aways and the print click: zero non-GET requests", async ({
    page,
  }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (isWriteRequest(request)) {
        writes.push(`${request.method()} ${request.url()}`);
      }
    });
    await advanceToTakeaways(page, { arc: "open" });
    await page.locator("#takeaway-a").fill("Sit down again next Friday");
    await page.locator("#takeaway-b").fill("Cancel the unused subs");
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
    // Click the Save as PDF button — re-renders the summary and triggers
    // window.print(). We stub print first so the dialogue does not block.
    await page.evaluate(() => {
      window.print = () => undefined;
    });
    await page.locator("#print-btn").click();
    expect(writes).toEqual([]);
  });

  test("network watch — full flow on purchase arc with non-empty take-aways: zero non-GET requests", async ({
    page,
  }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (isWriteRequest(request)) {
        writes.push(`${request.method()} ${request.url()}`);
      }
    });
    await advanceToTakeaways(page, { arc: "purchase" });
    await page.locator("#takeaway-a").fill("Decide by month-end");
    await page.locator("#takeaway-b").fill("Get a quote on the alternative");
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
    await page.evaluate(() => {
      window.print = () => undefined;
    });
    await page.locator("#print-btn").click();
    expect(writes).toEqual([]);
  });

  test("'Start a new session' clears the take-aways for that arc", async ({
    page,
  }) => {
    await advanceToTakeaways(page, { arc: "open" });
    await page.locator("#takeaway-a").fill("First A take-away");
    await page.locator("#takeaway-b").fill("First B take-away");
    await page.locator("#takeaway-next-btn").click();
    await expect(page.locator("#step-summary")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(page.locator("#takeaways-section")).toBeVisible();
    await page.locator("#restart-link").click();
    await expect(page.locator("#step-setup")).toHaveAttribute(
      "data-active",
      "true",
    );
    // Setup inputs are cleared.
    await expect(page.locator("#name-a")).toHaveValue("");
    await expect(page.locator("#name-b")).toHaveValue("");
    // Walk through to take-aways again — both inputs are blank.
    await page.locator("#name-a").fill(NAME_A);
    await page.locator("#name-b").fill(NAME_B);
    await page.locator("#begin-btn").click();
    for (let i = 0; i < OPEN_PROMPTS_TOTAL; i++) {
      await page.locator("#next-btn").click();
    }
    await page.locator("#reflection-next-btn").click();
    await expect(page.locator("#step-takeaways")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(page.locator("#takeaway-a")).toHaveValue("");
    await expect(page.locator("#takeaway-b")).toHaveValue("");
  });

  test("mobile readability at 375px — take-aways screen fits without horizontal scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await advanceToTakeaways(page, { arc: "open" });
    // Body's scroll width should not exceed the viewport — i.e. no
    // horizontal overflow.
    const overflow = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
    // Both inputs are reachable.
    await expect(page.locator("#takeaway-a")).toBeVisible();
    await expect(page.locator("#takeaway-b")).toBeVisible();
  });

  test("served session JS at /, /session?arc=open and /session?arc=purchase contains zero fetch / XMLHttpRequest / sendBeacon tokens", async ({
    request,
  }) => {
    const banned = ["fetch(", "XMLHttpRequest", "sendBeacon"];
    for (const path of ["/", "/session?arc=open", "/session?arc=purchase"]) {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      const body = await response.text();
      for (const token of banned) {
        expect(body).not.toContain(token);
      }
    }
  });
});
