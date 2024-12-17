import { Page, expect, test } from "@playwright/test";
import { UI_HELPER_ELEMENTS } from "../../../support/pageObjects/global-obj";
import {
  HOME_PAGE_COMPONENTS,
  ROLE_OVERVIEW_COMPONENTS,
  ROLES_PAGE_COMPONENTS,
} from "../../../support/pageObjects/page-obj";
import { Roles } from "../../../support/pages/rbac";
import { Common } from "../../../utils/common";
import { UIhelper } from "../../../utils/ui-helper";
import fs from "fs/promises";
import { RbacPo } from "../../../support/pageObjects/rbac-po";

/*
    Note that:
    The policies generated from a policy.csv or ConfigMap file cannot be edited or deleted using the Developer Hub Web UI. 
    https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.2/html/authorization/proc-rbac-ui-manage-roles_title-authorization#proc-rbac-ui-edit-role_title-authorization
*/

test.describe("Test RBAC plugin: load permission policies and conditions from files", () => {
  test.beforeEach(async ({ page }) => {
    await new Common(page).loginAsKeycloakUser();
    await page.goto("/rbac");
  });

  test.skip("Check if permission policies defined in files are loaded", async ({
    page,
  }) => {
    const uiHelper = new UIhelper(page);

    const testRole: string = "role:default/test2-role";

    await uiHelper.verifyHeading(/All roles \(\d+\)/);
    await uiHelper.verifyLink(testRole);
    await uiHelper.clickLink(testRole);

    await uiHelper.verifyHeading(testRole);
    await uiHelper.clickTab("Overview");

    await uiHelper.verifyText("About");
    await uiHelper.verifyText("csv permission policy file");

    await uiHelper.verifyHeading("Users and groups (1 group");
    //TODO: to fix when conditional policies run:
    //await uiHelper.verifyHeading("Permission policies (1)");
    await uiHelper.verifyHeading("Permission policies");
    const permissionPoliciesColumnsText =
      Roles.getPermissionPoliciesListColumnsText();
    await uiHelper.verifyColumnHeading(permissionPoliciesColumnsText);
    const permissionPoliciesCellsIdentifier =
      Roles.getPermissionPoliciesListCellsIdentifier();
    await uiHelper.verifyCellsInTable(permissionPoliciesCellsIdentifier);

    await expect(page.getByRole("article")).toContainText("catalog-entity");
    await expect(page.getByRole("article")).toContainText("Read, Update");
    await expect(page.getByRole("article")).toContainText("Delete");
  });
});

test.skip("Test RBAC plugin: Aliases used in conditional access policies", () => {
  test.beforeEach(async ({ page }) => {
    await new Common(page).loginAsKeycloakUser(
      process.env.GH_USER2_ID,
      process.env.GH_USER2_PASS,
    );
  });

  test("Check if aliases used in conditions: the user is allowed to unregister only components they own, not those owned by the group.", async ({
    page,
  }) => {
    const uiHelper = new UIhelper(page);
    const testUser = "test-rhdh-qe-2";
    await page.goto("/catalog");
    await uiHelper.selectMuiBox("Kind", "Component");

    await uiHelper.searchInputPlaceholder(testUser);
    await page.getByRole("link", { name: testUser, exact: true }).click();

    await expect(page.locator("header")).toContainText(testUser);
    await page.getByTestId("menu-button").click();
    const unregisterUserOwned = page.getByText("Unregister entity");
    await expect(unregisterUserOwned).toBeEnabled();

    await page.getByText("Unregister entity").click();
    await expect(page.getByRole("heading")).toContainText(
      "Are you sure you want to unregister this entity?",
    );
    await page.getByRole("button", { name: "Cancel" }).click();

    await uiHelper.openSidebar("Catalog");
    await page.getByRole("link", { name: "test-rhdh-qe-2-team-owned" }).click();
    await expect(page.locator("header")).toContainText(
      "janus-qe/rhdh-qe-2-team",
    );
    await page.getByTestId("menu-button").click();
    const unregisterGroupOwned = page.getByText("Unregister entity");
    await expect(unregisterGroupOwned).toBeDisabled();
  });
});

