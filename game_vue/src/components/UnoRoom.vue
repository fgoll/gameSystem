<template>
  <div id="unoroom">
    <div class="header">
      <div class="time-box">
        <p>time</p>
        <p class="big-font">{{ duration }}</p>
      </div>
      <div class="title-box">
        <p>{{ room.game_type }}</p>
        <!--{{topic.topic_title}}-->
        <p class="big-font">{{ room_user.status == 'action' ? room_user.topic.topic_title : '' }}</p>
      </div>
      <button class="button" @click="leave">quit</button>
    </div>
    <div class="content">
      <ul class="user-list" v-show="room.status == 'playing' ">
        <li v-for="(u, index) in room.users" v-if="u != null" :class="{ current: u.status == 'action' }">
          <div class="user-icon">
            <img :src="u.avatar" alt="">
          </div>
          <p>{{ u.rolename }}</p>
        </li>
      </ul>
      <ul class="ready-content" v-show="room.status == 'playing'">
        <li v-for="(u, index) in room.users" :class="{ isself: u != null && u.u_id == user.id }">
          <!--{{ u.u_id }}-->
          <span class="index">{{ index + 1}}</span>
          <template v-if="u">
            <img :src="u.avatar" alt="">
            <p>{{ u.rolename }}</p>

            <span class="ready-status" v-show="u.status == 'ready'">已准备</span>
          </template>

        </li>
      </ul>
      <div class="game-content" v-show="room.status != 'playing'">
        <!--待发牌-->
        <ul class="cards">

        </ul>


      </div>
      <div class="right-box">
        <div class="chat-box">
          <ul class="chat-list">
            <li v-for="m_user in room_messages" :class="{ 'chat-right': user.id == m_user.u_id }">

              <div>
                <img :src="(m_user.rolename == '爸爸' ? '/static/gm.JPG' : m_user.avatar)" alt="" class="chat-icon">
                <span>{{ m_user.rolename }}</span>
              </div>
              <p class="chat-content">{{ m_user.message }}</p>
            </li>

          </ul>
          <div class="send-box">
            <div class="send-input">
              <textarea :disabled="this.room_user.status == 'action'" placeholder="发送内容" @keydown.enter.prevent.stop="say" v-model="message"></textarea>
              <button class="btn" @click="say"></button>
            </div>
          </div>
        </div>
        <div class="ready-btn sweet-btn glass" v-show="room.status != 'playing'" :class="{ blue: room_user.status == 'waiting' }" @click="toggle">
          {{ room_user.status == 'waiting' ? '立即准备' : '取消准备'}}
        </div>
      </div>

    </div>
    <div class="answer-box" v-show="showAnswer" >
      <p class="title">答案: <span class="answer">{{ action_user != null ? action_user.topic.topic_title : '' }}</span></p>
      <img src="" alt="" id="answer-img">
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { send } from 'src/game/client'
  import { mapGetters, mapActions } from 'vuex'
  export default {
    data() {
      return {
        message:'',
        canvas: null,
        colors: ['black', 'red', 'blue', 'yellow', 'white', 'bisque', 'pink', 'orange'],
        currentColor: 'black',
        weights: ['2px', '4px', '6px', '8px'],
        currentWeight: '2px',
        room_id: '',
        showAnswer: false,
        icon: 'gm.JPG',
        answerImg: null
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

      var isDown = false

      var context = this.canvas.getContext('2d')

      var parent = this.canvas.parentNode;
      this.canvas.width=parent.innerWidth||parent.clientWidth||1000;
      this.canvas.height=(parent.innerHeight||parent.clientHeight||parent.clientHeight||600) - 50;

      var canvasWidth = this.canvas.width
      var canvasHeight = this.canvas.height



      this.canvas.addEventListener($.EVENT_START, (e) => {
        if (!this.can_action) return
        isDown = true
        context.beginPath()
        context.strokeStyle = this.currentColor
        context.lineWidth = parseInt(this.currentWeight)
        context.lineCap = "round"
        context.lineJoin = 'round'
        canvasWidth = this.canvas.width
        canvasHeight = this.canvas.height
        send({
          header: 'draw_start',
          data: {
            color: this.currentColor,
            weight: this.currentWeight
          }
        })
      })

      this.canvas.addEventListener($.EVENT_MOVE, (e) => {
        e.preventDefault()
        if (!this.can_action) return
        if (isDown) {
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
          context.lineTo(x, y)
          context.stroke()
          send({
            header: 'draw_move',
            data: {
              x: x,
              y: y,
              width: canvasWidth,
              height: canvasHeight,
              room_id: this.user.room_id,
            }
          })
        }

      })

      this.canvas.addEventListener($.EVENT_END, (e) => {
        if (!this.can_action) return
        isDown = false

        context.closePath()
        send({
          header: 'draw_end'
        })
      })

      this.canvas.addEventListener('mouseout', (e) => {

        if (isDown) {
          isDown = false

          context.closePath()
        }
      })
      var parent = this.canvas.parentNode;
      window.onresize = () => {

        this.canvas.width=parent.innerWidth||parent.clientWidth||1000;
        this.canvas.height=(parent.innerHeight||parent.clientHeight||parent.clientHeight||600) - 50
      }
    },
    destroyed() {
      window.onresize = null
    },
    computed: {
      ...mapGetters([
        'room_messages',
        'rooms',
        'user',
        'duration',
        'timeover'
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
      topic() {
        console.log(this.room_user.topic)
        return this.room_user.topic
      },

    },
    methods: {
      ...mapActions([
        'clearMessage',
        'countdown'
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
      clearCas() {
        this.canvas.height = this.canvas.height
        send({
          header: 'draw_clear'
        })
      },
      rubber() {
        this.currentColor = 'white'
        this.currentWeight = '12px'
      },
      convertCanvasToImage(canvas) {
        var image = new Image();
        image.src = canvas.toDataURL("image/png");
        return image;
      }

    },
    watch: {
      timeover(val) {
        if (val) {
          this.showAnswer = true
          var answerImg = this.convertCanvasToImage(this.canvas)
          document.getElementById('answer-img').setAttribute('src', answerImg.src);
          var self=this;
          setTimeout(function() {
            self.showAnswer = false

          }, 2000)
          if (this.room_user.status == 'action') {
            console.log(this.room_user.rolename)
            setTimeout(function() {
              send({
                header: 'next_begin',
                data: {
                  room_id: self.user.room_id
                }
              })
            }, 3000)

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
    },
    components: {}
  }
</script>

<style scoped>
  #unoroom {
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
  }

  .content .user-list li {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 1rem;
    transition: all 0.2s;
  }

  .content .user-list li .user-icon {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 100%;
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

  .content .game-content .tool-bar {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    box-shadow: 0 0 3px lightgray;
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

  .answer-box {
    position: fixed;
    left: 50%;
    top: 50%;
    width: 18rem;
    height: 15rem;
    background: #7f4e13;
    box-shadow: 0 0 5px lightgray;
    border-radius: 5px;
    /*box-shadow: 0 0 5px #d17f05;*/
    /*border-radius: 20% 20% 20% 0 ;*/
    transform: translateX(-50%) translateY(-50%);
  }

  .answer-box .title {
    padding-top: 8px;
    font-size: 25px;
    color: #fff;
  }

  .answer-box img {
    width: 11rem;
    margin-top: 10px;
    background: #fff;
  }

  .answer-box .answer {
    font-weight: bold;

  }

  @media (max-width: 900px) {

    .content {
      flex-direction: column;
      padding: 0;
    }

    .content .user-list {
      flex-direction: row;
      flex: 0 0 70px;
      border-radius: 0;
      background: #f1f0cf;
      width: 100%;
    }
    .content .user-list li {
      margin: 0 10px;
      padding: 0;
    }
    .content .user-list li .user-icon {
      width: 40px;
      height: 40px;
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
      width: 100%;
      font-size: 16px;
      /*top: 6%;*/
      margin: 1px;
      /*transform: translateX(-55%);*/

    }

    .line-box {
      margin: 0 1%;
    }
    .content .right-box {
      flex: 0 0 35%;
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
    }
    .ready-content li p {
      font-size: 13px;
      font-weight: 700;
    }
  }
</style>
