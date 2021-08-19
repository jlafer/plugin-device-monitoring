import * as R from 'ramda';
import {Notifications} from '@twilio/flex-ui';
import {namespace, addCall, removeCall, addVoiceWarningState, removeVoiceWarningState} from './states';

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

    const {latestCall} = store.getState()[namespace].appState;
    const voiceIssues = callWarrantsResponse(config, latestCall);
    console.log('-----------------voiceIssues', voiceIssues);
    if ( voiceIssues.respond ) {
      console.log('-----------------call meets issue threshold', latestCall);
      console.log('  issues:', voiceIssues);
      respondToIssue(config, manager, latestCall, voiceIssues);
    }
  });  
});

const callWarrantsResponse = (config, call) => {
  const issues = [];
  const {shortCall, duration, voiceWarningStatesDur, currWarningStates} = call;
  console.log(`----------------------the config`, config);
  console.log(`----------------------the call`, call);
  if (shortCall) {
    issues.push({reason: 'short call', duration, threshold: config.shortCallThreshold});
  }
  const warningInProgress = isWarningInProgress(currWarningStates);
  if (warningInProgress && config.endedInWarningIsTrigger) {
    const warnings = R.keys(currWarningStates).join(', ');
    issues.push({reason: 'call ended under warning', duration, warnings});
  }
  const warningDurPct = (duration > 0) ? (voiceWarningStatesDur / duration) : 0;
  if (warningDurPct > config.warningDurPctThreshold) {
    issues.push({reason: 'call warning condition pct', duration, warningDurPct, threshold: config.warningDurPctThreshold});
  }
  const respond = (issues.length > 0);
  return {respond, issues};
};

const respondToIssue = (config, manager, latestCall, voiceIssues) => {
  const issuesStr = R.map(R.prop('reason'), voiceIssues.issues).join(', ');
  console.log(`----------------------this is me responding`);
  if (config.alertAgent) {
    alertAgent(issuesStr);
  }
};

const alertAgent = (issuesStr) => {
  console.log(`---------------------- issuesStr: ${issuesStr}`);
  Notifications.showNotification("VoiceWarning", {issuesStr});
};

export const isWarningInProgress = (warningStates) => {
  return R.keys(warningStates).length > 0;
};
