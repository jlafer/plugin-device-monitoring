import * as R from 'ramda';
import {
  SET_EXECUTION_CONTEXT, SET_SYNC_CLIENT,
  ADD_CALL, REMOVE_CALL,
  ADD_VOICE_WARNING_STATE, REMOVE_VOICE_WARNING_STATE
} from './actions';
import {isWarningInProgress} from '../voiceHelpers';

const initialState = {
  callsCnt: 0,
  callsWithWarningCnt: 0,
  shortCallsCnt: 0,
  callsWithErrorCnt: 0,
  totalVoiceWarningStatesDur: 0,
  calls: {},
  serverlessUri: null,
  syncClient: null
};

export default function reduce(state = initialState, action) {
  switch (action.type) {
    case ADD_CALL:
      return addCall(state, action.payload);
    case ADD_VOICE_WARNING_STATE:
      return addVoiceWarningState(state, action.payload);
    case REMOVE_CALL:
      return removeCall(state, action.payload);
    case REMOVE_VOICE_WARNING_STATE:
      return removeVoiceWarningState(state, action.payload);
    case SET_EXECUTION_CONTEXT:
      return R.mergeRight(state, action.payload);
    case SET_SYNC_CLIENT:
      return {...state, syncClient: action.payload};
    default:
      return state;
  }
}

const addCall = (state, payload) => {
  const {callSid, dnis, startTS} = payload;
  const callsCnt = state.callsCnt + 1;
  //TODO
  const callerId = '+12088747271'
  const call = initiateCall(dnis, callerId, startTS);
  const calls = R.assoc(callSid, call, state.calls);
  return {...state, callsCnt, calls};
};

const initiateCall = (dnis, callerId, startTS) => {
  return {
    dnis, callerId, startTS, warnStartTS: null, currWarningStates: {}, voiceWarningStatesDur: 0,
    errorCondition: null
  };
};

const removeCall = (state, payload) => {
  const {callSid, endTS} = payload;
  const call = state.calls[callSid];
  if (!call) {
    console.warn('removeCall: call not found in state???', payload);
    return state;
  }
  const {startTS, warnStartTS, currWarningStates} = call;
  call.endTS = endTS;
  call.duration = endTS - startTS;
  call.shortCall = (call.duration < state.config.shortCallThreshold);
  const shortCallsCnt = call.shortCall ? state.shortCallsCnt + 1 : state.shortCallsCnt;
  const warningInProgress = isWarningInProgress(currWarningStates);
  if (warningInProgress) {
    call.voiceWarningStatesDur += (endTS - warnStartTS);
  }
  const callsWithWarningCnt = (call.voiceWarningStatesDur > 0)
    ? state.callsWithWarningCnt + 1 : state.callsWithWarningCnt;
  const callsWithErrorCnt = (call.errorCondition)
    ? state.callsWithErrorCnt + 1 : state.callsWithErrorCnt;
  return {
    ...state,
    calls: R.dissoc(callSid, state.calls),
    callsCnt: state.callsCnt + 1,
    callsWithWarningCnt,
    callsWithErrorCnt,
    shortCallsCnt,
    totalVoiceWarningStatesDur: state.totalVoiceWarningStatesDur + call.voiceWarningStatesDur,
    latestCall: call
  };
};

const addVoiceWarningState = (state, payload) => {
  const {callSid, warningName, warningData, ts, config} = payload;
  const call = state.calls[callSid];
  if (!call) {
    console.warn('addVoiceWarningState: call not found in state???', payload);
    return state;
  }
  const warningInProgress = isWarningInProgress(call.currWarningStates);
  if ( !thresholdTriggered(config, state, warningName, warningData) )
    return state;
  const warnStartTS = (warningInProgress) ? call.warnStartTS : ts;

  // ice-connectivity-lost seems to reliably result in a dropped call
  // there may be other warnings that do also
  const errorCondition = (warningName === 'ice-connectivity-lost')
    ? warningName : state.errorCondition;

  const callUpdate = {
    ...call,
    currWarningStates: R.assoc(warningName, warningData, call.currWarningStates),
    warnStartTS,
    errorCondition
  };
  const calls = R.assoc(callSid, callUpdate, state.calls);
  return {...state, calls};
};

const removeVoiceWarningState = (state, payload) => {
  const {callSid, warningName, ts} = payload;
  const call = state.calls[callSid];
  if (!call) {
    console.warn('removeVoiceWarningState: call not found in state???', payload);
    return state;
  }
  const warningData = call.currWarningStates[warningName];
  // if there's no record of that warning being active (as can happen if
  // the warning event value was under a threshold), do nothing
  if (!warningData)
    return state;
  const {warnStartTS, currWarningStates} = call;
  const newWarningStates = R.dissoc(warningName, currWarningStates);
  const warningInProgress = isWarningInProgress(newWarningStates);
  const voiceWarningStatesDur = warningInProgress
    ? call.voiceWarningStatesDur : call.voiceWarningStatesDur + (ts - warnStartTS);
  const newWarnStartTS = warningInProgress ? warnStartTS : null;
  const errorCondition = (warningName === 'ice-connectivity-lost')
    ? null : state.errorCondition;
  const callUpdate = {
    ...call,
    currWarningStates: newWarningStates,
    voiceWarningStatesDur,
    warnStartTS: newWarnStartTS,
    errorCondition
  };
  const calls = R.assoc(callSid, callUpdate, state.calls);
  return {...state, calls};
};

const thresholdTriggered = (config, state, warningName, warningData) => {
  const thresholdActive = R.includes(warningName, [
    'high-packet-loss',
    'high-packets-lost-fraction',
    'high-jitter',
    'high-rtt',
    'low-mos'
  ]);
  if ( !thresholdActive )
    return true;
  const {threshold, values} = warningData;
  const value = calcValue(threshold, values);
  switch (warningName) {
    case 'high-packet-loss':
    case 'high-packets-lost-fraction':
      return (value > config.highPacketsLostThreshold);
    case 'high-jitter':
      return (value > config.highJitterThreshold);
    case 'high-rtt':
      return (value > config.highRttThreshold);
    case 'low-mos':
      return (value < config.lowMosThreshold);
  }
};

const calcValue = (threshold, values) => {
  switch (threshold.name) {
    case 'maxAverage':
      return R.sum(values) / values.length;
    case 'max':
      return R.reduce(
        (accum, elem) => (elem > accum) ? elem : accum,
        0, values
      );
    case 'min':
      return R.reduce(
        (accum, elem) => (elem < accum) ? elem : accum,
        999, values
      );
    default:
      console.log(`+++++++++++++++++++++ got threshold type = ${threshold.name}`);
      return 0;
  }
};
