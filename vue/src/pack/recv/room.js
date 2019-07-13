import inject from './inject';

// eslint-disable-next-line import/prefer-default-export
export const room = inject((status, packet, { commit, dispatch }, router) => {
  const { data } = packet;

  switch (status) {
    case 'info':
      commit('hall/SET_HALL_ROOM_INFO', data);
      break;
    case 'enter':
      commit('user/SET_USER_ROOM_ID', data);
      dispatch('hall/enterRoom', data).then((path) => {
        router.push(path);
      });
      break;
    case 'begin':
      commit('hall/SET_HALL_ROOM_INFO', data);
      break;
    case 'message':
      commit('room/SET_ROOM_MESSAGE', data);
      break;
    default:
      break;
  }
});
