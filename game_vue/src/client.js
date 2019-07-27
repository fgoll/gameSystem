/* eslint-disable no-console */
import { Loading, Message } from 'element-ui';
import { login } from './pack/recv/login';
import { user, hall } from './pack/recv/hall';
import { room, draw, chess } from './pack/recv/room';


const [url, port] = [process.env.VUE_APP_URL, process.env.VUE_APP_PORT];

export const client = new WebSocket(`ws:${url}:${port}`);

let loadingInstance;

let overtimeTimer;

function messageHanlder(packet) {
  const [action, status] = packet.header.split('.');
  switch (action) {
    case 'login':
      login(status, packet);
      break;
    case 'register':
      break;
    case 'user':
      user(status, packet);
      break;
    case 'hall':
      hall(status, packet);
      break;
    case 'rooms':
      room(status, packet);
      break;
    case 'draw':
      draw(status, packet);
      break;
    case 'chess':
      chess(status, packet);
      break;
    default:
      break;
  }
}

client.onopen = () => {
  console.log('opened');
};

client.onmessage = ({ data }) => {
  if (overtimeTimer) clearTimeout(overtimeTimer);
  const packet = JSON.parse(data);
  console.log(packet);

  messageHanlder(packet);

  if (loadingInstance) loadingInstance.close();
};

/**
 * send message to server
 * @param {Object} obj
 * @param {Boolean} loading
 */
export const send = (obj, loading = false) => {
  client.send(JSON.stringify(obj));
  if (process.env.NODE_ENV === 'development') {
    console.log(`send: ${JSON.stringify(obj)}`);
  }

  if (loading) {
    loadingInstance = Loading.service({ fullscreen: true });
  }

  overtimeTimer = setTimeout(() => {
    Message.error('overtime...');
    if (loadingInstance) loadingInstance.close();
  }, 10000);
};

export const close = () => {
  client.close();
};
