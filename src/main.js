import Vue from 'vue'
import 'babel-polyfill'
import App from './App'
import router from './router'
import store from './store'
import VueHead from 'vue-head'
// --- GOOGLE ANALYTICS
// import ga from 'vue-ga'
// --- ERROR TRACKING
// import Raven from 'raven-js'
// import RavenVue from 'raven-js/plugins/vue'

// Raven
//     .config('https://---0@sentry.io/---')
//     .addPlugin(RavenVue, Vue)
//     .install()

// ga(router, 'UA-XXXXX')

Vue.config.productionTip = false

Vue.use(VueHead)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: {App}
})
