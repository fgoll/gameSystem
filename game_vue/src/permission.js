import router from './router';
import store from './store';
import { leave } from '@/pack/send/room';

const rooms = ['/draw', '/chess'];

const inRoom = room => rooms.includes(room);

router.beforeEach((to, from, next) => {
  if (store.getters.fd) {
    if (to.path === '/login') {
      next({ path: '/hall' });
      return;
    }
    next();
  } else if (to.path !== '/login') {
    next({ path: '/login' });
  }

  if (inRoom(from.path) && to.path === '/hall') {
    const { user } = store.getters;
    if (user.roomId !== null) {
      leave({
        room_id: user.roomId,
      });
    }
  }
  next();
});
