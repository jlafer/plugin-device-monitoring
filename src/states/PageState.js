import {
  SET_MY_PAGE_STATE
} from './actions';
  
const initialState = {
  myPageState: 'INACTIVE'
};

export default function reduce(state = initialState, action) {
  switch (action.type) {
    case SET_MY_PAGE_STATE:
      return {...state, myPageState: action.payload};
    default:
      return state;
  }
}
