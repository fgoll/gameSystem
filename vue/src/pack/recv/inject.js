import { Message, MessageBox } from 'element-ui';
import store from '@/store';
import router from '@/router';

export default function inject(func) {
  return (status, packet) => {
    func.call(this, status, packet, store, router, Message, MessageBox);
  };
}
