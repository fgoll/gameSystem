import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/login'),
    },

    {
      path: '/hall',
      name: 'hall',
      component: () => import('@/views/hall'),
    },
  ],
});
