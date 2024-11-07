import { test, expect } from "@playwright/test";
import { Common } from "../../../utils/common";
import { UIhelper } from "../../../utils/ui-helper";
import { UI_HELPER_ELEMENTS } from "../../../support/pageObjects/global-obj";

test.describe('Check RBAC "analytics-provider-segment" plugin', () => {
  let common: Common;
  let uiHelper: UIhelper;

  test.beforeEach(async ({ page }) => {
    uiHelper = new UIhelper(page);
    common = new Common(page);
    await common.loginAsGithubUser();
    await uiHelper.openSidebarButton("Administration");
    await uiHelper.openSidebar("Plugins");
    await uiHelper.verifyHeading("Plugins");
  });

  test.beforeEach(
    async ({ page }) => await new Common(page).checkAndClickOnGHloginPopup(),
  );

  test("is disabled", async ({ page }) => {
    await page
      .getByPlaceholder("Filter")
      .pressSequentially("backstage-plugin-analytics-provider-segment\n", {
        delay: 300,
      });
    const row = page.locator(
      UI_HELPER_ELEMENTS.rowByText(
        "janus-idp-backstage-plugin-analytics-provider-segment",
      ),
    );
    expect(await row.locator("td").nth(2).innerText()).toBe("No"); // not enabled
  });
});
