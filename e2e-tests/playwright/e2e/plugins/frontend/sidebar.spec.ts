import test, { Page, expect } from "@playwright/test";
import { UIhelper } from "../../../utils/UIhelper";
import { Common, setupBrowser } from "../../../utils/Common";
import { SidebarOptions } from "../../../support/pages/sidebar";
import { sidebarExtendedTest } from "../../../support/extensions/sidebar-extend";

let page: Page;

test.describe("Validate Sidebar Navigation Customization", () => {
  let uiHelper: UIhelper;
  let common: Common;

  test.beforeAll(async ({ browser }, testInfo) => {
    page = (await setupBrowser(browser, testInfo)).page;
    uiHelper = new UIhelper(page);
    common = new Common(page);

    await common.loginAsGuest();
  });

  sidebarExtendedTest(
    "Verify menu order and navigate to Docs",
    async ({ sidebar }) => {
      // Verify presence of 'References' menu and related items
      const referencesMenu = uiHelper.getSideBarMenuItem("References");
      expect(referencesMenu).not.toBeNull();
      expect(referencesMenu.getByText("APIs")).not.toBeNull();
      expect(referencesMenu.getByText("Learning Paths")).not.toBeNull();

      // Verify 'Favorites' menu and 'Docs' submenu item
      const favoritesMenu = uiHelper.getSideBarMenuItem("Favorites");
      const docsMenuItem = favoritesMenu.getByText("Docs");
      expect(docsMenuItem).not.toBeNull();

      // Open the 'Favorites' menu and navigate to 'Docs'
      await sidebar.open(SidebarOptions.Favorites);
      await sidebar.open(SidebarOptions.Docs);

      // Verify if the Documentation page has loaded
      await uiHelper.verifyHeading("Documentation");
      await uiHelper.verifyText("Documentation available in", false);
    },
  );
});
