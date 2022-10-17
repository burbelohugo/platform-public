import Vue from 'vue';
import { BootstrapVue } from 'bootstrap-vue';
import AnimateCSS from 'animate.css';
import App from './App.vue';
import router from './router';
import store from './store';

// Importing the global css file
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import './assets/global.css';

Vue.config.productionTip = false;

const VueCookie = require('vue-cookie');

Vue.use(VueCookie);
Vue.use(BootstrapVue);
Vue.use(AnimateCSS);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
