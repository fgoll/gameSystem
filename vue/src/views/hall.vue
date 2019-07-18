<template>
  <div id="hall">
    <div class="nav">
      <div class="logo">
        <img src="../assets/PortableGame.png" alt>
      </div>
      <div v-if="user" class="user-info">
        <div class="avatar">
          <img :src="user.avatar" alt>
        </div>
        <span>{{ user.rolename }}, {{ $t('hall.welcome') }}!</span>
      </div>
    </div>
    <div class="main">
      <div class="left">
        <div class="room-box">
          <p class="title">{{ $t('hall.rooms') }}</p>
          <ul class="room-list">

            <li v-for="(room, index) in hallRooms" :key="room.r_id" class="room-item">
              <div class="top">
                <div class="main-card">
                  <div class="role-box">
                    <template v-if="room.users[0] != null">
                      <svg-icon v-show="room.users[0].sex === 0" icon-class="boy" />
                      <svg-icon v-show="room.users[0].sex === 1" icon-class="girl" />
                    </template>
                    <template v-else>{{ $t('hall.free') }}</template>
                  </div>
                  <span class="owner">{{ $t('hall.owner') }}</span>
                </div>
                <span>{{ index + 1 }}</span>
                <button class="button" @click="enterRoom(room, -1)">
                  {{ $t('hall.joinGame') }}
                </button>
              </div>
              <div class="bottom">
                <div
                  v-for="n in 5"
                  :key="n"
                  class="role-box"
                >
                  <template v-if="room.users[n] != null">
                    <svg-icon v-show="room.users[n].sex === 0" icon-class="boy" />
                    <svg-icon v-show="room.users[n].sex === 1" icon-class="girl" />
                  </template>
                  <template v-else>{{ $t('hall.free') }}</template>
                </div>
              </div>
            </li>
          </ul>
          <div class="join-tool">
            <div class="button quick-btn" @click="enterRoom(-1, -1)">
              {{ $t('hall.quickJoin') }}
            </div>
            <div>
              {{ $t('hall.roomNum') }}:
              <input v-model="joinId" type="text">
              <div class="button" @click="enterRoom(joinId - 1, -1)">{{ $t('hall.join') }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="user-box">
          <p class="title">{{ $t('hall.user.users') }}</p>
          <ul v-if="hallUsers" class="user-list">
            <li class="header">
              <span>{{ $t('hall.user.username') }}</span>
              <span>{{ $t('hall.user.state') }}</span>
            </li>
            <li
              v-for="(user) in hallUsers"

              :key="user.id"
            >
              <span>{{ user.rolename }}</span>
              <span>{{ user.status }}</span>
            </li>
          </ul>
          <transition name="fade">
            <div v-show="false" class="user-info-card" />
          </transition>
        </div>
        <div class="chat-box">
          <p class="title">{{ $t('hall.chat') }}</p>
          <ul class="chat-list">
            <li
              v-for="(msg, index) in hallMessages"
              :key="index"
              :class="{ 'chat-right': user.id == msg.u_id }"
            >
              <div>
                <img :src="msg.avatar" alt class="chat-icon">
                <span>{{ msg.rolename }}</span>
              </div>
              <p class="chat-content">{{ msg.message }}</p>
            </li>
          </ul>
          <div class="send-box">
            <div class="send-input">
              <textarea
                v-model="message"
                :placeholder="$t('hall.placeholder')"
                @keydown.enter.prevent.stop="say"
              />
              <button class="btn" @click="say" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { say, enterRoom } from '@/pack/send/hall';

export default {
  data() {
    return {
      message: '',

      rooms: [],
      joinId: null,
    };
  },

  computed: {
    ...mapGetters([
      'user',
      'hallRooms',
      'hallUsers',
      'hallMessages',
    ]),
  },

  watch: {
    hallMessages() {
      const dom = document.getElementsByClassName('chat-list')[0];
      if (dom.scrollTop === dom.scrollHeight - dom.clientHeight) {
        this.$nextTick(() => {
          dom.scrollTop = dom.scrollHeight;
        });
      }
    },
  },

  created() {
    this.roomsMap = {};
    const rooms = this.hallRooms;
    for (let i = 0; i < rooms.length; i++) {
      this.roomsMap[+rooms[i].r_id] = rooms[i];
    }
  },

  methods: {
    enterRoom(room, pId) {
      let roomId;
      if (typeof room === 'object') {
        roomId = +room.r_id;
      } else {
        roomId = room;
        room = this.roomsMap[room];
      }

      if (roomId !== -1) {
        if (!room) {
          this.$message.error("room doesn't exists");
          return;
        }

        if (room.status === 'playing') {
          this.$message.error('the room is playing');
          return;
        }

        const { users } = room;
        if (users.filter(ele => ele != null).length === 6) {
          this.$message.error('the people is full');
          return;
        }

        if (pId !== -1) {
          const user = users[pId];
          if (user) {
            this.$message.error(`this position have people => ${user.rolename}`);
            return;
          }
        }
      }

      enterRoom({
        room_id: roomId,
        p_id: pId,
      });
    },
    say() {
      say({
        message: this.message,
      });
      this.message = '';
    },
  },
};
</script>

<style lang='scss' scoped>
#hall {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
.nav {
  height: 10%;
  border-bottom: 1px solid #f6f6f6;
  display: flex;
  justify-content: space-between;
  padding: 0.5% 1%;
  background: #fff;
  .logo {
    margin-left: 10px;
    width: 100px;
    height: 100%;
    img {
      height: 100%;
    }
  }
  .user-info {
    height: 100%;
    border: 1px solid rgba(233, 186, 116, 0.4);
    width: 20rem;
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    padding: 0 10px;
    align-items: center;
    box-shadow: 0 0 10px rgba(233, 186, 116, 0.4);
    .avatar {
      height: 3rem;
      width: 3rem;
      overflow: hidden;
      border-radius: 100%;
      box-shadow: 0 0 5px #8b8b8b;
      /*margin: 0 10px 0 20px;*/
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        height: 100%;
      }
    }
  }
}

