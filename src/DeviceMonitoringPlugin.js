import * as R from 'ramda';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
import {getPluginConfiguration} from 'jlafer-flex-util';

import reducers, {
  namespace, setExecutionContext, setLatestCaller
} from './states';
import {verifyAndFillConfiguration} from './configHelpers';
import {voiceConnectedHandler} from './voiceHelpers';

const PLUGIN_NAME = 'DeviceMonitoringPlugin';

const afterAcceptTask = R.curry((manager, payload) => {
  const {store} = manager;
  const {dispatch} = store;
  const {task} = payload;
  const {taskChannelUniqueName, attributes} = task;
  if (taskChannelUniqueName   === 'voice') {
    dispatch( setLatestCaller(attributes.from) );
  };
});

export default class DeviceMonitoringPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  async init(flex, manager) {
    console.log(`${PLUGIN_NAME}: initializing in Flex ${Flex.VERSION} instance`);
    const {store, voiceClient} = manager;
    const rawConfig = getPluginConfiguration(manager, PLUGIN_NAME);
    const config = verifyAndFillConfiguration(rawConfig);
    store.addReducer(namespace, reducers);
    const serverlessUri = process.env.REACT_APP_SERVERLESS_URI;
    console.log(`${PLUGIN_NAME}: serverless uri = ${serverlessUri}`);
    store.dispatch( setExecutionContext({serverlessUri, config}) );

    console.log(`${PLUGIN_NAME}: configuration:`, config);

    manager.strings.voiceAlert = 'Possible voice network quality issue detected: {{issuesStr}}';
    flex.Notifications.registerNotification({
      id: 'VoiceWarning',
      content: 'voiceAlert',
      type: flex.NotificationType.warning
    });

    flex.Actions.addListener("afterAcceptTask", afterAcceptTask(manager));

    voiceClient.on('incoming', voiceConnectedHandler(manager, config));
    voiceClient.on('error', (twilioError, call) => {
      console.log(`${PLUGIN_NAME}: an error has occurred:`, twilioError);
      console.log(`${PLUGIN_NAME}: on call:`, call);
    });
  }
}
