import { Loading, Message } from 'element-ui';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './i18n';

import './client';
import './permission';
import '@/styles/index.css';
import '@/icons';

Vue.config.productionTip = false;
Vue.prototype.$loading = Loading.service;
Vue.prototype.$message = Message;

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');
