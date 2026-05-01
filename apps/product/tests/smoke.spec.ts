import { test, expect } from "@playwright/test";

// Fast reachability smoke. The deeper landing assertions live in
// landing.spec.ts; this file just confirms both public routes return HTML
// 200 with the product name on them, so a broken deploy is caught quickly.

test.describe("smoke", () => {
  test("/ responds 200 with HTML containing 'Common Ground'", async ({
    request,
    page,
  }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
    const contentType = response.headers()["content-type"] ?? "";
    expect(contentType).toContain("text/html");

    await page.goto("/");
    await expect(page.locator("body")).toContainText("Common Ground");
  });

  test("/session responds 200 with HTML containing 'Common Ground'", async ({
    request,
    page,
  }) => {
    const response = await request.get("/session");
    expect(response.status()).toBe(200);
    const contentType = response.headers()["content-type"] ?? "";
    expect(contentType).toContain("text/html");

    await page.goto("/session");
    await expect(page.locator("body")).toContainText("Common Ground");
  });
});
