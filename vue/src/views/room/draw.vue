<template>
  <div v-if="roomUser && room" id="room">
    <div class="header">
      <div class="time-box">
        <p>time</p>
        <p class="big-font">{{ roomDuration }}</p>
      </div>
      <div class="title-box">
        <p>Draw</p>
        <!--{{topic.topic_title}}-->
        <p class="big-font">{{ roomUser.status == 'action' ? roomUser.topic.topic_title : '' }}</p>
      </div>
      <button class="button" @click="leave">quit</button>

      <div class="name-label">{{ roomUser.rolename }}</div>
    </div>
    <div v-if="room" class="content">
      <ul v-show="room.status === 'playing' " class="user-list">
        <template v-for="(u, index) in room.users">
          <li v-if="u" :key="index" :class="{ current: u.status === 'action' }">
            <div class="user-icon">
              <img :src="u.avatar" alt="">
            </div>
            <p>{{ u.rolename }}</p>
          </li>
        </template>

      </ul>
      <ul v-show="room.status !== 'playing'" class="ready-content">
        <template v-for="(u, index) in room.users">
          <li :key="index" :class="{ isself: u != null && u.u_id === user.id }">
            <!--{{ u.u_id }}-->
            <span class="index">{{ index + 1 }}</span>
            <template v-if="u">
              <img :src="u.avatar" alt="">
              <p>{{ u.rolename }}</p>

              <span v-show="u.status == 'ready'" class="ready-status">已准备</span>
            </template>

          </li>
        </template>

      </ul>
      <div v-show="room.status === 'playing'" class="game-content">
        <canvas id="cas" ref="canvas" />
        <div class="tool-bar">
          <ul class="color-list canselected">
            <li
              v-for="color in colors"
              :key="color"
              :class="{current: currentColor == color }"
              :style="{background: color}"
              @click="currentColor=color"
            />

          </ul>
          <ul class="line-box canselected">
            <li
              v-for="weight in weights"
              :key="weight"
              :class="{current: currentWeight == weight }"
              @click="currentWeight=weight"
            >
              <div :style="{width: weight, height: weight}" />
            </li>
          </ul>
          <div class="small-btn rubber-btn" @click="rubber">
            <svg-icon icon-class="rubber" />
          </div>
          <div class="small-btn clear-btn" @click="clear">
            <svg-icon icon-class="clear" />
          </div>
        </div>
      </div>
      <div class="right-box">
        <div class="chat-box">
          <ul ref="chat" class="chat-list">
            <li
              v-for="(msg,index) in roomMessages"
              :key="index"
              :class="{ 'chat-right': user.id == msg.u_id }"
            >

              <div>
                <img
                  :src="(msg.rolename == 'GM' ? '/static/gm.JPG' : msg.avatar)"
                  alt=""
                  class="chat-icon"
                >
                <span>{{ msg.rolename }}</span>
              </div>
              <p class="chat-content">{{ msg.message }}</p>
            </li>

          </ul>
          <div class="send-box">
            <div class="send-input">
              <textarea
                v-model="message"
                :disabled="roomUser.status == 'action'"
                placeholder="发送内容"
                @keydown.enter.prevent.stop="say"
              />
              <button class="btn" @click="say" />
            </div>
          </div>
        </div>
        <div
          v-show="room.status != 'playing'"
          class="ready-btn sweet-btn glass"
          :class="{ blue: roomUser.status == 'waiting' }"
          @click="toggle"
        >
          {{ roomUser.status == 'waiting' ? '立即准备' : '取消准备' }}
        </div>
      </div>

    </div>
    <div v-show="answerImg" class="answer-box">
      <p class="title">答案:
        <span class="answer">{{ actionUser != null ? actionUser.topic.topic_title : '' }}</span></p>
      <img v-if="answerImg" ref="answer" :src="answerImg.src" alt="">
    </div>
  </div>
</template>

<script>
import {
  drawStart, drawMove, drawEnd, drawClear, next,
} from '@/pack/send/room';
import { getEvents } from '@/utils';
import Bus from '@/utils/bus';
import RoomMixins from '@/mixins/room.mixins';

