import {callApiFormEncoded} from 'jlafer-flex-util';

export const mkGetSyncToken = (url, manager, identity) =>
  () => {
    const data = {Identity: identity, Token: manager.user.token};
    return callApiFormEncoded(url, 'post', data);
  };

export const mkUpdateTokenInSyncClient = (getSyncToken, syncClient, reason) =>
  async () => {
    const syncTokenResponse = await getSyncToken();
    console.log(`-----------updateTokenInSyncClient: new token = ${syncTokenResponse.token}`);
    console.log(`because ${reason}`);
    syncClient.updateToken(syncTokenResponse.token);
  };
