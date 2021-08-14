import * as R from 'ramda';
import {addVoiceWarningState, removeVoiceWarningState} from './states';

export const voiceConnectedHandler = R.curry((manager, connection) => {
  console.log('----------------------connected');
  const {parameters} = connection;
  const {CallSid} = parameters;

  connection.on('warning', (warningName, warningData) => {
    console.log(`----------------------a ${warningName} warning has been generated:`, warningData);
    const {store} = manager;
    store.dispatch( addVoiceWarningState(warningName) );
  });
  connection.on('warning-cleared', (warningName) => {
    console.log(`----------------------the ${warningName} warning has cleared`);
    const {store} = manager;
    store.dispatch( removeVoiceWarningState(warningName) );
  });  
  connection.on('disconnect', (disConnection) => {
    console.log(`----------------------the call disconnected`, disConnection);
    const {parameters} = disConnection;
    const {CallSid} = parameters;
  });  
});