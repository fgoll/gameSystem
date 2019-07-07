import Vue from 'vue';
import Vuex from 'vuex';

import user from './modules/user';
import hall from './modules/hall';

import getters from './getters';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    user,
    hall,
  },
  getters,
});

export default store;
