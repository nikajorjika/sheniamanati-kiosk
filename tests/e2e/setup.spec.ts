import { test, expect } from "@playwright/test";

test.describe("Setup screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("shows activation form when device is not configured", async ({
    page,
  }) => {
    await page.reload();

    // The setup screen should be visible — it renders a form with two code fields
    await expect(page.locator("form")).toBeVisible({ timeout: 5000 });
  });

  test("redirects to /client when a front-type config is stored", async ({
    page,
  }) => {
    await page.evaluate(() => {
      localStorage.setItem("kioskToken", "test-front-token");
      localStorage.setItem("kioskTerminalId", "1");
      localStorage.setItem("kioskTerminalType", "front");
      localStorage.setItem("kioskBranchId", "1");
      localStorage.setItem("kioskBranchName", "Test Branch");
      localStorage.setItem("kioskTerminalNumber", "001");
      localStorage.setItem("kioskTerminalName", "Test Terminal");
    });
    await page.reload();

    await expect(page).toHaveURL("/client", { timeout: 5000 });
  });

  test("redirects to /internal when a warehouse-type config is stored", async ({
    page,
  }) => {
    await page.evaluate(() => {
      localStorage.setItem("kioskToken", "test-warehouse-token");
      localStorage.setItem("kioskTerminalId", "2");
      localStorage.setItem("kioskTerminalType", "warehouse");
      localStorage.setItem("kioskBranchId", "1");
      localStorage.setItem("kioskBranchName", "Test Branch");
      localStorage.setItem("kioskTerminalNumber", "002");
      localStorage.setItem("kioskTerminalName", "Warehouse Terminal");
    });
    await page.reload();

    await expect(page).toHaveURL("/internal", { timeout: 5000 });
  });
});
