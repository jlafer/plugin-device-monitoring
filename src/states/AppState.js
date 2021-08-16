import * as R from 'ramda';
import {
  SET_SERVERLESS_URI, SET_CURRENT_TASK, SET_SYNC_CLIENT,
  ADD_CALL, REMOVE_CALL,
  ADD_VOICE_WARNING_STATE, REMOVE_VOICE_WARNING_STATE
} from './actions';

const initialState = {
  callsCnt: 0,
  callsWithWarningCnt: 0,
  totalVoiceWarningStatesDur: 0,
  calls: {},
  currentTask: null,
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
    case SET_SERVERLESS_URI:
      return {...state, serverlessUri: action.payload};
    case SET_CURRENT_TASK:
      return {...state, currentTask: action.payload};
    case SET_SYNC_CLIENT:
      return {...state, syncClient: action.payload};
    default:
      return state;
  }
}

const addCall = (state, payload) => {
  const {callSid, startTS} = payload;
  const callsCnt = state.callsCnt + 1;
  const call = initiateCall(startTS);
  const calls = R.assoc(callSid, call, state.calls);
  return {...state, callsCnt, calls};
};

/*
  call {
    startTS: number,
    warningStartTS: number,
    currWarningStates: {}
    voiceWarningStatesDur: number
  }
*/

const initiateCall = (startTS) => {
  return {
    startTS, warnStartTS: null, currWarningStates: {}, voiceWarningStatesDur: 0
  };
};

const removeCall = (state, payload) => {
  const {callSid, endTS} = payload;
  const call = state.calls[callSid];
  if (!call) {
    console.warn('removeCall: call not found in state???', payload);
    return state;
  }
  const {startTS, warnStartTS, currWarningStates, voiceWarningStatesDur} = call;
  const callDur = endTS - startTS;
  const shortCall = (callDur < 20000);
  const shortCallsCnt = shortCall ? state.shortCallsCnt + 1 : state.shortCallsCnt;
  const warningInProgress = isWarningInProgress(currWarningStates);
  const callsWithWarningCnt = (call.voiceWarningStatesDur > 0)
    ? state.callsWithWarningCnt + 1 : state.callsWithWarningCnt;
  const finalWarningStatesDur = warningInProgress
    ? voiceWarningStatesDur + (endTS - warnStartTS) : voiceWarningStatesDur;
  return {
    ...state,
    calls: R.dissoc(callSid, state.calls),
    callsCnt: state.callsCnt + 1,
    callsWithWarningCnt,
    shortCallsCnt,
    totalVoiceWarningStatesDur: state.totalVoiceWarningStatesDur + finalWarningStatesDur
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
  const callUpdate = {
    ...call,
    currWarningStates: R.assoc(warningName, warningData, call.currWarningStates),
    warnStartTS
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
  const callUpdate = {
    ...call,
    currWarningStates: newWarningStates,
    voiceWarningStatesDur,
    warnStartTS: newWarnStartTS
  };
  const calls = R.assoc(callSid, callUpdate, state.calls);
  return {...state, calls};
};

const thresholdTriggered = (config, state, warningName, warningData) => {
  return true;
};

const isWarningInProgress = (warningStates) => {
  return R.keys(warningStates).length > 0;
};
