/* eslint-disable no-shadow */

const state = {
  fd: null,
  id: null,
  room_id: null,
  rolename: null,
  avatar: null,
  status: null,
  trusteeship: null,
  game_type: null,
};

const mutations = {

  SET_USER_FD: (state, fd) => {
    state.fd = fd;
  },
  SET_USER_ID: (state, id) => {
    state.id = id;
  },
  SET_USER_ROOM_ID: (state, roomId) => {
    state.room_id = roomId;
  },
  SET_USER_ROLENAME: (state, rolename) => {
    state.rolename = rolename;
  },
  SET_USER_STATUS: (state, status) => {
    state.status = status;
  },
  SET_USER_AVATAR: (state, avatar) => {
    state.avatar = avatar;
  },
  SET_USER_TRUSTEESHIP: (state, trusteeship) => {
    state.trusteeship = trusteeship;
  },
};

const actions = {
  login({ commit }, user) {
    return new Promise((resolve) => {
      commit('SET_USER_FD', user.w_id);
      commit('SET_USER_ID', user.u_id);
      commit('SET_USER_ROLENAME', user.rolename);
      commit('SET_USER_AVATAR', user.avatar);

      resolve();
    });
  },

  betop({ commit }) {
    return new Promise((resolve) => {
      commit('SET_USER_FD', null);
      resolve();
    });
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
