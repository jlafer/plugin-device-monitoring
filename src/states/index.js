import { combineReducers } from 'redux';

import {
  SET_EXECUTION_CONTEXT, SET_SYNC_CLIENT,
  ADD_CALL, REMOVE_CALL, ADD_VOICE_WARNING_STATE, REMOVE_VOICE_WARNING_STATE
} from './actions';
import appStateReducer from "./AppState";

export const namespace = 'plugin-device-monitoring';

export default combineReducers({
  appState: appStateReducer
});

export const setExecutionContext = (payload) => ({
  type: SET_EXECUTION_CONTEXT, payload
});

export const setSyncClient = (payload) => ({
  type: SET_SYNC_CLIENT, payload
});

export const addCall = (payload) => ({
  type: ADD_CALL, payload
});

export const removeCall = (callSid, endTS) => ({
  type: REMOVE_CALL, payload: {callSid, endTS}
});

export const addVoiceWarningState = (payload) => ({
  type: ADD_VOICE_WARNING_STATE, payload
});

export const removeVoiceWarningState = (payload) => ({
  type: REMOVE_VOICE_WARNING_STATE, payload
});
