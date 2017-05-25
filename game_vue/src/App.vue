<template>
  <div id="app">
    <component :is="stage"></component>

  </div>
</template>

<script>
  // 导入各个组件
  import Login from './components/Login.vue' // Vue 实例
  import Hall from './components/Hall.vue'
  import Room from './components/Room.vue'
  import ChessRoom from './components/ChessRoom.vue'
  import UnoRoom from './components/UnoRoom.vue'
  import store from './store/store'

  import { mapGetters } from 'vuex'

  export default {
    name: 'app',
    components: { // 注册这些组件
      Login,
      Hall,
      Room,
      ChessRoom
    },
    computed: {  // 计算方法
      ...mapGetters([ // 获取vuex里面存储的user 和rooms
        'user',
        'rooms',
        'fd'
      ]),
      stage() { // 如果this.user 等变量 变化的时候 stage就会自动调用
        if (!this.user.fd || !this.user.id) return 'login'
        if (this.user.room_id != null) {
          var room_type = this.rooms[this.user.room_id]['game_type']
          if (room_type == 'draw') {
            return 'room'
          }else if (room_type == 'chess') {
            return 'chessRoom'
          }else if (room_type == 'uno') {
            return 'unoRoom'
          }
        }
        return 'hall'
      },
    },
    data () {
      return {

      }
    },
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    /*margin-top: 60px;*/
    width: 100%;
    height: 100%;
  }

  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  a {
    color: #82E1FD;
  }
</style>
