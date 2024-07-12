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

// logger.init({Vue})

console.debug('create vue app')
const app = createApp(App)

console.debug('create vuetify')
const vuetify = createVuetify()

console.debug('install views')
app
  .use(router)
  .use(vuetify)
  // .use(VueClipboard)

console.debug('mount')
app.mount('#root')


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
