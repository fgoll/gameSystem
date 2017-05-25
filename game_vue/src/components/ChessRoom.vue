<template>
    <div id="chessroom">
      <div class="header">
        <div class="time-box">
          <p>time</p>
          <p class="big-font">{{ duration }}</p>
        </div>
        <div class="title-box">
          <p>{{ room.game_type }}</p>
        </div>
        <button class="button" @click="leave">quit</button>
        <div class="name-label">{{ room_user.rolename }}</div>
      </div>
      <div class="content">
        <ul class="user-list">
          <li v-for="(u, index) in army1" :class="{ current: u != null && u.status == 'action', trusteeship: u != null && u.trusteeship == 'auto' }" class="white-army">
            <template v-if="u">
              <div class="user-icon">
                <img :src="u.avatar" alt="">
              </div>
              <p>{{ u.rolename }}</p>
            </template>
          </li>
          <li v-for="(u, index) in army2" :class="{ current: u != null && u.status == 'action', trusteeship: u != null && u.trusteeship == 'auto' }" class="black-army">
            <template v-if="u">
              <div class="user-icon">
                <img :src="u.avatar" alt="">
              </div>
              <p>{{ u.rolename }}</p>
            </template>
          </li>
        </ul>
        <ul class="ready-content" v-show="room.status != 'playing'">
          <li v-for="(u, index) in army1" :class="{ isself: u != null && u.u_id == user.id }" @click="changeToWhitePos(index)">
            <!--{{ u.u_id }}-->
            <span class="index index1">{{ index + 1}}</span>
            <template v-if="u">
              <img :src="u.avatar" alt="">
              <p>{{ u.rolename }}</p>

              <span class="ready-status" v-show="u.status == 'ready'">已准备</span>
            </template>

          </li>
          <li v-for="(u, index) in army2" :class="{ isself: u != null && u.u_id == user.id }" @click="changeToBlackPos(index)">
            <!--{{ u.u_id }}-->
            <span class="index index2">{{ index + 1}}</span>
            <template v-if="u">
              <img :src="u.avatar" alt="">
              <p>{{ u.rolename }}</p>

              <span class="ready-status" v-show="u.status == 'ready'">已准备</span>
            </template>

          </li>
        </ul>
        <div class="game-content" v-show="room.status == 'playing'">
          <canvas id="cas"></canvas>
          <div class="tool-bar">

            <div class="button" @click="trusteeship">
              {{ room_user.trusteeship == 'auto' ? '取消托管' : '托管'}}
            </div>
          </div>
        </div>
        <div class="right-box">
          <div class="chat-box">
            <ul class="chat-list">
              <li v-for="m_user in room_messages" :class="{ 'chat-right': user.id == m_user.u_id }">

                <div>
                  <img :src="(m_user.rolename == 'GM' ? '/static/gm.JPG' : m_user.avatar)" alt="" class="chat-icon">
                  <span>{{ m_user.rolename }}</span>
                </div>
                <p class="chat-content">{{ m_user.message }}</p>
              </li>

            </ul>
            <div class="send-box">
              <div class="send-input">
                <textarea placeholder="发送内容" @keydown.enter.prevent.stop="say" v-model="message"></textarea>
                <button class="btn" @click="say"></button>
              </div>
            </div>
          </div>
          <div class="ready-btn sweet-btn glass" v-show="room.status != 'playing'" :class="{ blue: room_user.status == 'waiting' }" @click="toggle">
            {{ room_user.status == 'waiting' ? '立即准备' : '取消准备'}}
          </div>
        </div>

      </div>
    </div>
</template>

