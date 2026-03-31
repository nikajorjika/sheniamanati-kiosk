import { test, expect } from "@playwright/test";

test.describe("Internal kiosk (/internal)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("redirects to / when device is not configured", async ({ page }) => {
    await page.goto("/internal");

    await expect(page).toHaveURL("/", { timeout: 5000 });
  });

  test("redirects away when terminal type is front, not warehouse", async ({
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
    await page.goto("/internal");

    // /internal rejects the front-type terminal → bounces to / → / sees the config → /client
    await expect(page).toHaveURL("/client", { timeout: 5000 });
  });

  test("renders requests view when warehouse-type terminal is configured", async ({
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
    await page.goto("/internal");

    // Should stay on /internal and render the requests table (not redirect)
    await expect(page).toHaveURL("/internal", { timeout: 5000 });
  });
});
