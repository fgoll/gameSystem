/**
 * Created by SwiftJ on 17/1/26.
 */
const state = {
    fd: null,
    id: null,
    room_id: null,
    rolename: null,
    avatar: null,
    status: null,
    trusteeship: null,
    game_type: null
}

const getters = {
    fd: state => state.fd,
    user: state => state
}

const actions = {

}

const mutations = {
  // 设置变量的值  使用store.commit 来触发 就像调用方法一样 如果使用store.commit('User.FD', -2)
  // 就是将state的fd设为-2 用这种方法 页面会跟着刷新
    'User.FD'(state, fd) {
        state.fd = fd
    },
    'User.ID'(state, id) {
        state.id = id
    },
    'User.ROOM.ID'(state, room_id) {
        state.room_id = room_id
    },
    'User.ROLENAME'(state, rolename) {
        state.rolename = rolename
    },
    'User.STATUS'(state, status) {
        state.status = status
    },
    'User.AVATAR'(state, avatar) {
        state.avatar = avatar
    },
    'User.TRUSTEESHIP'(state, trusteeship) {
      state.trusteeship = trusteeship
    }
}

export default {
    state,
    getters,
    actions,
    mutations,
}