<script>
  import Vue from 'vue'
  import store from '../store/store'
  import { send } from 'src/game/client'
  import { mapGetters, mapActions } from 'vuex'
  export default {
    data() {
      return {
        message:'',
        canvas: null,
        room_id: '',
        icon: 'gm.JPG',
        downed: false,
      }
    },
    mounted() {
      this.room_id = this.user.room_id
      this.canvas = document.getElementById('cas')
      var $ = {}
      if ('ontouchstart' in window) {
        $.isTouchable = true;
        $.EVENT_START = 'touchstart';
        $.EVENT_MOVE = 'touchmove';
        $.EVENT_END = 'touchend';
      }else {
        $.isTouchable = false;
        $.EVENT_START = 'mousedown';
        $.EVENT_MOVE = 'mousemove';
        $.EVENT_END = 'mouseup'
      }
      $.EVENT_CANCEL = 'touchcancel';
      $.EVENT_CLICK = 'click';

      var parent = this.canvas.parentNode;
      this.canvas.width=parent.innerWidth||parent.clientWidth||1000;
      this.canvas.height=(parent.innerHeight||parent.clientHeight||parent.clientHeight||600);

      var canvasWidth = this.canvas.width
      var canvasHeight = this.canvas.height

      var context = this.canvas.getContext('2d')

      var self = this;

      this.canvas.addEventListener($.EVENT_CLICK, (e) => {
        if (!this.can_action) return
        if (!this.can_chess) return

        var beginX = 0, beginY = 0;

        if (e.pageX) {
          beginX = e.pageX;
          beginY = e.pageY;
        } else {
          beginX = e.touches[0].clientX;
          beginY = e.touches[0].clientY;
        }
        var x = beginX - this.canvas.offsetLeft
        var y = beginY - this.canvas.offsetTop

        var canvasWidth = this.canvas.width, canvasHeight = this.canvas.height;
        var finalWidth = (canvasWidth > canvasHeight ? canvasHeight : canvasWidth) - 30;

        var width = finalWidth / 14;

        var left = (canvasWidth - finalWidth) / 2;

        var top = (canvasHeight - finalWidth) / 2;

        var i = Math.floor((x - left + width / 2) / width);
        var j = Math.floor((y - top + width / 2) / width);

        if (this.chessBoard[i][j] == 0) {
          var x_point = left + i * width;
          var y_point = top + j * width;
          store.commit('Chess.CANTDOWN')
          if (this.army_type == 'black')
            store.commit('Chess.BLACK', { x: i, y: j })
          else
            store.commit('Chess.WHITE', { x: i, y: j })
          drawChessPiece(context,width / 2 ,x_point,y_point,this.army_type)
          let win = judgeWin(i, j);
          if (win) {
            send({
              header: 'chess_win',
              data: {
                i: i,
                j: j,
                army: this.army_type
              }
            })
          }else {
            send({
              header: 'chess_down',
              data: {
                i: i,
                j: j,
                army: this.army_type
              }
            })
          }
        }
      })

      const createChessBoard = () => {
        if (this.room.status != "playing") return;
        context.strokeStyle="#454545";

        context.lineWidth=1;
        this.canvas.width=parent.innerWidth||parent.clientWidth||1000;
        this.canvas.height=(parent.innerHeight||parent.clientHeight||parent.clientHeight||600)
        var canvasWidth = this.canvas.width, canvasHeight = this.canvas.height;
        var finalWidth = (canvasWidth > canvasHeight ? canvasHeight : canvasWidth) - 30;

        var width = finalWidth / 14;

        var left = (canvasWidth - finalWidth) / 2;

        var top = (canvasHeight - finalWidth) / 2;

        for (var i = 0; i < 15; i ++) {
          context.moveTo(i * width + left, top);
          context.lineTo(i * width + left, finalWidth + top);
          context.stroke();
          context.moveTo(left, i * width + top);
          context.lineTo(finalWidth + left, i * width + top);
          context.stroke();
        }

          for (var i = 0; i < 15; i ++) {
            for (var j = 0; j < 15; j ++) {
              if (this.chessBoard[i][j] == 1) {
                var x_point = left + i * width;
                var y_point = top + j * width;
                drawChessPiece(context,width / 2 ,x_point,y_point,"black")
              }
              if (this.chessBoard[i][j] == -1){
                var x_point = left + i * width;
                var y_point = top + j * width;
                drawChessPiece(context,width / 2 ,x_point,y_point,"white")
              }
            }
          }
      }

      createChessBoard(canvasWidth, canvasHeight);

      window.onresize = createChessBoard;
//      window.addEventListener('resize', createChessBoard)

      const judgeWin = (x, y) => {
//        let x = point.x, y = point.y;
        let chessboard = this.chessBoard;
        let origin_type = chessboard[x][y];

        // 横向
        var maxX = x + 4;
        if (maxX >= 15) {
          maxX = 14;
        }
        var minX = 0;
        if (x > 4) minX = x - 4

        var count = 1;
        for (var i = minX; i <= maxX - 4; i ++) {
          for (var j = 0; j <= 4; j ++) {
            var chess = chessboard[i+j][y]

            if (chess == origin_type) {
              count ++;
            }else {
              count = 1;
              continue;
            }
            if (count > 5) {
              return true;
            }
          }
          count = 1;
        }

        //  纵向
        var maxY = y + 4;
        if (maxY >= 15) {
          maxY = 14;
        }
        var minY = 0;
        if (y > 4) {
          minY = y - 4;
        }

        for (var i = minY; i <= maxY - 4; i ++) {
          for (var j = 0; j <= 4; j ++) {
            var chess = chessboard[x][i+j]
            if (chess == origin_type) {
              count ++;
            }else {
              count = 1;
              continue;
            }
            if (count > 5) {
              return true;
            }
          }
          count = 1;
        }

        //  右下角
        if( x < y) {
          if (minX == 0) {
            minY = y - x;
          }
        }else {
          if (minY == 0) {
            minX = x - y;
          }
        }

        for (var i = minX, j = minY; i <= maxX - 4 && j <= maxY - 4; i++,j++) {
          for (var k = 0; k <= 4; k ++) {
            var chess = chessboard[i + k][j + k]
            if (chess == origin_type) {
              count ++;
            }else {
              count = 1;
              continue;
            }
            if (count > 5) {
              return true;
            }
          }
          count = 1;
        }

        //  左下角
        if (y > (14 - x)) {
          if (x > 10) {
            maxX = 14;
            minY = y - (14 - x);
          }else {
            maxX = x + 4;
            minY = y - 4;
          }
        }else {
          if (y < 5) {
            minY = 0;
            maxX = y + x;
          }else {
            minY = y - 4;
            maxX = x + 4;
          }
        }

        minX = x - 4;
        if (minX < 0) {
          minX = 0;
        }

        for (var i = maxX, j = minY; i >= minX + 4 && j <= maxY - 4; i--, j++) {
          for (var k = 0; k <= 4; k++) {
            var chess = chessboard[i - k][j + k];
            if (chess == origin_type) {
              count ++;
            }else {
              count = 1;
              continue;
            }
            if (count > 5) {
              return true;
            }
          }
          count = 1;
        }

        return false;
      }
    },
    computed: {
      ...mapGetters([
        'room_messages',
        'rooms',
        'user',
        'duration',
        'timeover',
        'chessBoard',
        'can_chess',
        'auto_down'
      ]),
      room() {
        return this.rooms[this.user.room_id]
      },
      room_user() {
        for (let u of this.room.users) {
          if (u && u.u_id == this.user.id) {

            return u
          }
        }
      },
      action_user() {
        for (let u of this.room.users) {
          if (u && u.status == 'action') {
            return u
          }
        }
      },
      can_action() {
        return this.room_user.status == 'action'
      },
      army1() {
        return this.room.users.slice(0, 3)
      },
      army2() {
        return this.room.users.slice(3, 6)
      },
      army_type() {
        let index = this.room.users.findIndex((u) => {
          return u && u.u_id == this.user.id
        })
        let mid = this.room.users.length / 2

        let type = index < mid ? 'white' : 'black'
        return type
      }
    },
    destroyed() {
      window.onresize = null
    },
    methods: {
      ...mapActions([
        'clearMessage',
        'countdown',
      ]),
      leave() {
        if (this.room.status == 'playing') {
          alert("is playing, can't quit")
          return
        }
        send({
          header: 'leave',
          data: {
            'room_id': this.user.room_id,
            'p_id': this.room_user.p_id
          }
        }, true)
      },
      say() {
        if (this.message) {
          send({
            header: 'say_room',
            data: {
              message: this.message,
              room_id: this.user.room_id
            }
          })
          this.message = ''
        }
      },
      toggle() {

        if(this.room.status == 'playing') {
          alert('is playing')
          return
        }
        send({
          header: 'toggle',
        })
      },
      trusteeship() {
        send({
          header: 'chess_auto'
        })
      },
      changeToWhitePos(index) {
        let pos = index;
        this.changePos(pos)
      },
      changeToBlackPos(index) {
        let pos = index + 3;
        this.changePos(pos)
      },
      changePos(pos) {
        let pos_user = this.room.users[pos]

        if (pos_user == null) {
          if (this.room_user.status == 'waiting')

            send({
              header: 'change_position',
              data: {
                op_id: this.room_user.p_id,
                p_id: pos,
                room_id: this.user.room_id
              }
            }, true)

          return
        }
        if (pos_user.u_id == this.user.id) {
          return
        }
        else {
          alert('this position have people')

        }
      }
    },
    watch: {
      timeover(val) {
        if (val) {
          if (this.room.status == 'playing' && this.room_user.status == 'action') {
            send({
              header: 'next_begin',
              data: {
                room_id: this.user.room_id
              }
            })
          }
        }
      },
      room_messages() {
        let dom = document.getElementsByClassName("chat-list")[0]
        if(dom.scrollTop === dom.scrollHeight - dom.clientHeight) {
          Vue.nextTick(() => {
            dom.scrollTop = dom.scrollHeight
          })
        }
      },
      auto_down(val) {
        console.log(val)
//        if (val == 1) { // 黑棋
//          // 先找四颗黑棋
//          for (var i = 0; i < 15; i++) {
//            for (var j = 0; j < 15; j++) {
//              if (this.chessBoard[i][j] == 1) {
//                // 寻找四个方向
//
//              }
//            }
//          }
//        }else { // 白棋
//
//        }

        let chessBoard = this.chessBoard;
        console.log(chessBoard)
        var end = false
        for (var i = 0; i < 15; i ++) {
          if (end == true) break
          for (var j = 0; j < 15; j++) {

            if (chessBoard[i][j] == 0) {
//              chessBoard[i][j] = val
              console.log(this.chessBoard)

//              let canvas = document.getElementById('cas')
              let context = this.canvas.getContext('2d')

              if (context) {
                window.onresize();

                var canvasWidth = this.canvas.width, canvasHeight = this.canvas.height;
                var finalWidth = (canvasWidth > canvasHeight ? canvasHeight : canvasWidth) - 30;

                var width = finalWidth / 14;

                var left = (canvasWidth - finalWidth) / 2;

                var top = (canvasHeight - finalWidth) / 2;

                var x_point = left + i * width;
                var y_point = top + j * width;

                if (val == 1) {
                  store.commit('Chess.BLACK', { x: i, y: j })
                }else {
                  store.commit('Chess.WHITE', { x: i, y: j })
                }
                drawChessPiece(context, width / 2, x_point, y_point, val == 1 ? 'black' : 'white')

                send({
                  header: 'chess_down',
                  data: {
                    i: i,
                    j: j,
                    army: this.army_type
                  }
                })
                console.log(i, j);
                store.commit('Chess.RESET')
                context.strokeStyle= "rgb(200,0,0)";
                context.strokeRect(x_point - width / 2, y_point - width / 2, width, width);
                // context.stroke();
                end = true
                return
              }
            }
          }
        }
      }
    },
    components: {}
    }
