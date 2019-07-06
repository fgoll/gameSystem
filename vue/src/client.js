/* eslint-disable no-console */
import { Loading } from 'element-ui';
import { login } from './pack/recv/login';

const [url, port] = [process.env.VUE_APP_URL, process.env.VUE_APP_PORT];

export const client = new WebSocket(`ws:${url}:${port}`);

let loadingInstance;

client.onopen = () => {
  console.log('opened');
};

client.onmessage = ({ data }) => {
  const packet = JSON.parse(data);

  const [action, status] = packet.header.split('.');

  if (loadingInstance) loadingInstance.close();

  switch (action) {
    case 'login':
      login(status, packet);
      break;
    case 'register':
      break;
    case 'user':
      break;
    case 'hall':
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
