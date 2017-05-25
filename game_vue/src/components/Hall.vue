<template>
    <div id="hall">
        <div class="nav">
            <div class="logo">
                <img src="../assets/PortableGame.png" alt="">
            </div>
            <div class="user-info">

                <div class="avatar"><img :src="user.avatar" alt=""></div>
                <span>{{ user.rolename }}, 欢迎您!</span>
            </div>
        </div>
        <div class="main">
            <div class="left">
                <div class="room-box">
                    <p class="title">Rooms</p>
                    <ul class="room-list" >
                        <li class="room-item" v-for="(room, room_id) in rooms">
                            <div class="top">
                                <div class="main-card">

                                    <div class="role-box" :class="{free: room.users[0] == null}">
                                      <template v-if="room.users[0] != null"><img src="../assets/icon-boy.png"
                                                                                                           alt="" v-show="room.users[0].sex == 0"><img src="../assets/icon-girl.png"
                                                                                                                                                       alt="" v-show="room.users[0].sex == 1"></template></div>
                                    <span class="owner">House Owner</span>
                                </div>
                                <span>{{ room_id + 1 }}</span>
                                <button class="button" @click="enterRoom(room_id, -1)">Join Game</button>
                            </div>
                            <div class="bottom">
                              <div class="role-box" v-for="n in 5" :class="{free: room.users[n] == null}"><template v-if="room.users[n] != null"><img src="../assets/icon-boy.png"
                                                                                                                                       alt="" v-show="room.users[n].sex == 0"><img src="../assets/icon-girl.png"
                                                                                                                                                                                   alt="" v-show="room.users[n].sex == 1"></template></div>
                            </div>
                        </li>

                    </ul>
                  <div class="join-tool">

                      <div class="button quick-btn" @click="enterRoom(-1, -1)">快速加入
                        <!--<ul class="quick-menu">-->
                          <!--<li>你画我猜</li>-->
                          <!--<li>五子棋</li>-->
                          <!--<li>随机</li>-->
                        <!--</ul>-->
                      </div>
                      <div>房间号: <input type="text" v-model="join_id"> <div class="button" @click="enterRoom(join_id - 1, -1)">加入</div></div>
                  </div>
                </div>
            </div>
            <div class="right">
                <div class="user-box">
                    <p class="title">Online User</p>
                    <ul class="user-list">
                        <li class="header"><span>Username</span><span>State</span></li>
                      <li @mouseover="showUserInfo" @mouseout="showUserInfo" v-for="user in users"><span>{{ user.rolename }}</span><span>{{ user.status }}</span></li>

                    </ul>
                    <transition name="fade">
                        <div class="user-info-card" v-show="false"></div>
                    </transition>

                </div>
                <div class="chat-box">
                    <p class="title">Chat List</p>
                    <ul class="chat-list">
                      <li v-for="m_user in messages" :class="{ 'chat-right': user.id == m_user.u_id }">

                        <div>
                          <img :src="m_user.avatar" alt="" class="chat-icon">
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
            </div>
          <!--<div class="showchat-btn">-->

          <!--</div>-->
        </div>
    </div>
</template>

<script>
    import Vue from 'vue'
    import { send,loader } from '../game/client'
    import { mapGetters } from 'vuex'
    export default {
      data() {
        return {
          isShow: false,
          message: '',
          isRight: false,
          join_id: null
        }
      },
      components: {

      },
      computed: {
        ...mapGetters([
          'user',
          'users',
          'messages',
          'rooms',
        ]),
      },
      watch: {
        messages() {
          let dom = document.getElementsByClassName("chat-list")[0]
          if(dom.scrollTop === dom.scrollHeight - dom.clientHeight) {
            Vue.nextTick(() => {
              dom.scrollTop = dom.scrollHeight
            })
          }
        },
      },
      methods: {
        showUserInfo() {
          this.isShow = !this.isShow;
        },
        dismissUserInfo() {
          this.isShow = false;
        },
        say() {
          if(this.message) {
            send({
              header: 'say_hall',
              data: {
                message: this.message,
              },
            })
            this.message = ''
          }
        },
        enterRoom(room_id, p_id) { // room_id 房间id,
//          alert(room_id)
          if (this.user.room_id) return null;
          if (room_id != -1) {
            let room = this.rooms[room_id] // 先取出这个房间
            if (room == null) { //
              loader.showAutoDismiss("room doesn't exists")
              return
            }
            if (room.status == 'playing') {
              alert('the room is playing')
              return
            }
            let users = this.rooms[room_id]['users']

            if (p_id == -1) {
              if (users.filter((ele) => {
                  return ele != null
                }).length == 6) {
                alert('the people is full')
                return
              }
            }
            let user = users[p_id]
            if (user) {
              alert('this position have people => ' + user.rolename)
              return
            }
          }

          send({
            header: 'enter_room',
            data: {
              room_id: room_id,
              p_id: p_id
            }
          }, true)
        }
      }
    };

</script>

