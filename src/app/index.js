import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import logger from '../common/logger'
import VueClipboard from 'vue-clipboard2'
import 'vuetify/dist/vuetify.min.css'
import {createApp} from '@vue/compat'
import {createVuetify} from 'vuetify'

logger.init({Vue})
// Vue.use(VueClipboard)
// Vue.use(Vuetify)
//
// Vue.config.productionTip = false
// Vue.config.devtools = true
//
// const app = new Vue({
//   vuetify: new Vuetify({
//     theme: {
//       themes: {
//         light: {
//           primary: '#1976D2',
//           secondary: '#424242',
//           accent: '#82B1FF',
//           error: '#FF5252',
//           info: '#2196F3',
//           success: '#4CAF50',
//           warning: '#FFC107',
//           footer: '#FFFFFF',  // 自定义 light 主题的 v-footer 背景色
//         },
//         dark: {
//           primary: '#2196F3',
//           secondary: '#424242',
//           accent: '#FF4081',
//           error: '#FF5252',
//           info: '#2196F3',
//           success: '#4CAF50',
//           warning: '#FFC107',
//           footer: '#121212',  // 自定义 dark 主题的 v-footer 背景色
//         },
//       },
//       options: { customProperties: true }, // 允许使用 CSS 变量
//     },
//     options: {
//       customProperties: true,  // 开启 CSS 变量
//     },
//   }),
//   el: '#app',
//   router,
//   store,
//   template: '<App/>',
//   components: { App }
// })

console.debug('create vue app')
const app = createApp(App)
console.debug('create vuetify')
const vuetify = createVuetify({

})

console.debug('install plugins')
app.use(vuetify)
  .use(router)
  .use(VueClipboard)
console.debug('mount')
app.mount('#app')


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
