import { APIResponse, Page, expect } from "@playwright/test";
import { UIhelper } from "../../utils/ui-helper";
import {
  DELETE_ROLE_COMPONENTS,
  HOME_PAGE_COMPONENTS,
  ROLE_FORM_COMPONENTS,
  ROLE_LIST_COMPONENTS,
} from "../pageObjects/page-obj";

export class Roles {
  private page: Page;
  private uiHelper: UIhelper;

  constructor(page: Page) {
    this.page = page;
    this.uiHelper = new UIhelper(page);
  }
  static getRolesListCellsIdentifier() {
    const roleName = new RegExp(/^(role|user|group):[a-zA-Z]+\/[\w@*.~-]+$/);
    const usersAndGroups = new RegExp(
      /^(1\s(user|group)|[2-9]\s(users|groups))(, (1\s(user|group)|[2-9]\s(users|groups)))?$/,
    );
    const permissionPolicies = /\d/;
    return [roleName, usersAndGroups, permissionPolicies];
  }

  static getUsersAndGroupsListCellsIdentifier() {
    const name = new RegExp(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/);
    const type = new RegExp(/^(User|Group)$/);
    const members = /^(-|\d+)$/;
    return [name, type, members];
  }

  static getPermissionPoliciesListCellsIdentifier() {
    const policies =
      /^(?:(Read|Create|Update|Delete)(?:, (?:Read|Create|Update|Delete))*|Use)$/;
    return [policies];
  }

  //Depending on the version of the Backstage, it can be 'Permission Policies' or 'Accessible Plugins'
  // Accepts either term
  static getRolesListColumnsText() {
    return [
      /^Name$/,
      /^Users and groups$/,
      /Permission Policies|Accessible plugins/,
    ];
  }

  static getUsersAndGroupsListColumnsText() {
    return ["Name", "Type", "Members"];
  }

  static getPermissionPoliciesListColumnsText() {
    return ["Plugin", "Permission", "Policies"];
  }

  async createRole(name: string) {
    await this.uiHelper.clickButton("Create");

    await this.uiHelper.verifyHeading("Create role");

    await this.page.fill(ROLE_FORM_COMPONENTS.roleName, name);
    await this.uiHelper.clickButton("Next");
    await this.page.fill(ROLE_FORM_COMPONENTS.addUsersAndGroups, "guest user");
    await this.page.click(ROLE_FORM_COMPONENTS.selectMember("Guest User"));
    await this.page.fill(ROLE_FORM_COMPONENTS.addUsersAndGroups, "tara");
    await this.page.click(ROLE_FORM_COMPONENTS.selectMember("Tara MacGovern"));
    await this.page.fill(ROLE_FORM_COMPONENTS.addUsersAndGroups, "Backstage");
    await this.page.click(ROLE_FORM_COMPONENTS.selectMember("Backstage"));
    await this.uiHelper.verifyHeading("Users and groups (2 users, 1 group)");
    await this.uiHelper.clickButton("Next");

    await this.page.click(
      ROLE_FORM_COMPONENTS.selectPermissionPolicyPlugin(0),
      {
        timeout: 100000,
      },
    );
    await this.uiHelper.optionSelector("catalog");
    await this.page.click(
      ROLE_FORM_COMPONENTS.selectPermissionPolicyPermission(0),
      {
        timeout: 100000,
      },
    );
    await this.uiHelper.optionSelector("catalog-entity");
    await this.page.uncheck(ROLE_FORM_COMPONENTS.selectPolicy(0, 1, "Delete"));

    await this.uiHelper.clickButton("Next");

    await this.uiHelper.verifyHeading("Review and create");
    await this.uiHelper.verifyText("Users and groups (2 users, 1 group)");
    await this.uiHelper.verifyText("Permission policies (2)");

    await this.uiHelper.clickButton("Create");

    await this.page
      .locator(HOME_PAGE_COMPONENTS.searchBar)
      .waitFor({ timeout: 60000 });
    await this.page.locator(HOME_PAGE_COMPONENTS.searchBar).fill(name);
    await this.uiHelper.verifyHeading("All roles (1)");
  }

