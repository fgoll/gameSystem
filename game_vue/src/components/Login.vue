<template>
    <div id="login" class="login-bg">
        <div class="box">
            <div class="left">
                <img src="../assets/PortableGame.png" alt="">
                <p class="header_title">Party Play</p>
            </div>
            <div class="right">
              <!--<transition enter-active-class="bounceInLeft" leave-active-class="bounceOutRight">-->
                <div class="login-box lr-box animated" v-show="islogin">
                    <p class="title">Log in</p>
                    <div class="input-box">
                        <input type="text" placeholder="UserName" v-model="username">
                        <input type="password" placeholder="Password" v-model="password" @keydown.enter="login">
                    </div>
                    <div class="acc-row">
                        <div></div>
                        <a href="" class="forget-pwd">Forgot password?</a>
                    </div>
                    <input type="button" class="button" value="Log in" @click="login" >
                    <p class="sign-row">Don't have an account? <a href="" @click.prevent="islogin=false">Sign up</a></p>
                </div>
              <!--</transition>-->
                <div class="register-box lr-box" v-show="!islogin">
                  <p class="title">Register</p>
                  <div class="input-box">
                    <input type="text" placeholder="UserName" v-model="username">
                    <input type="password" placeholder="Password" v-model="password" >
                    <input type="text" placeholder="Rolename" v-model="rolename" >
                    <div class="upload-row">
                      <a href="javascript:;" class="file">Upload icon
                        <input type="file" name="" id="file">
                      </a>
                      <div>
                        <img src="../../static/duihao.png"/>
                        <div class="div11" :class="{ dagou: this.baseimg != '' }"></div>
                      </div>
                    </div>

                  </div>
                  <input type="button" class="button" value="Register" @click="register" >
                  <p class="sign-row">Already have an account? <a href="" @click.prevent="islogin=true">Log in</a></p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { send } from '../game/client'

    export default {
        name: "login",
        data() {
            return {
                username: '',
                password: '',
                rolename: '',
                baseimg: '',
                islogin: true
            }
        },
        mounted() {
          var self = this;
          function readFile() {
            if (this.files && this.files[0]) {

              var FR= new FileReader();

              console.log(this.files[0].size)
              FR.addEventListener("load", function(e) {
                var base64Img       = e.target.result;

                var _ir=ImageResizer({
                  resizeMode:"auto",
                  dataSource:base64Img,
                  dataSourceType:"base64",
                  maxWidth:100, //允许的最大宽度
                  maxHeight:100, //允许的最大高度。
                  onTmpImgGenerate:function(img){
                  },
                  success:function(resizeImgBase64,canvas){

                    console.log(resizeImgBase64.length)
                    self.baseimg = resizeImgBase64

                  }
                });
              });

              FR.readAsDataURL( this.files[0] );
            }
          }
          document.getElementById("file").addEventListener("change", readFile);
        },
        methods: {
            login() {
              // 为什么这里要有header 和 data
              // 因为前端与后端 通讯格式要统一
              var obj = {
                header: 'login',
                data: {
                  username: this.username,
                  password: this.password
                }
              }

              send(obj, true)

                // 弹出loading
            },
            register() {

              if (!this.username && !this.password && !this.rolename) {
                alert('请输入账号密码用户')
                return
              }

                //发送文件
               send({
                 header: 'register',
                 data: {
                   username: this.username,
                   password: this.password,
                   rolename: this.rolename,
                   icon: this.baseimg
                 }
               }, true)

            }
        }
    }
</script>

<style>

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
  }
  .file input {
    position: absolute;
    font-size: 100px;
    right: 0;
    top: 0;
    opacity: 0;
  }
  .file:hover {
    background: #AADFFD;
    border-color: #78C3F3;
    color: #004974;
    text-decoration: none;
  }

  .login-bg {
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        background: repeating-linear-gradient(170deg, #fff, #fff 50%, #f2911e 0, #ef9c39 100%);
    }

    .box {
        width: 80%;
        height: 65%;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 10px 33px 15px -20px #7f4e13,
                    0 -21px 15px -20px #eeeeee;
        display: flex;
        position: relative;
        max-width: 800px;
    }

    .box .left {
        width: 40%;
        background: #f69b2f;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transition: all 0.2s linear;
        flex: 0 0 auto;
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
    }

    .lr-box .title {
        font-size: 25px;
        color: #f69b2f;
        margin-bottom: 40px;
    }

    .lr-box .button {
        font-size: 18px;
        width: 180px;
        border-radius: 25% / 100%;
    }

    .lr-box .acc-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10%;
        align-items: center;
    }

  .lr-box .upload-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10%;
    align-items: center;
    padding: 0 20px;
  }

    .lr-box .acc-row .forget-pwd {
        font-size: 15px;
        color: #b5b5b5;

    }

  .lr-box .upload-row > div {
    position: relative;
  }

    .upload-row img {
      width: 30px;
      height: 30px;

    }
  .div11{position: absolute;width: 30px;height: 30px; top: 0;background:#fff;left:0 }
  .dagou {
    -moz-animation: myfirst 3s;  /* Firefox */
    -webkit-animation: myfirst 3s;  /* Safari 和 Chrome */
    -o-animation: myfirst 3s;
    animation: myfirst 5s;
    animation-fill-mode: forwards;
  }
  @keyframes myfirst
  {
    0%   {left: 0;}

    100% {left:100px;}
  }

  @-moz-keyframes myfirst /* Firefox */
  {
    0%   {left: 0;}

    100% {left:100px;}
  }

  @-webkit-keyframes myfirst /* Safari 和 Chrome */
  {
    0%   {left: 0;}

    100% {left:100px;}
  }

  @-o-keyframes myfirst /* Opera */
  {
    0%   {left: 0;}

    100% {left:100px;}
  }

    .lr-box .input-box input {
        width: 100%;
        height: 40px;
        margin-bottom: 10px;
        border: none;
        border-bottom: 1px solid #eee;
    }

    .lr-box .sign-row {
        margin-top: 15px;
        color: #b5b5b5
    }
    .lr-box .sign-row a { text-decoration: underline; }
    @media (max-width: 580px) {

        .box {
            flex-direction: column;
        }

        .box .left {
            width: 100%;

        }

        .box .left img {
            height: 0;
        }

        .login-box .title {
            margin-bottom: 20px;
        }

        .register-box .title {
          margin-bottom: 5px;
        }
      .lr-box .upload-row {
        margin-bottom: 10px;
      }
      .box {
        height: auto;
      }
      .lr-box {
        padding: 20px 40px 20px;
      }
    }


</style>

