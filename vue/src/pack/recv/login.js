import i18n from '@/i18n';
import inject from './inject';

export const login = inject((status, packet, { dispatch }, router, Message, MessageBox) => {
  const { data } = packet;
  switch (status) {
    case 'success':
      dispatch('user/login', data).then(() => {
        Message.success(i18n.t('login.loginSuccess'));
        router.push('/hall');
      });
      break;
    case 'error':
      Message.error(packet.msg);
      break;
    case 'betop':
      dispatch('user/betop').then(() => {
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
});

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