  async createRoleWithPermissionPolicy(name: string) {
    await this.uiHelper.clickButton("Create");

    await this.uiHelper.verifyHeading("Create role");

    await this.page.fill(ROLE_FORM_COMPONENTS.roleName, name);
    await this.uiHelper.clickButton("Next");
    await this.page.fill(ROLE_FORM_COMPONENTS.addUsersAndGroups, "guest user");
    await this.page.click(ROLE_FORM_COMPONENTS.selectMember("Guest User"));
    await this.page.fill(ROLE_FORM_COMPONENTS.addUsersAndGroups, "rhdh-qe");
    await this.page.click(ROLE_FORM_COMPONENTS.selectMember("rhdh-qe"));
    await this.page.fill(ROLE_FORM_COMPONENTS.addUsersAndGroups, "Backstage");
    await this.page.click(ROLE_FORM_COMPONENTS.selectMember("Backstage"));
    await this.uiHelper.verifyHeading("Users and groups (2 users, 1 group)");
    await this.uiHelper.clickButton("Next");

    await this.page.click(
      ROLE_FORM_COMPONENTS.selectPermissionPolicyPlugin(0),
      {
        timeout: 100000,
      },
    );
    await this.uiHelper.optionSelector("catalog");
    await this.page.click(
      ROLE_FORM_COMPONENTS.selectPermissionPolicyPermission(0),
      {
        timeout: 100000,
      },
    );
    await this.uiHelper.optionSelector("catalog-entity");

    await this.page.getByLabel("configure-access").click();
    await this.page.getByRole("button", { name: "AnyOf" }).click();
    await this.page.getByTestId("rules-sidebar").getByLabel("Open").click();
    await this.page.getByText("IS_ENTITY_KIND").click();
    await this.page.getByPlaceholder("string, string").click();
    await this.page
      .getByPlaceholder("string, string")
      .fill("component,template");
    await this.page.getByRole("button", { name: "Add rule" }).click();
    await this.page.getByLabel("Open").nth(3).click();
    await this.page.getByText("HAS_SPEC").click();
    await this.page.getByLabel("key *").click();
    await this.page.getByLabel("key *").fill("lifecycle");
    await this.page.getByLabel("key *").press("Tab");
    await this.page.getByLabel("value").fill("experimental");
    await this.page.getByRole("button", { name: "Add rule" }).click();
    await this.page.getByLabel("Open").nth(4).click();
    await this.page.getByText("HAS_LABEL").click();
    await this.page.getByLabel("label *").click();
    await this.page.getByLabel("label *").fill("partner");
    await this.page.getByTestId("save-conditions").click();

    await this.uiHelper.verifyText("Configure access (3 rules)");
    await this.uiHelper.clickButton("Next");

    await this.uiHelper.verifyHeading("Review and create");
    await this.uiHelper.verifyText("Users and groups (2 users, 1 group)");

    await this.uiHelper.verifyText("Permission policies (1)");
    await this.uiHelper.verifyText("3 rules");

    await this.uiHelper.clickButton("Create");
    await this.uiHelper.verifyText(
      "Role role:default/test-role created successfully",
    );
  }

