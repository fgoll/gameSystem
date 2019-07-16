/* eslint-disable no-shadow */
import Vue from 'vue';

const state = {
  users: [],
  messages: [],
  rooms: [],
  roomsMap: {},
};

const actions = {
  enterRoom({ state }, id) {
    return new Promise((resolve) => {
      const roomType = state.roomsMap[+id].room.game_type;

      resolve(roomType);
    });
  },
};

const getRoomsMap = (rooms) => {
  const map = {};
  for (let i = 0; i < rooms.length; i++) {
    map[rooms[i].r_id] = {
      index: i,
      room: rooms[i],
    };
  }
  return map;
};

const mutations = {
  SET_HALL_ROOM: (state, rooms) => {
    state.rooms = rooms;
    state.roomsMap = getRoomsMap(rooms);
  },
  SET_HALL_ROOM_INFO: (state, newRoom) => {
    const id = newRoom.r_id;
    const { room } = state.roomsMap[id];
    if (!room) return;
    const { status } = newRoom;
    if (status) room.status = status;
    // Vue.set(state.rooms, index, room);
    const { users } = newRoom;
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      if (room.users[i] !== user) {
        Vue.set(room.users, i, user);
      }
    }
    state.roomsMap = getRoomsMap(state.rooms);
  },
  SET_HALL_MESSAGE: (state, message) => {
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
