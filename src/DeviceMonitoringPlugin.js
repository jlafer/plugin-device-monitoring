import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
import {getPluginConfiguration} from 'jlafer-flex-util';

import reducers, {
  namespace, setExecutionContext
} from './states';
import {verifyAndFillConfiguration} from './configHelpers';
import {voiceConnectedHandler} from './voiceHelpers';

const PLUGIN_NAME = 'DeviceMonitoringPlugin';

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

    voiceClient.on('incoming', voiceConnectedHandler(manager, config));
    voiceClient.on('error', (twilioError, call) => {
      console.log('----------------------an error has occurred:', twilioError);
      console.log('------------------------on call:', call);
    });
  }
}
