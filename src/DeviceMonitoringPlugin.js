import * as R from 'ramda';
import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
import { SyncClient } from "twilio-sync";
import {getPluginConfiguration} from 'jlafer-flex-util';

import MyPage from "./components/MyPage/MyPageContainer";
import SidebarMyButton from './components/SidebarMyButton/SidebarMyButton';
import reducers, {
  namespace, setCurrentTask, setServerlessUri, setSyncClient
} from './states';
import {verifyAndFillConfiguration} from './configHelpers';
import {mkGetSyncToken, mkUpdateTokenInSyncClient} from './syncHelpers';
import {voiceConnectedHandler} from './voiceHelpers';

const PLUGIN_NAME = 'DeviceMonitoringPlugin';

const afterCompleteTask = R.curry((manager, payload) => {
  const {dispatch} = manager.store;
  const {task} = payload;
  const {taskChannelUniqueName} = task;
  console.log(`${PLUGIN_NAME}.afterCompleteTask: task:`, task);
  if (taskChannelUniqueName === 'voice')
    dispatch( setCurrentTask(null) );
});

const getAndSaveSyncClient = async (getSyncToken, manager) => {
  const syncTokenResponse = await getSyncToken();
  const syncClient = new SyncClient(syncTokenResponse.token);
  syncClient.on(
    'tokenAboutToExpire',
    mkUpdateTokenInSyncClient(getSyncToken, syncClient, 'Sync token expiring')
  );
  const {dispatch} = manager.store;
  dispatch( setSyncClient(syncClient) );
  return syncClient;
};

export default class DeviceMonitoringPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  async init(flex, manager) {
    console.log(`${PLUGIN_NAME}: initializing in Flex ${Flex.VERSION} instance`);
    const {store, serviceConfiguration, voiceClient} = manager;
    const rawConfig = getPluginConfiguration(manager, PLUGIN_NAME);
    const config = verifyAndFillConfiguration(rawConfig);
    store.addReducer(namespace, reducers);
    const serverlessUri = process.env.REACT_APP_SERVERLESS_URI;
    console.log(`${PLUGIN_NAME}: serverless uri = ${serverlessUri}`);
    store.dispatch( setServerlessUri(serverlessUri) );

    const {ui_attributes} = serviceConfiguration;
    const {colorTheme, language} = ui_attributes;
    console.log(`${PLUGIN_NAME}: configuration:`, serviceConfiguration);

    flex.Actions.addListener("afterCompleteTask", afterCompleteTask(manager));

    // add a side-navigation button for presenting a custom view
    flex.SideNav.Content.add(<SidebarMyButton key="my-button" />);

    // add a custom view
    // Note: MyPage does not use serverlessUri but that's how you can pass it
    //   to a component that needs it to call a Serverless function
    flex.ViewCollection.Content.add(
      <Flex.View key="my-page" name="my-page">
        <MyPage serverlessUri={serverlessUri} />
      </Flex.View>
    );

    // get a Sync client for using Twilio Sync objects
    // NOTE: moving this code above the component additions above caused those
    //   components to not render???
    const mintSyncTokenUrl = `${serverlessUri}/get-sync-token`;
    const flexState = store.getState().flex;
    const worker = flexState.worker.source;
    const getSyncToken = mkGetSyncToken(mintSyncTokenUrl, manager, worker.sid);
    const syncClient = await getAndSaveSyncClient(getSyncToken, manager);

    // add listener to refresh Sync token when Flex token is updated
    manager.events.addListener(
      "tokenUpdated",
      mkUpdateTokenInSyncClient(getSyncToken, syncClient, 'Flex token updated')
    );

    voiceClient.on('incoming', voiceConnectedHandler(manager));
    voiceClient.on('error', (twilioError, call) => {
      console.log('----------------------an error has occurred:', twilioError);
      console.log('------------------------on call:', call);
    });
  }
}
