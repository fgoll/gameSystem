/**
 * Created by SwiftJ on 17/1/29.
 */
import Vue from 'vue'
import { countdown } from './action'
import { send } from '../../game/client'

const state = {
  rooms: [],
  messages: [],
  duration: 60, // 60s
  timeover: false,
  chessBoard: [],
  can_chess: false,
  auto_down: 0
}

let timerId = null

const getters = {
  rooms: state => state.rooms,
  room_messages: state => state.messages,
  duration: state => state.duration,
  timeover: state => state.timeover,
  chessBoard: state => state.chessBoard,
  can_chess: state => state.can_chess,
  auto_down: state => state.auto_down
}

const actions = {
  clearRoomMessage({ commit }) {
    commit('Room.CLEARMESSAGE')
  },
  countdown({commit, state}) {
    commit('TIME_OVER', false)
    if (timerId) clearInterval(timerId);
    timerId = setInterval(function() {
      commit('COUNT_DOWN');

      if(state.duration < 1){
        clearInterval(timerId);
        commit('TIME_OVER', true)

      }
    }, 1000);
  },
  clearCountDown({commit}) {
    if (timerId) clearInterval(timerId);
  }
}

const mutations = {
  'Room.ADDMESSAGE'(state, message) {
    state.messages.push(message)
  },
  'Room.CLEARMESSAGE'(state) {
    state.messages.splice(0)
  },
  'Room.INIT'(state, rooms) {
    state.rooms = rooms
  },
  'Room.SETINFO'(state, room) {
    let id = room.r_id
    let room_info = state.rooms[id]
    if (!room_info) return null
    let status = room.status
    if (status) room_info.status = status
    Vue.set(state.rooms, id, room_info)
    let users = room.users
    for (var i = 0; i < users.length; i ++) {
      let user = users[i]
      if ((room_info.users[i] != user)) {

        Vue.set(room_info.users, i, user)
      }
    }
  },
  'Room.BEGIN'(state) {
    state.duration = 60
  },
  'COUNT_DOWN'(state) {
    state.duration--;
  },
  'SET_COUNTDOWN'(state, duration) {
    state.duration = duration
  },
  'TIME_OVER'(state, over) {
    state.timeover = over
  },
  'Chess.BEGIN'(state) {
    for (var i= 0;i<15;i+=1){
      state.chessBoard[i]=[];
      for (var j=0;j<15;j+=1){
        state.chessBoard[i][j]=0;  //遍历数组，值初始化为0；
      }
    }
  },
  'Chess.WHITE'(state, point) {
    let x = point.x, y = point.y
    state.chessBoard[x][y] = -1
  },
  'Chess.BLACK'(state, point) {
    let x = point.x, y = point.y
    state.chessBoard[x][y] = 1
  },
  'Chess.CANDOWN'(state) {
    state.can_chess = true
  },
  'Chess.CANTDOWN'(state) {
    state.can_chess = false
  },
  'Chess.AUTO'(state, chess) {
    state.auto_down = chess
  },
  'Chess.RESET'(state) {
    state.auto_down = 0
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
}
