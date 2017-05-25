/**
 * Created by SwiftJ on 17/1/27.
 */

const state = {
  users: [],
  messages: []
}

const getters = {
  users: state => state.users, // 对应所有用户
  messages: state => state.messages // 对应大厅的所有信息
}

const actions = {
  clearMessage({ commit }) {
    commit('Hall.CLEARMESSAGE')
  }
}

const mutations = {
  'Hall.ADDMESSAGE'(state, message) { // Hall大厅.ADDMESSAGE添加信息
    state.messages.push(message)
  },
  'Hall.CLEARMESSAGE'(state) {
    state.messages.splice(0)
  },
  'Hall.USERENTER'(state, user) {
    state.users.push(user)
  },
  'Hall.USERALL'(state, users) {
    state.users.push.apply(state.users, users)
  },
  'Hall.USERLEAVE'(state, id) {
    var delIndex = -1
    for(let [index, user] of state.users.entries()) {

      if (user.u_id === id) {
        console.log(user)
        delIndex = index
      }
    }
    if (delIndex > -1) {
      state.users.splice(delIndex, 1)
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
