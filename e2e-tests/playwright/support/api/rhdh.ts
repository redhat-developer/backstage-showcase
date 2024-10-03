import { request } from '@playwright/test';
import { RhdhAuthHack } from './rhdh-auth-hack';
import playwrightConfig from '../../../playwright.config';

export class RhdhApi {
  private static API_URL = `${playwrightConfig.use.baseURL}/api/`;

  async getRoles() {
    const req = await this._permission().roles();
    return req.json();
  }

  async getPolicies() {
    const req = await this._permission().policies();
    return req.json();
  }

  private async _myContext() {
    const auth = await new RhdhAuthHack().getApiToken();
    return request.newContext({
      baseURL: RhdhApi.API_URL,
      extraHTTPHeaders: {
        authorization: auth,
      },
    });
  }

  private _permission() {
    let url = `/permission/`;
    return {
      roles: async () => {
        url += 'roles';
        return (await this._myContext()).get(url);
      },
      policies: async () => {
        url += 'policies';
        return (await this._myContext()).get(url);
      },
    };
  }
}