export default {
  mixins: [RoomMixins],
  data() {
    return {
      canvas: null,
      colors: ['black', 'red', 'blue', 'yellow', 'white', 'bisque', 'pink', 'orange'],
      currentColor: 'black',
      weights: ['2px', '4px', '6px', '8px'],
      currentWeight: '2px',
      showAnswer: false,
      answerImg: null,
    };
  },
  watch: {
    roomDuration(val) {
      if (val <= 0) {
        this.answerImg = this.convertCanvasToImage(this.$refs.canvas);

        setTimeout(() => {
          this.answerImg = null;
        }, 2000);

        if (this.roomUser.status === 'action') {
          setTimeout(() => {
            next({
              room_id: this.user.roomId,
            });
          }, 3000);
        }
      }
    },
  },
  mounted() {
    this.initCanvas(this.$refs.canvas);
  },
  destroyed() {
    window.onresize = null;
  },
  methods: {
    initCanvas(canvas) {
      const event = getEvents();

      const context = canvas.getContext('2d');

      const parent = canvas.parentNode;

      function getSize() {
        return {
          width: parent.innerWidth || parent.clientWidth || 1000,
          height: (parent.innerHeight
                      || parent.clientHeight
                      || parent.clientHeight
                      || 600) - 50,
        };
      }

      window.onresize = () => {
        const {
          width,
          height,
        } = getSize();
        [canvas.width, canvas.height] = [width, height];
      };

      canvas.addEventListener(event.EVENT_START, this.handleStart({ context }));

      canvas.addEventListener(event.EVENT_MOVE, this.handleMove({ context, canvas }));

      canvas.addEventListener(event.EVENT_END, this.handleEnd({ context }));

      this.bindEvents({ context, canvas });
    },

    bindEvents({ context, canvas }) {
      Bus.$on('drawstart', ({ color, weight }) => {
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = parseInt(weight, 10);
      });

      Bus.$on('drawmove', ({ x, y }) => {
        const [width, height] = [canvas.width, canvas.height];
        context.lineTo(x * width, y * height);
        context.stroke();
      });

      Bus.$on('drawend', () => {
        context.closePath();
      });

      Bus.$on('drawclear', () => {
        canvas.height = canvas.height;
      });
    },

    handleStart({ context, send = true }) {
      return () => {
        if (!this.canAction) return;
        this.isDown = true;
        context.beginPath();
        context.strokeStyle = this.currentColor;
        context.lineWidth = parseInt(this.currentWeight, 10);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        if (send) {
          drawStart({
            color: this.currentColor,
            weight: this.currentWeight,
          });
        }
      };
    },

    handleMove({ context, canvas, send = true }) {
      return (e) => {
        e.preventDefault();
        if (!this.canAction) return;
        if (this.isDown) {
          let beginX = 0;
          let beginY = 0;

          if (e.pageX) {
            beginX = e.pageX;
            beginY = e.pageY;
          } else {
            beginX = e.touches[0].clientX;
            beginY = e.touches[0].clientY;
          }
          const x = beginX - canvas.offsetLeft;
          const y = beginY - canvas.offsetTop;
          context.lineTo(x, y);
          context.stroke();

          if (send) {
            drawMove({
              x,
              y,
              width: canvas.width,
              height: canvas.height,
              room_id: this.user.roomId,
            });
          }
        }
      };
    },

    handleEnd({ context, send = true }) {
      return () => {
        if (!this.canAction) return;
        this.isDown = false;

        context.closePath();

        if (send) { drawEnd(); }
      };
    },

    clear() {
      if (!this.canAction) return;
      Bus.$emit('drawclear');
      drawClear();
    },
    rubber() {
      if (!this.canAction) return;
      this.currentColor = 'white';
      this.currentWeight = '8px';
    },
    convertCanvasToImage(canvas) {
      const image = new Image();
      image.src = canvas.toDataURL('image/png');
      return image;
    },

  },
};
</script>

<style scoped>
  #room {
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
    position: relative;
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
    box-shadow: 0 0 10px #d5cec6;
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

  .content .user-list img {
    height: 100%;
    border-radius: 100%;
  }

  .content .game-content, .ready-content {
    flex-grow: 1;
    box-shadow: 0 0 10px #d5cec6;
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
    content: '👇';
    position: absolute;
    top: -26px;
    width: 10px;
    height: 5px;
    left: 30%;
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
    box-shadow: 0 0 5px #d3d3d3;
    background: repeating-linear-gradient(-5deg, #f1eaef, #d4d6d0 10px, #eee9ed 0, #eee9ed 11px);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }

  .ready-content li.isself {
    border: 2px solid #F69B2F;
    background: repeating-linear-gradient(2deg, #f1eaef, #d4d6d0 10px, #634f10 0, #eee9ed 11px);
  }

  .ready-content li p {
    font-size: 20px;
    font-weight: bold;
    padding: 4px 0 0;
    background: #fff;
    width: 100%;
  }

  .ready-content li .index {
    position: absolute;
    left: -1px;
    top: -1px;
    width: 40px;
    height: 40px;
    background: chocolate;
    border-radius: 0 0 20px 0;
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
    box-shadow: 0 0 5px #d3d3d3;
  }

  .ready-content li .ready-status {
    position: absolute;
    right: -5px;
    bottom: 5px;
    font-size: 25px;
    color: #d17f05;
    box-shadow: 0 0 5px #d3d3d3;
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


  .small-btn {
    width: 2rem;
    height: 2rem;
    font-size: 30px;
    border-radius: 50%;
    box-shadow: 0 0 5px #d3d3d3;
    display: flex;align-items: center;
    justify-content: center;
  }

  .clear-btn {
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
    padding: 30px 20px;
    background: #e68383;
    box-shadow: 0 0 5px lightgray;
    border-radius: 5px;
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
      height: 46%;
      flex: 0 0 auto;
    }
    .ready-content li img {
      width: 70%;
    }
    .ready-content li p {
      font-size: 11px;
      font-weight: 700;
    }
  }
</style>
