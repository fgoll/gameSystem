<template>
  <div id="login" class="login-bg">
    <div class="box">
      <div class="left">
        <img src="../assets/PortableGame.png" alt>
        <p class="header_title">Party Play</p>
      </div>
      <div class="right">
        <!--<transition enter-active-class="bounceInLeft" leave-active-class="bounceOutRight">-->
        <div v-show="islogin" class="login-box lr-box animated">
          <p class="title">Log in</p>
          <div class="input-box">
            <input v-model="user.username" type="text" placeholder="UserName">
            <input
              v-model="user.password"
              type="password"
              placeholder="Password"
              @keydown.enter="login"
            >
          </div>
          <div class="acc-row">
            <div />
            <a href class="forget-pwd">Forgot password?</a>
          </div>
          <input type="button" class="button" value="Log in" @click="login">
          <p class="sign-row">
            Don't have an account?
            <a href @click.prevent="islogin=false">Sign up</a>
          </p>
        </div>
        <!--</transition>-->
        <div v-show="!islogin" class="register-box lr-box">
          <p class="title">Register</p>
          <div class="input-box">
            <input v-model="user.username" type="text" placeholder="UserName">
            <input v-model="user.password" type="password" placeholder="Password">
            <input v-model="user.rolename" type="text" placeholder="Rolename">
            <div class="upload-row">
              <a href="javascript:;" class="file">
                Upload icon
                <input id="file" type="file" name>
              </a>
              <div>
                <svg-icon icon-class="check" />
                <div class="div11" :class="{ dagou: baseimg != '' }" />
              </div>
            </div>
          </div>
          <input type="button" class="button" value="Register" @click="register">
          <p class="sign-row">
            Already have an account?
            <a href @click.prevent="islogin=true">Log in</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      islogin: true,
      baseimg: '',

      user: {
        username: null,
        password: null,
        rolename: null,
        icon: null,
      },
    };
  },

  methods: {
    login() {

    },
    register() {

    },
  },
};
</script>

<style lang='scss'>
.file {
  position: relative;
  display: inline-block;
  background: #f2911e;
  border: 1px solid #d67908;
  border-radius: 4px;
  padding: 4px 12px;
  overflow: hidden;
  color: #fff;
  text-decoration: none;
  text-indent: 0;
  line-height: 20px;
  margin: 10px 0;
  input {
    position: absolute;
    font-size: 100px;
    right: 0;
    top: 0;
    opacity: 0;
  }

  &:hover {
    background: #aadffd;
    border-color: #78c3f3;
    color: #004974;
    text-decoration: none;
  }
}

.login-bg {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: repeating-linear-gradient(
    170deg,
    #fff,
    #fff 50%,
    #f2911e 0,
    #ef9c39 100%
  );
}

.box {
  width: 80%;
  height: 65%;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 10px 33px 15px -20px #7f4e13, 0 -21px 15px -20px #eeeeee;
  display: flex;
  position: relative;
  max-width: 800px;

  .left {
    width: 40%;
    background: #f69b2f;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: all 0.2s linear;
    flex: 0 0 auto;
  }
}

.header_title {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  padding: 10px 0;
}

.box .right {
  transition: all 0.2s linear;
  flex-grow: 1;
  background: #fff;
  overflow: hidden;
}

.lr-box {
  padding: 20px 40px 0;
  height: 100%;

  .title {
    font-size: 25px;
    color: #f69b2f;
    margin-bottom: 40px;
  }
  .button {
    font-size: 18px;
    width: 180px;
    border-radius: 25% / 100%;
  }

  .input-box {
    input {
      width: 100%;
      height: 40px;
      margin-bottom: 10px;
      border: none;
      border-bottom: 1px solid #eee;
    }
  }

  .sign-row {
    margin-top: 15px;
    color: #b5b5b5;
    a {
      text-decoration: underline;
    }
  }
}
.acc-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10%;
  align-items: center;
  .forget-pwd {
    font-size: 15px;
    color: #b5b5b5;
  }
}

.upload-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10%;
  align-items: center;
  padding: 0 20px;
  > div {
    position: relative;
  }
  img {
    width: 30px;
    height: 30px;
  }
}

.div11 {
  position: absolute;
  width: 30px;
  height: 30px;
  top: 0;
  background: #fff;
  left: 0;
}
.dagou {
  -moz-animation: myfirst 3s; /* Firefox */
  -webkit-animation: myfirst 3s; /* Safari 和 Chrome */
  -o-animation: myfirst 3s;
  animation: myfirst 5s;
  animation-fill-mode: forwards;
}
@keyframes myfirst {
  0% {
    left: 0;
  }

  100% {
    left: 100px;
  }
}

@-moz-keyframes myfirst /* Firefox */ {
  0% {
    left: 0;
  }

  100% {
    left: 100px;
  }
}

@-webkit-keyframes myfirst /* Safari 和 Chrome */ {
  0% {
    left: 0;
  }

  100% {
    left: 100px;
  }
}

@-o-keyframes myfirst /* Opera */ {
  0% {
    left: 0;
  }

  100% {
    left: 100px;
  }
}

@media (max-width: 580px) {
  .box {
    flex-direction: column;
    .left {
      width: 100%;
      img {
        height: 0;
      }
    }
  }

  .login-box {
    .title {
      margin-bottom: 20px;
    }
  }

  .register-box {
    .title {
      margin-bottom: 5px;
    }
  }
  .lr-box {
    .upload-row {
      margin-bottom: 10px;
    }
  }
  .box {
    height: auto;
  }
  .lr-box {
    padding: 20px 40px 20px;
  }
}
</style>
