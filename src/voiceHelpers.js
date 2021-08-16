import * as R from 'ramda';
import {addCall, removeCall, addVoiceWarningState, removeVoiceWarningState} from './states';

export const voiceConnectedHandler = R.curry((manager, config, connection) => {
  console.log('----------------------connected');
  const {parameters} = connection;
  const {CallSid} = parameters;
  const ts = Date.now();
  const {store} = manager;
  store.dispatch( addCall(CallSid, ts) );

  connection.on('warning', (warningName, warningData) => {
    console.log(`----------------------a ${warningName} warning has been generated:`, warningData);
    const {parameters} = connection;
    const {CallSid: callSid} = parameters;
    const ts = Date.now();
    const {store} = manager;
    const payload = {callSid, warningName, warningData, ts, config};
    store.dispatch( addVoiceWarningState(payload) );
  });
  connection.on('warning-cleared', (warningName) => {
    console.log(`----------------------the ${warningName} warning has cleared`);
    const {parameters} = connection;
    const {CallSid: callSid} = parameters;
    const {store} = manager;
    const ts = Date.now();
    const payload = {callSid, warningName, ts};
    store.dispatch( removeVoiceWarningState(payload) );
  });  
  connection.on('disconnect', (disConnection) => {
    console.log(`----------------------the call disconnected`, disConnection);
    const {parameters} = disConnection;
    const {CallSid} = parameters;
    const ts = Date.now();
    const {store} = manager;
    store.dispatch( removeCall(CallSid, ts) );
  });  
});