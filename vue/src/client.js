/* eslint-disable no-console */
import { Loading } from 'element-ui';
import { login } from './pack/recv/login';
import { user, hall } from './pack/recv/hall';

const [url, port] = [process.env.VUE_APP_URL, process.env.VUE_APP_PORT];

export const client = new WebSocket(`ws:${url}:${port}`);

let loadingInstance;

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
      break;
    case 'draw':
      break;
    case 'chess':
      break;
    default:
      break;
  }
}

client.onopen = () => {
  console.log('opened');
};

client.onmessage = ({ data }) => {
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

  if (loading) {
    loadingInstance = Loading.service({ fullscreen: true });
  }
};

export const close = () => {
  client.close();
};
