<template>
  <div id="chessroom">
    <div class="header">
      <div class="time-box">
        <p>time</p>
        <p class="big-font">{{ roomDuration }}</p>
      </div>
      <div class="title-box">
        <p>{{ room.game_type }}</p>
      </div>
      <button class="button" @click="leave">quit</button>
      <div class="name-label">{{ roomUser.rolename }}</div>
    </div>
    <div class="content">
      <ul class="user-list">
        <li
          v-for="(u, index) in whiteArmy"
          :key="index"
          :class="{ current: u != null && u.status == 'action',
                    trusteeship: u != null && u.trusteeship == 'auto' }"
          class="white-army"
        >
          <template v-if="u">
            <div class="user-icon">
              <img :src="u.avatar" alt="">
            </div>
            <p>{{ u.rolename }}</p>
          </template>
        </li>
        <li
          v-for="(u, index) in blackArmy"
          :key="whiteArmy.length + index"
          :class="{ current: u != null && u.status == 'action',
                    trusteeship: u != null && u.trusteeship == 'auto' }"
          class="black-army"
        >
          <template v-if="u">
            <div class="user-icon">
              <img :src="u.avatar" alt="">
            </div>
            <p>{{ u.rolename }}</p>
          </template>
        </li>
      </ul>
      <ul v-show="room.status != 'playing'" class="ready-content">
        <li
          v-for="(u, index) in whiteArmy"
          :key="index"
          :data-id="index"
          :class="{ isself: u != null && u.u_id == user.id }"
          @click="changePos"
        >
          <!--{{ u.u_id }}-->
          <span class="index index1">{{ index + 1 }}</span>
          <template v-if="u">
            <img :src="u.avatar" alt="">
            <p>{{ u.rolename }}</p>

            <span v-show="u.status == 'ready'" class="ready-status">已准备</span>
          </template>

        </li>
        <li
          v-for="(u, index) in blackArmy"
          :key="whiteArmy.length + index"
          :data-id="whiteArmy.length + index"
          :class="{ isself: u != null && u.u_id == user.id }"
          @click="changePos"
        >
          <!--{{ u.u_id }}-->
          <span class="index index2">{{ index + 1 }}</span>
          <template v-if="u">
            <img :src="u.avatar" alt="">
            <p>{{ u.rolename }}</p>

            <span v-show="u.status == 'ready'" class="ready-status">已准备</span>
          </template>

        </li>
      </ul>
      <div v-show="room.status == 'playing'" class="game-content">
        <div ref="board" class="board">
          <div

            class="board-inner"
            @click="click"
          >
            <div>
              <div v-for="(row, rIndex) in board" :key="rIndex">
                <template v-for="(col, cIndex) in row">
                  <div
                    v-if="col"
                    :key="cIndex"
                    class="chessman"
                    :class="(col === 1 ? 'black' : 'white') +
                      (isLast([rIndex, cIndex]) ? ' last-step' : '') +
                      (isFives([rIndex, cIndex]) ? ' fives' : '')"
                    :style="{
                      marginTop: (1.5 + rIndex*6.53) + '%',
                      marginLeft: (1.5 + cIndex*6.53) + '%',
                    }"
                  />
                </template>

              </div>
            </div>

            <div
              v-for="(step, index) in steps"
              :key="index"
              class="step"
              :class="(step.role === 1 ? 'black' : 'white') + (isFives(step.position) ?
                ' fives' : '')"
              :style="{
                marginTop: (1.5 + step.position[0]*6.53) + '%',
                marginLeft: (1.5 + step.position[1]*6.53) + '%',
              }"
            >
              {{ index+1 }}
            </div>
          </div>
        </div>
        <div class="tool-bar">

          <div class="button" @click="switchTrusteeship">
            {{ trusteeship ? '取消托管' : '托管' }}
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
              <textarea v-model="message" placeholder="发送内容" @keydown.enter.prevent.stop="say" />
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
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import RoomMixins from '@/mixins/room.mixins';
import ai from '@/ai';
import SCORE from '@/ai/score';
import win from '@/ai/win';

import {
  changePos, chessDown, chessWin,
} from '@/pack/send/room';

const BLACK = 1;
const WHITE = 2;

