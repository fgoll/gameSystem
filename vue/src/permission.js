import router from './router';
import store from './store';

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

  next();
});
