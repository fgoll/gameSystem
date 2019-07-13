/* eslint-disable no-shadow */

const state = {
  messages: [],
  duration: 60,
  timeover: false,
};

const actions = {
  clearMessage({ commit }) {
    commit('SET_ROOM_MESSAGE');
  },
};

const mutations = {
  SET_ROOM_MESSAGE: (state, message) => {
    if (message) {
      state.messages.push(message);
    } else {
      state.messages = [];
    }
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
