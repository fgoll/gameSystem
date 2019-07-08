import inject from './inject';

export const user = inject((status, packet, { commit }) => {
  const { data } = packet;

  switch (status) {
    case 'enter':
      commit('hall/SET_HALL_USER', data);
      break;
    case 'all':
      commit('hall/SET_HALL_USER', data);
      break;
    case 'leave':
      commit('hall/DEL_HALL_USER', data.id);
      break;
    default:
      break;
  }
});

export const hall = inject((status, packet, { commit }) => {
  const { data } = packet;

  if (status === 'message') {
    commit('hall/SET_HALL_MESSAGE', data);
  } else if (status === 'init') {
    commit('hall/SET_HALL_ROOM', data);
  }
});
