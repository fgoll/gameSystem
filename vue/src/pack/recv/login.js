import { Message, MessageBox } from 'element-ui';
import store from '@/store';
import router from '@/router';
import i18n from '@/i18n';

export const login = (status, packet) => {
  const { data } = packet;
  switch (status) {
    case 'success':
      store.dispatch('user/login', data).then(() => {
        Message.success(i18n.t('login.loginSuccess'));
        router.push('/hall');
      });
      break;
    case 'error':
      Message.showError(packet.msg);
      break;
    case 'betop':
      store.dispatch('user/betop').then(() => {
        MessageBox.alert(i18n.t('login.betop.content'), i18n.t('login.betop.title'), {
          confirmButtonText: '确定',
          callback: () => {
            window.location.reload();
          },
        });
      });
      break;
    default:
      break;
  }
};


export const register = (status) => {
  switch (status) {
    case 'success':
      break;
    case 'error':
      break;
    default:
      break;
  }
};