.main {
  height: 90%;
  display: flex;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  .title {
    margin-top: 1px;
    background: linear-gradient(#e88d06, #c77804);
    line-height: 35px;
    height: 35px;
    /*color: #582a05;*/
    color: #754649;
    font-weight: bold;
  }
  .left {
    /*width: 60%;*/
    flex: 1 1 60%;
    box-shadow: 0 0 2px #aa6008;
    overflow: hidden;
    border-radius: 5px;
    background: #fff;
    transition: all 0.2s;
    margin-right: 1%;
    height: 100%;
  }
  .right {
    flex-grow: 1;
    width: 30%;
    display: flex;
    transition: all 0.2s;
    flex-direction: column;
    height: 100%;
    .user-box {
      box-shadow: 0 0 2px #aa6008;
      /*overflow: hidden;*/
      border-radius: 5px;
      /*flex: 1 0 38%;*/
      height: 38%;
      flex-grow: 1;
      margin-bottom: 2%;
      background: #fff;
      position: relative;
    }
    .chat-box {
      box-shadow: 0 0 5px #aa6008;
      overflow: hidden;
      border-radius: 5px;
      flex-grow: 1;
      height: 50%;
      background: #fff;
      display: flex;
      flex-direction: column;
    }
  }
}

.room-box {
  height: 100%;
}

.room-list {
  display: flex;
  padding: 2%;
  padding-bottom: 0;

  flex-wrap: wrap;
  justify-content: space-between;
  overflow-y: scroll;
  height: calc(100% - 75px);
  .room-item {
    background-color: #f69b2f;
    border-radius: 6px;
    width: 49%;
    padding: 1rem;
    margin-bottom: 2%;
    box-shadow: 0 2px 4px rgba(232, 141, 6, 40);
    transition: all 0.2s;
    .button {
      background: linear-gradient(#e88d06, #c77804);
      border-radius: 30% / 100%;
      border: 1px solid #be8130;
      &:hover {
        background: linear-gradient(#c77804, #e88d06);
      }
    }
  }
  .bottom {
    margin-top: 0.8rem;
    display: flex;
    justify-content: flex-start;
    div {
      width: 2rem;
      height: 2rem;
      margin-right: 0.5rem;
    }
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
}

.role-box {
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.7rem;

  img {
    width: 80%;
    height: 80%;
  }
  // &.free::after {
  //   content: "Free";
  //   position: absolute;
  //   font-size: 0.7rem;
  //   color: #616d82;
  //   left: 0;
  //   right: 0;
  //   top: 0;
  //   bottom: 0;
  //   justify-content: center;
  //   align-items: center;
  //   display: flex;
  // }
}

.main-card {
  height: 5rem;
  width: 8rem;
  background: #e88d06;
  border: 1px solid #be6d0d;
  border-radius: 5px;
  display: flex;
  padding: 0.5rem;
  align-items: center;
  .role-box {
    width: 3rem;
    height: 3rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5) inset;
    flex: 0 0 auto;
  }
}

.user-list {
  overflow-y: scroll;
  height: calc(100% - 35px);
  ul:hover .user-info-card {
    opacity: 1;
  }
  li {
    display: flex;
    justify-content: space-around;
    padding: 5px 0;
    position: relative;
    span {
      flex: 0 0 50%;
    }

    &.header {
      font-weight: bold;
      border-bottom: 1px solid #f6f6f6;
      height: 35px;
      box-shadow: 0 0 10px gray;
      /*position: absolute;*/
      /*left: 0;*/
      /*right: 0;*/

      > span {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    :not(.header):hover {
      font-weight: bold;
      cursor: pointer;
    }
  }
}

.user-info-card {
  position: absolute;
  width: 200px;
  /*height: 250px;*/
  border: 1px solid rgba(233, 186, 116, 0.4);
  background: #fff;
  box-shadow: 0 0 5px #ef9c39;
  left: -200px;
  top: 70px;
  bottom: 0;
  border-radius: 5px;
  /*opacity: 0;*/
  transition: all 0.2s;
}

.join-tool {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 40px;
  /*border-top: 1px solid #C77804;*/
  box-shadow: 0 0 3px #ef9c39;
  background: lightyellow;
  input {
    width: 60px;
    padding: 0;
    height: 100%;
    border: 1px solid lightgrey;
    margin-right: 5px;
    margin-left: 3px;
    padding-left: 5px;
  }
  > div {
    height: 70%;
    display: flex;
    align-items: center;
    margin-right: 10px;
    .button {
      height: 100%;
      display: flex;
      align-items: center;
    }
  }

  .button {
    border-radius: 3px;
  }
  .quick-btn {
    position: relative;

    :hover .quick-menu {
      transform: none;
    }
  }
  .quick-menu {
    position: absolute;

    left: 0;
    top: -120px;
    width: 91px;
    background: #fff;
    transform: rotate3d(1, 0, 0, 90deg);
    transform-origin: 0% 100%;
    transition: 300ms ease-in-out;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
    li {
      height: 40px;
      color: #666;
      line-height: 40px;
      &:hover {
        color: #333;
        background: lightyellow;
      }
    }
  }
}

.owner {
  font-size: 0.8rem;
  color: #fff;
  flex: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: 0.2s all ease;
}

.fade-enter-active {
  opacity: 1;
  width: 300px;
}

.fade-enter-to {
  opacity: 0;
}

.fade-leave-active {
  opacity: 0;
}

@media (max-width: 600px) {
  .room-list .room-item {
    width: 100%;
  }
  #hall {
    background: repeating-linear-gradient(
      170deg,
      #fff,
      #fff 50%,
      #f2911e 0,
      #ef9c39 100%
    );
  }
}

@media (max-width: 910px) {
  .main .left {
    flex-basis: 100%;
    margin-right: 0;
  }

  .main .right {
    width: 0;
    opacity: 0;
  }
  * {
    font-size: 12px;
  }
}
</style>
