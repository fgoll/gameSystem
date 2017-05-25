/**
 * Created by SwiftJ on 17/1/31.
 */
let timerId;
export const countdown = function({dispatch, state}) {
  timerId = setInterval(function() {
    dispatch('COUNT_DOWN');
    if(state.status < 1){
      clearInterval(timerId);
    }
  }, 1000);
};
