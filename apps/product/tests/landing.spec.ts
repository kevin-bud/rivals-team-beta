import { test, expect } from "@playwright/test";

// Verifier checks for the Common Ground landing page. Runs against whatever
// PRODUCT_URL points at — for "shipped" verdicts this must be the deployed
// Worker URL, not localhost.

test.describe("Common Ground landing page", () => {
  test("responds 200 with text/html", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
    const contentType = response.headers()["content-type"] ?? "";
    expect(contentType).toContain("text/html");
  });

  test("uses British English locale on <html>", async ({ page }) => {
    await page.goto("/");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en-GB");
  });

  test("has a viewport meta tag for mobile", async ({ page }) => {
    await page.goto("/");
    const viewport = await page
      .locator('meta[name="viewport"]')
      .getAttribute("content");
    expect(viewport).toContain("width=device-width");
  });

  test("shows the product name 'Common Ground'", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Common Ground/);
    await expect(page.locator("body")).toContainText("Common Ground");
  });

  test("contains a value-prop framing the joint household conversation", async ({
    page,
  }) => {
    await page.goto("/");
    const lede = page.locator(".lede");
    await expect(lede).toContainText("household");
    await expect(lede).toContainText("joint finances");
    await expect(lede).toContainText("together");
  });

  test("contains multi-user / together framing (not single-user dashboard)", async ({
    page,
  }) => {
    await page.goto("/");
    const together = page.locator("header .together");
    await expect(together).toContainText("two or more people");
    await expect(together).toContainText("household");
  });

  test("surfaces both arcs as parallel CTAs linking to /session?arc=...", async ({
    page,
  }) => {
    await page.goto("/");
    const openCta = page.getByRole("button", {
      name: /start an open conversation/i,
    });
    const purchaseCta = page.getByRole("button", {
      name: /start a big-purchase conversation/i,
    });
    await expect(openCta).toBeVisible();
    await expect(purchaseCta).toBeVisible();
    await expect(openCta).toHaveAttribute("href", "/session?arc=open");
    await expect(purchaseCta).toHaveAttribute(
      "href",
      "/session?arc=purchase",
    );
    // Both arcs are visible, equal-citizen cards on the landing surface.
    const cards = page.locator(".arc-choice");
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toContainText("An open conversation");
    await expect(cards.nth(1)).toContainText("A big upcoming purchase");
    // No "recommended" / "popular" framing on either card.
    const cardsText = (await cards.allTextContents()).join(" ").toLowerCase();
    expect(cardsText).not.toContain("recommended");
    expect(cardsText).not.toContain("popular");
    expect(cardsText).not.toContain("good for beginners");
  });

  test("footer carries the financial-advice disclaimer", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toContainText(
      "does not provide financial, tax, legal, or investment advice",
    );
  });

  test("renders single-column layout at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");
    const main = page.locator("main");
    await expect(main).toBeVisible();
    const box = await main.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }
  });
});
