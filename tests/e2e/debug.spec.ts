import { test, expect } from "@playwright/test";

test.describe("Debug", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  test("front - redirect to /client", async ({ page }) => {
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

  test("warehouse - inspect what actually happens", async ({ page }) => {
    const urls: string[] = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) urls.push(frame.url());
    });

    await page.addInitScript(() => {
      localStorage.setItem("kioskToken", "test-warehouse-token");
      localStorage.setItem("kioskTerminalId", "2");
      localStorage.setItem("kioskTerminalType", "warehouse");
      localStorage.setItem("kioskBranchId", "1");
      localStorage.setItem("kioskBranchName", "Test Branch");
      localStorage.setItem("kioskTerminalNumber", "002");
      localStorage.setItem("kioskTerminalName", "Warehouse Terminal");
    });
    await page.goto("/");

    await page.waitForTimeout(3000);
    console.log("Navigation history:", urls);
    console.log("Final URL:", page.url());

    const storageAfter = await page.evaluate(() =>
      Object.fromEntries(
        Array.from({ length: localStorage.length }, (_, i) => {
          const k = localStorage.key(i)!;
          return [k, localStorage.getItem(k)];
        })
      )
    );
    console.log("localStorage after 3s:", JSON.stringify(storageAfter));
  });
});
