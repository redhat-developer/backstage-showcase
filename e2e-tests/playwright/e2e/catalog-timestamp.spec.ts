import { Page, expect, test } from "@playwright/test";
import { UIhelper } from "../utils/UIhelper";
import { Common, setupBrowser } from "../utils/Common";
import { CatalogImport } from "../support/pages/CatalogImport";
import { UIhelperPO } from "../support/pageObjects/global-obj";
import { SidebarOptions } from "../support/pages/sidebar";
import { sidebarExtendedTest } from "../support/extensions/sidebar-extend";

let page: Page;
test.describe("Test timestamp column on Catalog", () => {
  let uiHelper: UIhelper;
  let common: Common;
  let catalogImport: CatalogImport;

  const component =
    "https://github.com/janus-qe/custom-catalog-entities/blob/main/timestamp-catalog-info.yaml";

  test.beforeAll(async ({ browser }, testInfo) => {
    page = (await setupBrowser(browser, testInfo)).page;

    common = new Common(page);
    uiHelper = new UIhelper(page);
    catalogImport = new CatalogImport(page);

    await common.loginAsGuest();
  });

  sidebarExtendedTest.beforeEach(async ({ sidebar }) => {
    await sidebar.open(SidebarOptions.Catalog);
    await uiHelper.verifyHeading("My Org Catalog");
    await uiHelper.selectMuiBox("Kind", "Component");
    await uiHelper.clickByDataTestId("user-picker-all");
  });

  sidebarExtendedTest(
    "Register an existing component and verify `Created At` column and value in the Catalog Page",
    async ({ sidebar }) => {
      await uiHelper.clickButton("Create");
      await uiHelper.clickButton("Register Existing Component");
      await catalogImport.registerExistingComponent(component);
      await sidebar.open(SidebarOptions.Catalog);
      await uiHelper.selectMuiBox("Kind", "Component");
      await uiHelper.searchInputPlaceholder("timestamp-test");
      await uiHelper.verifyColumnHeading(["Created At"], true);
      await uiHelper.verifyRowInTableByUniqueText("timestamp-test-created", [
        /^\d{1,2}\/\d{1,2}\/\d{1,4}, \d:\d{1,2}:\d{1,2} (AM|PM)$/g,
      ]);
    },
  );

  test("Toggle ‘CREATED AT’ to see if the component list can be sorted in ascending/decending order", async () => {
    const createdAtFirstRow =
      "table > tbody > tr:nth-child(1) > td:nth-child(8)";
    //Verify by default Rows are in ascending
    await expect(page.locator(createdAtFirstRow)).toBeEmpty();

    const column = page
      .locator(`${UIhelperPO.MuiTableHead}`)
      .getByText("Created At", { exact: true });
    await column.dblclick(); // Double click to Toggle into decending order.
    await expect(page.locator(createdAtFirstRow)).not.toBeEmpty();
  });

  test.afterAll(async () => {
    await page.close();
  });
});
