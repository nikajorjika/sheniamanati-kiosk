import { test, expect } from "@playwright/test";

test.describe("Setup screen", () => {
  test.beforeEach(async ({ page }) => {
    // Runs before any page JS on every navigation — guarantees clean state
    await page.addInitScript(() => localStorage.clear());
  });

  test("shows activation form when device is not configured", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator("form")).toBeVisible({ timeout: 5000 });
  });

  test("redirects to /client when a front-type config is stored", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("kioskToken", "test-front-token");
      localStorage.setItem("kioskTerminalId", "1");
      localStorage.setItem("kioskTerminalType", "front");
      localStorage.setItem("kioskBranchId", "1");
      localStorage.setItem("kioskBranchName", "Test Branch");
      localStorage.setItem("kioskTerminalNumber", "001");
      localStorage.setItem("kioskTerminalName", "Test Terminal");
    });
    await page.goto("/");

    await expect(page).toHaveURL("/client", { timeout: 5000 });
  });

  test("redirects to /internal when a warehouse-type config is stored", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("kioskToken", "test-warehouse-token");
      localStorage.setItem("kioskTerminalId", "2");
      localStorage.setItem("kioskTerminalType", "warehouse");
      localStorage.setItem("kioskBranchId", "1");
      localStorage.setItem("kioskBranchName", "Test Branch");
      localStorage.setItem("kioskTerminalNumber", "002");
      localStorage.setItem("kioskTerminalName", "Warehouse Terminal");
    });
    // Register the listener before goto — the redirect is client-side and happens
    // after load, so we must not miss the brief window when URL is /internal
    // (RequestsTable will call onLogout() on 401 and navigate away immediately after)
    const reachedInternal = page.waitForURL("**/internal", { timeout: 5000 });
    await page.goto("/");
    await reachedInternal;
  });
});
