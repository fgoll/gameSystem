/* eslint-disable no-shadow */

const state = {
  messages: [],
  duration: 60,
  timeover: false,
};

let timer;

const actions = {
  clearMessage({ commit }) {
    commit('SET_ROOM_MESSAGE');
  },

  countdown({ dispatch, commit, state }) {
    if (state.duration > 0) {
      timer = setTimeout(() => {
        commit('SET_ROOM_DURATION', state.duration - 1);
        dispatch('countdown');
      }, 1000);
    }
  },

  begin({ dispatch, commit }, duration) {
    if (timer) clearTimeout(timer);
    commit('SET_ROOM_DURATION', duration);
    dispatch('countdown');
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

  SET_ROOM_DURATION: (state, duration) => {
    state.duration = duration;
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