export default {
  mixins: [RoomMixins],
  data() {
    return {
      icon: 'gm.JPG',
      downed: false,
      trusteeship: false,
    };
  },
  computed: {
    ...mapGetters([
      'board',
      'steps',
      'fives',
    ]),
    whiteArmy() {
      return this.room.users.slice(0, 3);
    },
    blackArmy() {
      return this.room.users.slice(3, 6);
    },
    role() {
      return this.room.users.indexOf(this.roomUser) < 3 ? WHITE : BLACK;
    },
    armyType() {
      return this.role === BLACK ? 'black' : 'white';
    },
  },
  watch: {
    'roomUser.status': function _(status) {
      if (status === 'action' && this.trusteeship) {
        const [x, y] = this.steps[this.steps.length - 1].position;
        this.handleAiPut(x, y);
      }
    },
  },
  mounted() {
    this.init();
  },
  destroyed() {
    window.onresize = null;
  },
  methods: {
    ...mapMutations([
      'chess/ADD_CHESSMAN',
    ]),
    init() {
      const { board } = this.$refs;
      const parent = board.parentNode;

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
          width, height,
        } = getSize();
        const size = width > height ? height : width;
        [board.style.width, board.style.height] = [`${size}px`, `${size}px`];
      };
    },

    switchTrusteeship() {
      this.trusteeship = !this.trusteeship;
    },

    click(e) {
      if (!this.canAction) return;
      this.roomUser.status = 'playing';
      let y = e.offsetX;
      let x = e.offsetY;
      const width = this.$refs.board.clientWidth;
      const offset = width * 0.044;
      const step = width * 0.065;
      x = Math.floor((x + offset) / step) - 1;
      y = Math.floor((y + offset) / step) - 1;

      this.set([x, y]);
    },

    set(position) {
      // if (this.status !== STATUS.PLAYING) return;

      const [x, y] = position;

      if (this.board[x][y] !== 0) {
        throw new Error('NOT_EMPTY');

      }

      this['chess/ADD_CHESSMAN']({ position, role: this.role });

      // this.status = STATUS.THINKING;
      this.startTime = +new Date();
      if (this.status === 'locked') return;

      chessDown({
        i: x,
        j: y,
        army: this.armyType,
      });
      // setTimeout(() => {
      //   // this.handleAiPut(x, y);
      // }, 1000);
    },

    changePos(e) {
      const pos = e.target.dataset.id;
      const targetUser = this.room.users[pos];
      if (!targetUser) {
        if (this.roomUser.status === 'waiting') {
          changePos({
            op_id: this.roomUser.p_id,
            p_id: pos,
            room_id: this.user.roomId,
          });
        }

        return;
      }
      if (+targetUser.u_id !== +this.user.id) {
        this.$message.error('this position have people');
      }
    },

    handleAiPut(x, y) {
      const p = ai.turn(x, y);
      const { score, step } = p;
      this.set([p[0], p[1]]);
      if (score >= SCORE.FIVE / 2) {
        if (step <= 1) {
          this.fives = win(this.board);
          console.log('you lose');
          this.status = 'locked';
        }
      } else if (score <= -SCORE.FIVE / 2) {
        if (step <= 1) {
          console.log('you win');
          this.status = 'locked';
          this.fives = win(this.board);
          // chessWin(())
        }
      }
    },
    isLast(p) {
      if (!this.steps.length) return false;
      const last = this.steps[this.steps.length - 1].position;

      return last[0] === p[0] && last[1] === p[1];
    },

    isFives(p) {
      if (!this.fives.length) return false;
      for (let i = 0; i < this.fives.length; i++) {
        const f = this.fives[i];
        if (p[0] === f[0] && p[1] === f[1]) {
          return true;
        }
      }
      return false;
    },
  },
};
</script>

<style lang='scss' scoped>
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

  .content .user-list img {
    height: 100%;
    border-radius: 100%;
  }

  .content .game-content, .ready-content {
    flex-grow: 1;
    box-shadow: 0 0 10px #AA6008;
    overflow: hidden;
    border-radius: 5px;
    background: #fff;
    position: relative;
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
    /* background: url("../assets/ARROW.png") no-repeat center center; */
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
    display: flex;
    color: #fff;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 20px;
  }

  .ready-content li .index.index1 {
    background: white;
    color: #000000;
  }

  .ready-content li .index.index2 {
    background: black;
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

  .small-btn {
    width: 2rem;
    height: 2rem;

    border-radius: 50%;
    box-shadow: 0 0 5px gray;

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
      position: relative;
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
      font-size: 16px;
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


.board {
  margin: 0 auto;
}
.board-inner {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  position: relative;
  background-image: url("../../assets/board.jpg");
  background-size: 100%;
}
.chessman, .step {
  position: absolute;
  width: 2rem;
  height: 2rem;
  line-height: 2rem;
  text-align: center;
  border-radius: 50%;
  font-size: 1.2rem;
  user-select: none;
}
.chessman {
  top: 0;
  bottom: 0;
  background-color: black;

  &.white {
    background-color: white;
  }
}

.step {
  color: white;
  &.white {
    color: black;
  }
}

.last-step {
  box-shadow: 0 0 0 .4rem rgba(255, 0, 0, 0.4);
  animation: pulse 1.2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.8);
  }
  70% {
    box-shadow: 0 0 0 .6rem rgba(255, 0, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
  }
}

.fives {
  animation: flash .8s infinite;
  box-shadow: none;
}
.tool-bar {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
}

@keyframes flash {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
