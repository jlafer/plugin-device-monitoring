import { combineReducers } from 'redux';

import {
  SET_CURRENT_TASK, SET_EXECUTION_CONTEXT, SET_SYNC_CLIENT,
  SET_MY_PAGE_STATE,
  ADD_CALL, REMOVE_CALL, ADD_VOICE_WARNING_STATE, REMOVE_VOICE_WARNING_STATE
} from './actions';
import appStateReducer from "./AppState";
import pageStateReducer from "./PageState";

// TODO give your plugin's redux store a unique namespace
export const namespace = 'plugin-device-monitoring';

export default combineReducers({
  pageState: pageStateReducer,
  appState: appStateReducer
});

export const setExecutionContext = (payload) => ({
  type: SET_EXECUTION_CONTEXT, payload
});

export const setSyncClient = (payload) => ({
  type: SET_SYNC_CLIENT, payload
});

export const setCurrentTask = (payload) => ({
  type: SET_CURRENT_TASK, payload
});

// a sample Redux action creator
export const setMyPageState = (payload) => ({
  type: SET_MY_PAGE_STATE, payload
});

export const addCall = (callSid, startTS) => ({
  type: ADD_CALL, payload: {callSid, startTS}
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
