/* eslint-disable no-case-declarations */
import Bus from '@/utils/bus';
import inject from './inject';

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
      dispatch('room/begin', 60);
      break;
    case 'willnext':
      commit('room/SET_ROOM_DURATION', data);
      break;
    case 'next':
      commit('hall/SET_HALL_ROOM_INFO', data);
      dispatch('room/begin', 60);
      break;
    case 'message':
      commit('room/SET_ROOM_MESSAGE', data);
      break;
    case 'leave':
      commit('user/SET_USER_ROOM_ID', null);
      dispatch('room/clearMessage');
      router.push('/hall');
      break;
    default:
      break;
  }
});

export const draw = inject((status, packet) => {
  const { data } = packet;

  switch (status) {
    case 'begin':
      Bus.$emit('drawstart', data);
      break;
    case 'move':
      Bus.$emit('drawmove', data);
      break;
    case 'end':
      Bus.$emit('drawend');
      break;
    case 'clear':
      Bus.$emit('drawclear');
      break;
    default:
      break;
  }
});

export const chess = inject((status, packet, { commit }) => {
  const { data } = packet;

  const roleMap = {
    black: 1,
    white: 2,
  };

  switch (status) {
    case 'down':
      const { i: x, j: y, army_type: role } = data;

      commit('chess/ADD_CHESSMAN', { position: [x, y], role: roleMap[role] });
      break;

    default:
      break;
  }
});