<style scoped>

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
    }

    .nav .logo {
        margin-left: 10px;
        width: 100px;
        height:100%;
    }

    .nav .logo img {
        height: 100%;
    }

    .nav .user-info {
      height: 100%;
      border: 1px solid rgba(233, 186, 116, 0.4);
      width: 20rem;
      display: flex;
      flex-direction: row-reverse;
      justify-content: space-between;
      padding: 0 10px;
      align-items: center;
      box-shadow: 0 0 10px rgba(233, 186, 116, 0.4);
    }

    .nav .user-info .avatar {
      height: 3rem;
      width: 3rem;
      overflow: hidden;
      border-radius: 100%;
      box-shadow: 0 0 5px #8b8b8b;
      /*margin: 0 10px 0 20px;*/
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .nav .user-info .avatar img {
      height: 100%;

    }

    .main {
        height: 90%;
        display: flex;
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;

    }

    .main .left {
        /*width: 60%;*/
        flex: 1 1 60%;
        box-shadow: 0 0 2px #AA6008;
        overflow: hidden;
        border-radius: 5px;
        background: #fff;
        transition: all 0.2s;
        margin-right: 1%;
        height: 100%;
    }

    .main .right {
        flex-grow: 1;
        width: 30%;
        display: flex;
        transition: all 0.2s;
        flex-direction: column;
        height: 100%;
    }

    .main .right .user-box {
        box-shadow: 0 0 2px #AA6008;
        /*overflow: hidden;*/
        border-radius: 5px;
        /*flex: 1 0 38%;*/
        height:38%;
        flex-grow: 1;
        margin-bottom: 2%;
        background: #fff;
        position: relative;
    }

    .main .right .chat-box {
        box-shadow: 0 0 5px #AA6008;
        overflow: hidden;
        border-radius: 5px;
        flex-grow: 1;
        height: 50%;
        background: #fff;
        display: flex;
        flex-direction: column;
    }

    .main .title {
        margin-top: 1px;
        background: linear-gradient(#E88D06, #C77804);
        line-height: 35px;
        height: 35px;
        /*color: #582a05;*/
        color: #754649;
        font-weight: bold;
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
    }

    .room-list .room-item {
        background-color: #F69B2F;
        border-radius: 6px;
        width: 49%;
        padding: 1rem;
        margin-bottom: 2%;
        box-shadow: 0 2px 4px rgba(232, 141, 6, 40);
        transition: all 0.2s;
    }

    .room-list .bottom {
        margin-top: 0.8rem;
        display: flex;
        justify-content: flex-start;
    }

    .room-list .bottom div {
        width: 2rem;
        height: 2rem;
        margin-right: 0.5rem;
    }

    .room-list .top {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }

    .room-list .room-item .button {

        background: linear-gradient(#E88D06, #C77804);
        border-radius: 30% / 100%;
        border: 1px solid #be8130;
    }

    .room-list .room-item .button:hover {
        background: linear-gradient(#C77804, #E88D06);
    }

    .role-box {
        background-color: rgba(255, 255, 255, 0.1);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .role-box img {
      width: 80%;
      height: 80%;
    }

    .role-box.free::after {
        content: 'Free';
        position: absolute;
        font-size: 0.7rem;
        color: #616D82;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        justify-content: center;
        align-items: center;
        display: flex;
    }

    .main-card {
        height: 5rem;
        width: 8rem;
        background: #E88D06;
        border: 1px solid #BE6D0D;
        border-radius: 5px;
        display: flex;
        padding: 0.5rem;
        align-items: center;
    }

    .main-card .role-box {
        width: 3rem;
        height: 3rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5) inset;
        flex: 0 0 auto;
    }

    .user-list {
        overflow-y: scroll;
        height: calc(100% - 35px);
    }

    .user-list li {
        display: flex;
        justify-content: space-around;
        padding: 5px 0;
        position: relative;
    }

    .user-list li.header {
      font-weight: bold;
      border-bottom: 1px solid #f6f6f6;
      height: 35px;
      box-shadow: 0 0 10px gray;
      /*position: absolute;*/
      /*left: 0;*/
      /*right: 0;*/
    }

    .user-list li.header > span {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-list li:not(.header):hover {
        font-weight: bold;
        cursor: pointer;
    }

    .user-list ul:hover .user-info-card {
        opacity: 1;
    }

    div.user-info-card {
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
    }
    .join-tool .button {
      border-radius: 3px;
    }
    .join-tool > div {
      height:70%;
      display: flex;
      align-items: center;
      margin-right: 10px;
    }

    .join-tool .quick-btn {
      position: relative;
    }

    .join-tool .quick-btn:hover .quick-menu {
      transform: none;
    }

    .join-tool .quick-menu {
      position: absolute;

      left:0;
      top:-120px;
      width: 91px;
      background: #fff;
      transform: rotate3d(1, 0, 0, 90deg);
      transform-origin: 0% 100%;
      transition: 300ms ease-in-out;
      box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);

    }
    .join-tool .quick-menu li {
      height: 40px;
      color: #666;
      line-height: 40px;
    }

    .join-tool .quick-menu li:hover {
      color: #333;
      background: lightyellow;
    }

    .join-tool > div .button {
      height: 100%;
      display: flex;
      align-items: center;
    }
    .join-tool input {
      width:60px;
      padding:0;
      height:100%;
      border: 1px solid lightgrey;
      margin-right: 5px;
      margin-left: 3px;
      padding-left: 5px;
    }

    .user-list li span {
        flex: 0 0 50%;
    }

    span.owner {
        font-size: 0.8rem;
        color: #fff;
    }

    .fade-enter-active, .fade-leave-active {
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
            background: repeating-linear-gradient(170deg, #fff, #fff 50%, #f2911e 0, #ef9c39 100%);
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

        .showchat-btn {
          position: fixed;
          top: 5rem;
          right: 0.8rem;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 100%;
          background: #fff url("../assets/chat.png") no-repeat center center;
          box-shadow: 0 0 3px gray;
        }

        * {
          font-size: 12px;
        }
    }
</style>
