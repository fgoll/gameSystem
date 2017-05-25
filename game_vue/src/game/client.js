/**
 * Created by SwiftJ on 17/1/23.
 */
class Loader {
    constructor() {

        this.loader = this._createLoader()
        this.p = document.createElement('p')
        this.loader.appendChild(this.p)
        this.mask = this._createMask()
    }

    show(info) {
        info = info || '......'
        this.p.innerHTML = info
        document.body.appendChild(this.mask)
        this.p.className = 'write-anim'
        document.body.appendChild(this.loader)
    }

    showAutoDismiss(info) {
      info = info || '......'
      this.p.innerHTML = info
      document.body.appendChild(this.mask)
      this.p.className = 'write-anim'
      document.body.appendChild(this.loader)
      setTimeout(() => {
        this.dismiss()
      },3000)
    }


    showError(error) {
        this.p.innerHTML = error
        this.p.className = 'write-center'
        document.body.appendChild(this.loader)
      setTimeout(() => {
        this.dismiss()
      },1000)
    }

    dismiss() {
        var mask = document.getElementsByClassName('loading')[0]
        mask && document.body.removeChild(mask)
        var loading = document.getElementsByClassName('mask')[0]
        loading && document.body.removeChild(loading)
    }

    _createLoader() {

        if (document.getElementsByClassName('loading').length > 0) {
            return document.getElementsByClassName('loading')[0]
        }

        var loading = document.createElement('div')
        loading.className = 'loading'

        var loader = document.createElement('div')
        loader.className = 'loader'
        loading.appendChild(loader)


        var ballInner = document.createElement('div')
        ballInner.className = 'ball-inner ball-scale-random'
        loader.appendChild(ballInner)

        for (var i = 0; i < 3; i++) {
            ballInner.appendChild(document.createElement('div'))
        }

        return loading
    }

    _createMask() {
        if (document.getElementsByClassName('mask').length > 0) {
            return document.getElementsByClassName('mask')[0]
        }
        var mask = document.createElement('div')
        mask.className = 'mask'
        return mask
    }
}

import store from '../store/store'
import { countdown } from '../store/modules/action'

// const host = '112.74.48.60'
const host = '127.0.0.1'
const port = 8888

// client 是客户端与服务端的websocket链接
export const client = new WebSocket(`ws:${host}:${port}`)

export const loader = new Loader('waiting...')

client.onmessage = function () {

}

client.onopen = function () {

}

// send 方法 obj是发送给服务端的参数,
export const send = function(obj, show=false) {
    client.send(JSON.stringify(obj))

  // 如果show == true 就弹出 waitting
    if (show) {
      loader.show('waiting......')
    }

}



export const close = () => {
    client.close()
  console.log('close')
}

client.onopen = event => {
    console.log('open')
}

var canvas = null;
var context = null;
var caswidth = 0
var casheight = 0


