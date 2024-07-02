import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import logger from '../common/logger'
import Vuetify from 'vuetify/lib'
import VueClipboard from 'vue-clipboard2'
import colors from 'vuetify/es5/util/colors'
import 'vuetify/dist/vuetify.min.css'
// import 'vuetify/src/stylus/app.styl'


logger.init({Vue})


Vue.use(VueClipboard)
// Vue.use(Vuetify, {
//   theme: {
//     primary: colors.lightGreen,
//   },
// })

Vue.use(Vuetify)



Vue.config.productionTip = false
Vue.config.devtools = true

const app = new Vue({
  vuetify: new Vuetify({
    theme: {
      dark: true,
      primary: colors.lightGreen,
    },
  }),
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})

if (DEBUG) {
  window.app = app
  import('webextension-polyfill').then(browser => {
    window.browser = browser.default
  })
  import('@/common/service/gdrive').then(gt => {
    window.gt = gt
    window.gdrive = gt.default
  })
}
