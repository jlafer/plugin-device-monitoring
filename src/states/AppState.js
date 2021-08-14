import * as R from 'ramda';
import {
  SET_SERVERLESS_URI, SET_CURRENT_TASK, SET_SYNC_CLIENT,
  ADD_VOICE_WARNING_STATE, REMOVE_VOICE_WARNING_STATE
} from './actions';

const initialState = {
  currentTask: null,
  serverlessUri: null,
  syncClient: null,
  voiceWarningStates: {}
};

export default function reduce(state = initialState, action) {
  switch (action.type) {
    case ADD_VOICE_WARNING_STATE:
      return {
        ...state,
        voiceWarningStates: R.assoc(action.payload, {}, state.voiceWarningStates)
      };
    case REMOVE_VOICE_WARNING_STATE:
      return {
        ...state,
        voiceWarningStates: R.dissoc(action.payload, state.voiceWarningStates)
      };
    case SET_SERVERLESS_URI:
      return {
        ...state,
        serverlessUri: action.payload
      };
    case SET_CURRENT_TASK:
      return {
        ...state,
        currentTask: action.payload
      };
    case SET_SYNC_CLIENT:
      return {
        ...state,
        syncClient: action.payload
      };
    default:
      return state;
  }
}
