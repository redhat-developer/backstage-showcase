import test, { Page } from "@playwright/test";
import { UIhelper } from "../utils/UIhelper";
import { Common, setupBrowser } from "../utils/Common";
import { SidebarOptions } from "../support/pages/sidebar";
import { sidebarExtendedTest } from "../support/extensions/sidebar-extend";

let page: Page;
test.describe.serial("GitHub integration with Org data fetching", () => {
  let common: Common;
  let uiHelper: UIhelper;

  test.beforeAll(async ({ browser }, testInfo) => {
    page = (await setupBrowser(browser, testInfo)).page;
    uiHelper = new UIhelper(page);
    common = new Common(page);
    await common.loginAsGithubUser();
  });
  test.beforeEach(
    async () => await new Common(page).checkAndClickOnGHloginPopup(),
  );

  sidebarExtendedTest(
    "Verify that fetching the groups of the first org works",
    async ({ sidebar }) => {
      await sidebar.open(SidebarOptions.Catalog);
      await uiHelper.selectMuiBox("Kind", "Group");

      await uiHelper.searchInputPlaceholder("m");
      await uiHelper.verifyRowsInTable(["maintainers"]);

      await uiHelper.searchInputPlaceholder("r");
      await uiHelper.verifyRowsInTable(["rhdh-qes"]);
    },
  );

  test("Verify that fetching the groups of the second org works", async () => {
    await uiHelper.searchInputPlaceholder("c");
    await uiHelper.verifyRowsInTable(["catalog-group"]);

    await uiHelper.searchInputPlaceholder("j");
    await uiHelper.verifyRowsInTable(["janus-test"]);
  });

  sidebarExtendedTest(
    "Verify that fetching the users of the orgs works",
    async ({ sidebar }) => {
      await sidebar.open(SidebarOptions.Catalog);
      await uiHelper.selectMuiBox("Kind", "User");

      await uiHelper.searchInputPlaceholder("r");
      await uiHelper.verifyRowsInTable(["rhdh-qe"]);
    },
  );
});