client.onmessage = ({ data }) => {
    let packet = JSON.parse(data)

    if (packet) {
        loader.dismiss()
        let action = packet.header.split('.')
        if (action[0] == 'login') {
            if (action[1] == 'success') {
              store.commit('User.FD', packet.data.w_id)
              store.commit('User.ID', packet.data.u_id)
              store.commit('User.ROLENAME', packet.data.rolename)
              store.commit('User.AVATAR', packet.data.avatar)
            }

            if (action[1] == 'error') {
                loader.showError(packet.msg)
            }

            if (action[1] == 'betop') {
              store.commit('User.FD', null)
              window.location.reload()
              alert('By the top number!')
            }
        }
        if (action[0] == 'register') {

            loader.showError(packet.msg)

        }
        if (action[0] == 'user') {
          if (action[1] == 'enter') {
            store.commit('Hall.USERENTER', packet.data)
          }
          if (action[1] == 'all') {
            store.commit('Hall.USERALL', packet.data)
          }
          if (action[1] == 'leave') {
            store.commit('Hall.USERLEAVE', packet.data.u_id)
          }
        }

        if (action[0] == 'hall') {
          if (action[1] == 'message') {
            store.commit('Hall.ADDMESSAGE', packet.data)
          }
        }

        if (action[0] == 'rooms') {
          if (action[1] == 'init') {
            store.commit('Room.INIT', packet.data)
          }
          if (action[1] == 'enter') {
            store.commit('User.ROOM.ID', packet.data)
          }
          if (action[1] == 'info') {
            if (packet.data.status == 'playing') {

            }
              store.commit('Room.SETINFO', packet.data)
          }
          if (action[1] == 'begin') {
            store.commit('Room.SETINFO', packet.data)
            store.commit('Room.BEGIN')
            if (packet.data.status == 'playing') {
              store.dispatch('countdown')
              setTimeout(function() {
                window.onresize()
              },10)
              // console.log(packet.data.game_type)
              if (packet.data.game_type == 'chess') {
                store.commit('Chess.BEGIN')

              }
            }

          }
          if (action[1] == 'willnext') {
            store.commit('SET_COUNTDOWN', packet.data)
          }
          if (action[1] == 'next') {
            store.commit('Room.SETINFO', packet.data)
            store.commit('Room.BEGIN')
            store.dispatch('countdown')
            if (packet.data.game_type == 'draw') {
              // setTimeout(function() {
                window.onresize()
              // },10)
            }else {

            }
          }
          if (action[1] == 'turned') {
            store.commit('Chess.CANDOWN')
          }
          if (action[1] == 'leave') {
            store.commit('User.ROOM.ID', null)
            store.commit('Room.CLEARMESSAGE')
          }
          if (action[1] == 'message')
          {
            store.commit('Room.ADDMESSAGE', packet.data)
          }

        }

        if (action[0] == 'draw') {
          if (action[1] == 'begin') {

            canvas = document.getElementById('cas')
            context = canvas.getContext('2d')
            caswidth = canvas.width
            casheight = canvas.height

            context.beginPath()
            context.strokeStyle = packet.data.color
            context.lineWidth = parseInt(packet.data.weight)
          }
          if (action[1] == 'move') {
            if (context) {

              context.lineTo(packet.data.x * caswidth, packet.data.y * casheight)
              context.stroke()
            }
          }
          if (action[1] == 'end') {
            context.closePath()
          }
          if (action[1] == 'clear') {
            canvas.height = canvas.height
          }
        }
        if (action[0] == 'chess') {
          if (action[1] == 'down') {

            canvas = document.getElementById('cas')
            context = canvas.getContext('2d')

            if (context) {
              window.onresize();
              let i = packet.data.i, j = packet.data.j, type = packet.data.army_type
              var canvasWidth = canvas.width, canvasHeight = canvas.height;
              var finalWidth = (canvasWidth > canvasHeight ? canvasHeight : canvasWidth) - 30;

              var width = finalWidth / 14;

              var left = (canvasWidth - finalWidth) / 2;

              var top = (canvasHeight - finalWidth) / 2;

              var x_point = left + i * width;
              var y_point = top + j * width;

              if (type == 'black') {
                store.commit('Chess.BLACK', { x: i, y: j })
              }else {
                store.commit('Chess.WHITE', { x: i, y: j })
              }
              drawChessPiece(context, width / 2, x_point, y_point, type)

              context.strokeStyle= "rgb(200,0,0)";
              context.strokeRect(x_point - width / 2, y_point - width / 2, width, width);
              // context.stroke();
            }
          }
          if (action[1] == 'over') {
            store.commit('SET_COUNTDOWN', 60);
            store.dispatch('clearCountDown');

          }
          if (action[1] == 'auto') {

            var i = packet.data.position.x
            var j = packet.data.position.y
            console.log(i, j);
            if (packet.data.army == '黑色方') {
              // store.commit('Chess.AUTO', 1)


            }else {
              // store.commit('Chess.AUTO', -1)
            }
          }

        }

    }
}