test.describe("Test RBAC plugin as an admin user", () => {
  test.beforeEach(async ({ page }) => {
    await new Common(page).loginAsKeycloakUser();
    await page.goto("/rbac");
  });

  test("Check if Administration side nav is present with RBAC plugin", async ({
    page,
  }) => {
    const uiHelper = new UIhelper(page);
    await uiHelper.verifyHeading(/All roles \(\d+\)/);
    const allGridColumnsText = Roles.getRolesListColumnsText();
    await uiHelper.verifyColumnHeading(allGridColumnsText);
    const allCellsIdentifier = Roles.getRolesListCellsIdentifier();
    await uiHelper.verifyCellsInTable(allCellsIdentifier);
  });

  test("Should download the user list", async ({ page }) => {
    await page.locator('a:has-text("Download User List")').click();
    const fileContent = await downloadAndReadFile(page);
    const lines = fileContent.trim().split("\n");

    const header = "userEntityRef,displayName,email,lastAuthTime";
    if (lines[0] !== header) {
      throw new Error("Header does not match");
    }

    // Check that each subsequent line starts with "user:default"
    const allUsersValid = lines
      .slice(1)
      .every((line) => line.startsWith("user:default"));
    if (!allUsersValid) {
      throw new Error("Not all users info are valid");
    }
  });

  async function downloadAndReadFile(page: Page): Promise<string | undefined> {
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.locator('a:has-text("Download User List")').click(),
    ]);

    const filePath = await download.path();

    if (filePath) {
      const fileContent = await fs.readFile(filePath, "utf-8");
      return fileContent;
    } else {
      console.error("Download failed or path is not available");
      return undefined;
    }
  }

  test("View details of a role", async ({ page }) => {
    const uiHelper = new UIhelper(page);
    await uiHelper.clickLink("role:default/rbac_admin");

    await uiHelper.verifyHeading("role:default/rbac_admin");
    await uiHelper.clickTab("Overview");

    await uiHelper.verifyText("About");

    await uiHelper.verifyHeading("Users and groups (1 user");
    const usersAndGroupsColumnsText = Roles.getUsersAndGroupsListColumnsText();
    await uiHelper.verifyColumnHeading(usersAndGroupsColumnsText);
    const usersAndGroupsCellsIdentifier =
      Roles.getUsersAndGroupsListCellsIdentifier();
    await uiHelper.verifyCellsInTable(usersAndGroupsCellsIdentifier);

    await uiHelper.verifyHeading("Permission policies (5)");
    const permissionPoliciesColumnsText =
      Roles.getPermissionPoliciesListColumnsText();
    await uiHelper.verifyColumnHeading(permissionPoliciesColumnsText);
    const permissionPoliciesCellsIdentifier =
      Roles.getPermissionPoliciesListCellsIdentifier();
    await uiHelper.verifyCellsInTable(permissionPoliciesCellsIdentifier);

    await uiHelper.clickLink("RBAC");
  });

  test("Create and edit a role from the roles list page", async ({ page }) => {
    const rolesHelper = new Roles(page);
    const uiHelper = new UIhelper(page);

    const rbacPo = new RbacPo(page);
    const testUser = "Jonathon Page";
    await rbacPo.createRole("test-role", [
      RbacPo.rbacTestUsers.guest,
      RbacPo.rbacTestUsers.tara,
      RbacPo.rbacTestUsers.backstage,
    ]);
    await page.click(ROLES_PAGE_COMPONENTS.editRole("role:default/test-role"));
    await uiHelper.verifyHeading("Edit Role");
    await uiHelper.clickButton("Next");
    await rbacPo.addUsersAndGroups(testUser);
    await page.click(rbacPo.selectMember(testUser));
    await uiHelper.verifyHeading("Users and groups (3 users, 1 group)");
    await uiHelper.clickButton("Next");
    await uiHelper.clickButton("Next");
    await uiHelper.clickButton("Save");
    await uiHelper.verifyText(
      "Role role:default/test-role updated successfully",
    );

    await page
      .locator(HOME_PAGE_COMPONENTS.searchBar)
      .waitFor({ state: "visible" });
    await page.locator(HOME_PAGE_COMPONENTS.searchBar).fill("test-role");
    await uiHelper.verifyHeading("All roles (1)");
    const usersAndGroupsLocator = page
      .locator(UI_HELPER_ELEMENTS.MuiTableCell)
      .filter({ hasText: "3 users, 1 group" });
    await usersAndGroupsLocator.waitFor();
    await expect(usersAndGroupsLocator).toBeVisible();

    await rolesHelper.deleteRole("role:default/test-role");
  });

  test("Edit users and groups and update policies of a role from the overview page", async ({
    page,
  }) => {
    const rolesHelper = new Roles(page);
    const uiHelper = new UIhelper(page);
    const rbacPo = new RbacPo(page);
    await rbacPo.createRole("test-role1", [
      RbacPo.rbacTestUsers.guest,
      RbacPo.rbacTestUsers.tara,
      RbacPo.rbacTestUsers.backstage,
    ]);

    await uiHelper.filterInputPlaceholder("test-role1");

    await uiHelper.clickLink("role:default/test-role1");

    await uiHelper.verifyHeading("role:default/test-role1");
    await uiHelper.clickTab("Overview");

    await page.click(ROLE_OVERVIEW_COMPONENTS.updateMembers);
    await uiHelper.verifyHeading("Edit Role");
    await page.locator(HOME_PAGE_COMPONENTS.searchBar).fill("Guest User");
    await page.click('button[aria-label="Remove"]');
    await uiHelper.verifyHeading("Users and groups (1 user, 1 group)");
    await uiHelper.clickButton("Next");
    await uiHelper.clickButton("Next");
    await uiHelper.clickButton("Save");
    await uiHelper.verifyText(
      "Role role:default/test-role1 updated successfully",
    );
    await uiHelper.verifyHeading("Users and groups (1 user, 1 group)");

    await page.click(ROLE_OVERVIEW_COMPONENTS.updatePolicies);
    await uiHelper.verifyHeading("Edit Role");
    await rbacPo.clickAddPermissionPolicy();
    await page.click(rbacPo.selectPermissionPolicyPlugin(1), {
      timeout: 10 * 1000,
    });
    await rbacPo.selectOption("scaffolder");
    await page.click(rbacPo.selectPermissionPolicyPermission(1));
    await rbacPo.selectOption("scaffolder-template");
    await uiHelper.clickButton("Next");
    await uiHelper.clickButton("Save");
    await uiHelper.verifyText(
      "Role role:default/test-role1 updated successfully",
    );
    await uiHelper.verifyHeading("Permission Policies (3)");

    await rolesHelper.deleteRole("role:default/test-role1");
  });

  test("Create a role with a permission policy per resource type and verify that the only authorized users can access specific resources.", async ({
    page,
  }) => {
    const rolesHelper = new Roles(page);
    const uiHelper = new UIhelper(page);
    await new RbacPo(page).createRole(
      "test-role",
      ["Guest User", "rhdh-qe", "Backstage"],
      "anyOf",
    );

    await page
      .locator(HOME_PAGE_COMPONENTS.searchBar)
      .waitFor({ state: "visible" });
    await page.locator(HOME_PAGE_COMPONENTS.searchBar).fill("test-role");
    await uiHelper.verifyHeading("All roles (1)");
    await rolesHelper.deleteRole("role:default/test-role");
  });
});

test.describe("Test RBAC plugin as a guest user", () => {
  test.beforeEach(async ({ page }) => {
    const common = new Common(page);
    await common.loginAsGuest();
  });

  test("Check if Administration side nav is present with no RBAC plugin", async ({
    page,
  }) => {
    const uiHelper = new UIhelper(page);
    await uiHelper.openSidebarButton("Administration");
    const dropdownMenuLocator = page.locator(`text="RBAC"`);
    await expect(dropdownMenuLocator).not.toBeVisible();
  });
});
