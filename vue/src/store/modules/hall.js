/* eslint-disable no-shadow */

const state = {
  users: [],
  messages: [],
};

const actions = {
  clearMessage({ commit }) {
    commit('Hall.CLEARMESSAGE');
  },
};

const mutations = {
  SET_HALL_MESSAGE: (state, message) => { // Hall大厅.ADDMESSAGE添加信息
    if (message) {
      state.messages.push(message);
    } else {
      state.messages = [];
    }
  },
  SET_HALL_USER: (state, user) => {
    if (Array.isArray(user)) {
      state.users = [...state.users, ...user];
    } else {
      state.users.push(user);
    }
  },
  DEL_HALL_USER: (state, id) => {
    const index = state.users.findIndex(user => user.id === id);

    if (index > -1) {
      state.users.splice(index, 1);
    }
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
