import { connect } from 'react-redux';

import {
  namespace, setMyPageState
} from '../../states';
import MyPage from './MyPage';

const mapStateToProps = (state, ownProps) => {
  const {currentTask} = state[namespace].appState;
  const {
    myPageState
  } = state[namespace].pageState;

  return {
    currentTask,
    myPageState,
    ...ownProps
  };
};

export default connect(
  mapStateToProps,
  {
    setMyPageState
  }
)(MyPage);