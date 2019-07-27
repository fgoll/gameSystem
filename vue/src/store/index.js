import Vue from 'vue';
import Vuex from 'vuex';

import user from './modules/user';
import hall from './modules/hall';
import room from './modules/room';
import chess from './modules/chess';

import getters from './getters';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    user,
    hall,
    room,
    chess,
  },
  getters,
});

export default store;
