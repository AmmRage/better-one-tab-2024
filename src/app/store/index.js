import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
import browser from 'webextension-polyfill'
import storage from '@/common/storage'
import options from '@/common/options'
import boss from '@/common/service/boss'
import listManager from '@/common/listManager'
import {sleep} from '@/common/utils'

import lists from './lists'

Vue.use(Vuex)
listManager.init()

const store = new Vuex.Store({
  strict: DEBUG,
  state: {
    opts: options.getDefaultOptions(),    // all options
    hasToken: false,                      // whether token exists
    drawer: false,                        // drawer status
    nightmode: false,                     // nightmode status
    snackbar: { status: false, msg: '' }, // snackbar status
    scrollY: 0,
    syncServerHost: '',
    username: '',
    ...lists.state, // include lists state
  },
  getters: {
    ...lists.getters,
  },
  mutations: {
    setOption(state, payload) {
      for (const [k, v] of Object.entries(payload)) {
        state.opts[k] = v
      }
    },
    setHasToken(state, payload) {
      state.hasToken = payload
    },
    setSyncServerHost(state, payload) {
      state.syncServerHost = payload
    },
    setUsername(state, payload) {
      state.username = payload
    },
    setDrawer(state, drawer) {
      state.drawer = drawer
    },
    setNightmode(state, payload) {
      state.nightmode = payload
    },
    setSnackbar(state, message) {
      state.snackbar.msg = message
      state.snackbar.status = true
    },
    closeSnackbar(state) {
      state.snackbar.status = false
    },
    setScrollY(state, v) {
      state.scrollY = v
    },
    ...lists.mutations,
  },
  actions: {
    async loadOptions({commit}) {
      commit('setOption', await storage.getOptions())
    },
    async checkToken({commit}) {
      commit('setHasToken', await boss.hasToken())
    },
    updateSyncServerHost({commit}, host) {
      commit('setSyncServerHost', host)
    },
    updateUsername({commit}, name) {
      commit('setUsername', name)
    },
    async loadDrawer({commit}) {
      //
      const backgroundPageDrawer= false;
      chrome.runtime.sendMessage({type: "getBackgroundPage", data: "drawer"}, response => {
        console.log(response)
        // backgroundPageDrawer = response.drawer
      });
      // backgroundPage.drawer = _.defaultTo(backgroundPageDrawer, true)
      chrome.runtime.sendMessage({type: "setBackgroundPage", data: "drawer"}, response => {
        console.log(response)
      });      
      commit('setDrawer', backgroundPageDrawer)
    },
    async switchDrawer({commit, state}) {
      const backgroundPageDrawer= false;
      chrome.runtime.sendMessage({type: "getBackgroundPage", data: "drawer"}, response => {
        console.log(response)
        // backgroundPageDrawer = response.drawer
      });

      commit('setDrawer', backgroundPageDrawer = !state.drawer)
    },
    async loadNightmode({commit, state}) {
      const backgroundPageNightmode = false;
      // get value
      chrome.runtime.sendMessage({type: "getBackgroundPage", data: "nightmode"}, response => {
        console.log(response)
        // backgroundPageNightmode = response.nightmode
      });

      // set value
      chrome.runtime.sendMessage({type: "setBackgroundPage", data: {
        type:"nightmode",
        value: _.defaultTo(backgroundPageNightmode, state.opts.defaultNightMode)
      }}, response => {
        console.log(response)
      });     

      commit('setNightmode', backgroundPageNightmode)
    },
    
    async switchNightMode({commit, state}) {
      const backgroundPageNightmode = false;
      chrome.runtime.sendMessage({type: "getBackgroundPage", data: "nightmode"}, response => {
        console.log(response)
        // backgroundPageNightmode = response.nightmode
      });
      commit('setNightmode', backgroundPageNightmode = !state.nightmode)
    },
    
    async showSnackbar({commit}, message) {
      commit('setSnackbar', message)
      await sleep(2000)
      commit('closeSnackbar')
    },
    ...lists.actions,
  },
  plugins: [
    listManager.createVuexPlugin(),
  ],
})
export default store
