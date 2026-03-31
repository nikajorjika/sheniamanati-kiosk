import { test, expect } from "@playwright/test";

test.describe("Client kiosk (/client)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  test("redirects to / when device is not configured", async ({ page }) => {
    await page.goto("/client");

    await expect(page).toHaveURL("/", { timeout: 5000 });
  });

  test("redirects away when terminal type is warehouse, not front", async ({
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
    await page.goto("/client");

    // /client rejects warehouse type → bounces to / → / sees the config → /internal
    await expect(page).toHaveURL("/internal", { timeout: 5000 });
  });

  test("renders screensaver when front-type terminal is configured", async ({
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
    await page.goto("/client");

    await expect(page).toHaveURL("/client", { timeout: 5000 });
  });
});
