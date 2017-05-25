/**
 * Created by SwiftJ on 17/1/26.
 */
import Vue from 'vue'
import Vuex from 'vuex'

import user from './modules/user'
import hall from './modules/hall'
import room from './modules/room'

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
      user,
      hall,
      room,
    },
    strict: true,
})

export default store