</script>

<style scoped>
  canvas {
    background: lightyellow;
  }
  #chessroom {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .big-font {
    font-size: 26px;
    font-weight: bold;
  }

  .header {
    background: #F69B2F;
    height: 10%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem 0 2rem;
    /*color: #fff;*/
  }

  .header .title-box {
    margin-left: -20%;
  }

  .header .button {
    background: linear-gradient(#E88D06, #C77804);
    border-radius: 40% / 100%;
    padding: 0.3rem 1rem;
    border: 1px solid #be8130;
    color: inherit;
  }

  .button:hover {
    background: linear-gradient(#C77804, #E88D06);
    color: #fff;
  }

  .content {
    height: 90%;
    display: flex;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .content .user-list {
    flex: 0 0 90px;
    box-shadow: 0 0 10px #AA6008;
    overflow: hidden;
    border-radius: 5px 40px;
    background: #fff;
    transition: all 0.2s;
    margin-right: 1%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }

  .white-army {
    background: #fff;
    border-radius:50%;
    background:radial-gradient(15px 15px at 15px 15px,#fff,#e2e2e2);

    box-shadow:2px 2px 4px rgba(0,0,0,0.3);
  }

  .black-army {
    background: #000;
    color: #fff;
    border-radius:50%;
    background:radial-gradient(10px 10px at 15px 15px,#fff,#333);
    box-shadow:2px 2px 4px rgba(0,0,0,0.4);
  }

  .content .user-list li {
    /*margin: 5px 0;*/
    width: 80px;
    height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    /*padding-top: 1rem;*/
    border-radius: 50%;
    transition: all 0.2s;
    font-size: 13px;
  }

  .content .user-list li .user-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    position: relative;
    display: flex;
    justify-content: center;
    overflow: hidden;
    /*overflow: hidden;*/
    /*border: 5px solid #AA6008;*/
  }

  .content .user-list li.current .user-icon:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    border-radius: 100%;
    border:3px solid #e1664f;
    box-shadow: 0 0 10px #fff inset;
  }

  /*.content .user-list li.current {*/
  /*color: #fff;*/
  /*background: #e19d8f;*/
  /*box-shadow: 0 -1px 10px #fff inset;*/
  /*}*/

  .content .user-list img {
    /*width: 100%;*/
    height: 100%;
    border-radius: 100%;
  }

  .content .game-content, .ready-content {
    flex-grow: 1;
    box-shadow: 0 0 10px #AA6008;
    overflow: hidden;
    border-radius: 5px;
    background: #fff;

  }


  .content .right-box {
    flex: 0 1 25%;
    margin-left: 1%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .content .right-box .chat-box {
    box-shadow: 0 0 2px #AA6008;
    overflow: hidden;
    border-radius: 5px;
    background: #fff;
    transition: all 0.2s;
    flex-grow: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .trusteeship {
    position: relative;
  }

  .trusteeship::after {
    content: '托管中';
    position: absolute;
    color: #AA6008;
    border: 1px solid #e1664f;
    background: lightyellow;
    font-size: 11px;
    top: 0;

  }
  .color-list {
    display: flex;
    width: 10rem;
    height: 2rem;
  }

  .color-list li {
    flex: 1 1 auto;

  }

  .canselected li {
    position: relative;
  }

  .canselected .current:after {
    content: '';
    background: url("../assets/ARROW.png") no-repeat center center;
    position: absolute;
    top: -5px;
    width: 10px;
    height: 5px;
    left: 50%;
    transform: translateX(-50%);
  }

  .ready-content {
    display: flex;
    flex-wrap: wrap;
    height: 100%;
  }

  .ready-content li {
    width: 30%;
    height: 45%;
    margin-left: 2.5%;
    margin-top: 2%;
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 0 5px gray;
    background: repeating-linear-gradient(45deg, #f1eaef, #d4d6d0 10px, #eee9ed 0, #eee9ed 20px);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }

  .ready-content li.isself {
    border: 2px solid #F69B2F;
    /*background: none;*/
    background: repeating-linear-gradient(45deg, #f1eaef, #d4d6d0 10px, #ffe07f 0, #eee9ed 20px);
  }

  .ready-content li p {
    font-size: 20px;
    font-weight: bold;
  }

  .ready-content li .index {
    position: absolute;
    left: -1px;
    top: -1px;
    width: 40px;
    height: 40px;
    background: url("../assets/index_bg.png") no-repeat left top / 40px ;
    display: flex;
    color: #fff;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 20px;
  }

  .ready-content li .index.index1 {
    background-image: url("../assets/index_white.png");
    color: #000000;
  }

  .ready-content li .index.index2 {
    background-image: url("../assets/index_black.png")
  }

  .ready-content li img {
    width: 90%;
    margin-top: 20px;
    box-shadow: 0 0 5px gray;
    /*z-index: 5;*/
  }

  .ready-content li .ready-status {
    position: absolute;
    right: -5px;
    bottom: 5px;
    font-size: 25px;
    color: #d17f05;
    box-shadow: 0 0 5px gray;
    transform: rotateZ(-20deg);
    z-index: 999;
    background: rgba(255, 255, 255, 0.5);
  }

  .line-box {
    margin-left: 5%;
    display: flex;
    width: 5rem;
    height: 2rem;
    justify-content: space-around;
    align-items: center;
    margin-right: 5%;
  }

  .line-box li {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    height: 100%;
    align-items: center;
  }
  .line-box li div {
    border-radius: 50%;
    background: #000;
    display: block;
  }

  .rubber-btn {
    background: #fff url("../assets/rubber.png") no-repeat center center / 22px 22px;
  }

  .small-btn {
    width: 2rem;
    height: 2rem;

    border-radius: 50%;
    box-shadow: 0 0 5px gray;

  }

  .clear-btn {
    background: #fff url("../assets/clear3.png") no-repeat center center / 20px 20px;
    margin: 0 3% 0 2%;
  }

  .small-btn:hover {
    box-shadow: 0 0 5px #ccc inset;
  }

  .ready-btn {
    width: 9rem;
  }
  @media (max-width: 900px) {

    .content {
      flex-direction: column;
      padding: 0;
    }

    .content .user-list {
      flex-direction: row;
      flex: 0 0 48px;
      border-radius: 0;
      background: #f1f0cf;
      width: 100%;
      align-items: center;
      justify-content: space-around;
    }
    .content .user-list li {
      /*margin: 0 10px;*/
      padding: 0;
      width: 40px;
      height: 40px;
    }
    .content .user-list li .user-icon {
      width: 90%;
      height: 90%;
    }

    .content .user-list li p {
      display: none;
    }
    .chat-box .send-box {
      padding: 6px 10px;

      height: 45px;
    }
    .chat-box .send-box {
      padding: 6px 10px;
      background-color: #f5f5f5;
      border-top: 1px solid #ddd;
      border-bottom-right-radius: 3px;
      border-bottom-left-radius: 3px;
      height: 45px;
    }

    .content .game-content {
      border-radius: 0;
      /*border: 1px solid #AA6008;*/
      border-top-color: transparent;
    }
    .chat-box .send-box .send-input textarea {

      padding-top: 0;
      padding-bottom: 0;
    }
    .content .game-content .tool-bar {
      /*display: none;*/
    }
    .chat-box .chat-list li .chat-icon {
      display: none;
    }

    .chat-box .chat-list li > div {
      min-height: 30px;
    }
    .chat-box .chat-list li .chat-content {
      min-height: 30px;
    }
    .chat-box .chat-list li {
      border-radius: 0;
      margin: 5px;
    }
    .content .right-box .chat-box {
      border-radius: 0;
    }
    .content .right-box {
      margin-left: 0;
      width: 100%;
      border-radius: 0;
    }
    .right-box .sweet-btn {
      /*position: fixed;*/
      /*left: 50%;*/
      /*width: 100%;*/
      font-size: 16px;
      /*top: 6%;*/
      /*margin: 1px;*/
      /*transform: translateX(-55%);*/
      flex: 0 0 auto;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 15px 0 20px;
    }

    .line-box {
      margin: 0 1%;
    }
    .content .right-box {
      flex: 1 0 35%;
    }
    .chat-box .send-box .send-input .btn {
      flex: 0 0 35px;
    }
    .big-font{
      font-size: 16px;
      font-weight: bold;
    }
    .ready-content {
      height: 56%;
      flex: 0 0 auto;
    }
    .ready-content li p {
      font-size: 13px;
      font-weight: 700;
    }
  }

</style>
