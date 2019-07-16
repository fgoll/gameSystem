import Vue from 'vue';
import Vuex from 'vuex';

import user from './modules/user';
import hall from './modules/hall';
import room from './modules/room';

import getters from './getters';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    user,
    hall,
    room,
  },
  getters,
});

export default store;