  async createRoleWithNotPermissionPolicy(name: string) {
    await this.uiHelper.clickButton("Create");

    await this.uiHelper.verifyHeading("Create role");

    await this.page.fill(ROLE_FORM_COMPONENTS.roleName, name);
    await this.uiHelper.clickButton("Next");
    await this.page.fill(ROLE_FORM_COMPONENTS.addUsersAndGroups, "guest user");
    await this.page.click(ROLE_FORM_COMPONENTS.selectMember("Guest User"));
    await this.page.fill(ROLE_FORM_COMPONENTS.addUsersAndGroups, "tara");
    await this.page.click(ROLE_FORM_COMPONENTS.selectMember("Tara MacGovern"));
    await this.page.fill(ROLE_FORM_COMPONENTS.addUsersAndGroups, "Backstage");
    await this.page.click(ROLE_FORM_COMPONENTS.selectMember("Backstage"));
    await this.uiHelper.verifyHeading("Users and groups (2 users, 1 group)");
    await this.uiHelper.clickButton("Next");

    await this.page.click(
      ROLE_FORM_COMPONENTS.selectPermissionPolicyPlugin(0),
      {
        timeout: 100000,
      },
    );
    await this.uiHelper.optionSelector("catalog");

    await this.page.click(
      ROLE_FORM_COMPONENTS.selectPermissionPolicyPermission(0),
      {
        timeout: 100000,
      },
    );
    await this.uiHelper.optionSelector("catalog-entity");

    await this.page.getByLabel("configure-access").click();
    await this.page.getByRole("button", { name: "Not" }).click();
    await this.page.getByTestId("rules-sidebar").getByLabel("Open").click();
    await this.page.getByText("HAS_SPEC").click();
    await this.page.getByLabel("key *").click();
    await this.page.getByLabel("key *").fill("lifecycle");
    await this.page.getByLabel("key *").press("Tab");
    await this.page.getByLabel("value").fill("experimental");
    await this.page.getByTestId("save-conditions").click();
    await this.uiHelper.verifyText("Configure access (1 rule)");
    await this.page.getByTestId("nextButton-2").click();
    await this.uiHelper.verifyText("Permission policies (1)");
    await this.uiHelper.verifyText("1 rule");
    await this.uiHelper.clickButton("Create");
    await this.uiHelper.verifyText("role:default/test-role");
  }

  async deleteRole(name: string) {
    await this.uiHelper.openSidebar("RBAC");
    await this.uiHelper.filterInputPlaceholder(name);
    const button = this.page.locator(ROLE_LIST_COMPONENTS.deleteRole(name));
    await button.waitFor({ state: "visible" });
    await button.click();
    await this.uiHelper.verifyHeading("Delete this role?");
    await this.page.locator(DELETE_ROLE_COMPONENTS.roleName).click();
    await this.page.fill(DELETE_ROLE_COMPONENTS.roleName, name);
    await this.uiHelper.clickButton("Delete");

    await this.uiHelper.verifyText(`Role ${name} deleted successfully`);
    await this.page.locator(HOME_PAGE_COMPONENTS.searchBar).fill(name);
    await this.uiHelper.verifyHeading("All roles (0)");
  }
}

interface PolicyComplete {
  entityReference: string;
  permission: string;
  policy: string;
  effect: string;
}

interface Policy {
  permission: string;
  policy: string;
  effect: string;
}

interface Role {
  memberReferences: string[];
  name: string;
}

export class Response {
  private authToken: string;
  private simpleRequest: { headers: { authorization: string } };

  constructor(authToken: string) {
    this.authToken = authToken;
    this.simpleRequest = {
      headers: {
        authorization: authToken,
      },
    };
  }

  getSimpleRequest() {
    return this.simpleRequest;
  }

  editPolicyRequest(oldPolicy: Policy[], newPolicy: Policy[]) {
    return {
      data: {
        oldPolicy,
        newPolicy,
      },
      headers: {
        authorization: this.authToken,
      },
    };
  }

  createOrDeletePolicyRequest(additions: PolicyComplete[]) {
    return {
      data: additions,
      headers: {
        authorization: this.authToken,
      },
    };
  }

  editRoleRequest(oldRole: Role, newRole: Role) {
    return {
      data: {
        oldRole,
        newRole,
      },
      headers: {
        authorization: this.authToken,
      },
    };
  }

  createRoleRequest(role: Role) {
    return {
      data: role,
      headers: {
        authorization: this.authToken,
        "Content-Type": "application/json",
      },
    };
  }

  async removeMetadataFromResponse(response: APIResponse) {
    const responseJson = await response.json();
    const responseClean = responseJson.map((list: { metadata: object }) => {
      delete list.metadata;
      return list;
    });
    return responseClean;
  }

  async checkResponse(response: APIResponse, expected: string) {
    const cleanResponse = await this.removeMetadataFromResponse(response);
    const expectedJson = JSON.parse(expected);
    expect(cleanResponse).toEqual(expectedJson);
  }
}
