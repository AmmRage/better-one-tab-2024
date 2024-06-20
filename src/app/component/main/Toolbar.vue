<template>
<v-toolbar app clipped-left :color="nightmode ? null : 'primary'" :flat="flat" v-scroll="onScroll">
  <v-toolbar-side-icon dark @click="switchDrawer"></v-toolbar-side-icon>
  <v-toolbar-title class="white--text">Better OneTab</v-toolbar-title>
  <v-spacer></v-spacer>
  <search-form v-if="!opts.disableSearch"></search-form>
  <v-spacer></v-spacer>

  <v-tooltip left>
    <v-btn slot="activator" icon dark :disabled="!online" @click="debugBtnClicked">
      <transition name="fade" mode="out-in">
        <span class="material-icons">bug_report</span>
      </transition>
    </v-btn>
    <span>for debug / test purpose<dynamic-time v-if="!tooltip" v-model="lastUpdated"></dynamic-time></span>
  </v-tooltip>

  <v-tooltip v-if="hasToken" left>
    <v-btn slot="activator" icon dark :disabled="!online" @click="loadBtnClicked">
      <transition name="fade" mode="out-in">
        <span class="material-icons">cloud_download</span>
      </transition>
    </v-btn>
    <span>download tabs immediately from server<dynamic-time v-if="!tooltip" v-model="lastUpdated"></dynamic-time></span>
  </v-tooltip>

  <!-- logout -->
  <v-tooltip v-if="this.hasToken" left>
    <v-btn slot="activator" icon dark :disabled="!online" @click="logoutBtnClicked">
      <transition name="fade" mode="out-in">
        <span class="material-icons">logout</span>
      </transition>
    </v-btn>
    <span>log out<dynamic-time v-if="!tooltip" v-model="lastUpdated"></dynamic-time></span>
  </v-tooltip>

  <!-- login / sync icon -->
  <v-tooltip left>
    <v-btn slot="activator" icon dark :loading="syncing" :disabled="!online" @click="syncBtnClicked">
      <transition name="fade" mode="out-in">
        <span v-if="!online" class="material-icons">cloud_off</span>
        <span v-else-if="!hasToken" class="material-icons">login</span>
        <span v-else class="material-icons">cloud_sync</span>
      </transition>
    </v-btn>
    <span v-if="!online" >You are offline now!<dynamic-time v-if="!tooltip" v-model="lastUpdated"></dynamic-time></span>
    <span v-else-if="!hasToken" >Login here<dynamic-time v-if="!tooltip" v-model="lastUpdated"></dynamic-time></span>
    <span v-else>click to sync tabs to server<dynamic-time v-if="!tooltip" v-model="lastUpdated"></dynamic-time></span>
  </v-tooltip>

  <!-- display mode -->
  <v-tooltip left>
    <v-btn slot="activator" icon dark @click="switchNightMode">
      <v-icon>{{ nightmode ? 'brightness_5' : 'brightness_4' }}</v-icon>
    </v-btn>
    <span>{{ __('ui_nightmode') }}</span>
  </v-tooltip>


  <v-snackbar
      v-model="this.snackbar"
      :timeout="3000"
      top
      dark
  >
    {{this.snackbarMessage}}
    <v-btn color="pink" flat @click="this.snackbar = false">Close</v-btn>
  </v-snackbar>
</v-toolbar>
</template>
<script>
import __ from '@/common/i18n'
import searchForm from './SearchForm'
import dynamicTime from '@/app/component/DynamicTime'
import browser from 'webextension-polyfill'
import {SYNC_SERVICE_URL} from '@/common/constants'
import {mapState, mapActions, mapMutations} from 'vuex'
import {sendMessage} from '@/common/utils'
import {setToken, removeToken, getToken } from '@/common/service/boss'
import 'material-icons/iconfont/material-icons.css'
import {TOKEN_KEY} from '../../../common/constants'

export default {
  data() {
    return {
      flat: false,
      syncing: false,
      online: navigator.onLine,
      uploadSuccess: false,
      token: '',
      snackbarMessage: '',
      snackbar: false,
    }
  },
  components: {
    searchForm,
    dynamicTime,
  },
  computed: {
    ...mapState(['opts', 'hasToken', 'nightmode', 'scrollY', 'syncServerHost', 'username', 'lists']),
    tooltip() {
      return !this.online ? __('ui_offline') // eslint-disable-line
        : !this.hasToken ? __('ui_not_login') // eslint-disable-line
        : this.syncing ? __('ui_syncing')
        : __('ui_refresh')
    }
  },
  created() {
    this.init()
    // 初始化时从存储中获取值
    browser.storage.local.get(TOKEN_KEY).then((result) => {
      this.token = result[TOKEN_KEY]
      let hasToken = false
      // eslint-disable-next-line no-undefined
      if (result[TOKEN_KEY] !== undefined) {
        hasToken = true
        this.setHasToken(true)
      } else {
        hasToken = false
      }
      this.setHasToken(hasToken)
      console.debug(`Toolbar init, hasToken: ${hasToken}, token: ${this.token}`)
    })

    // 监听存储变化
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[TOKEN_KEY]) {
        let hasToken = false
        // eslint-disable-next-line no-undefined
        if (changes[TOKEN_KEY].newValue === undefined) {
          this.token = ''
          // 处理 key 被删除的情况
          hasToken = false
        } else {
          // 更新值
          hasToken = true
          this.token = changes[TOKEN_KEY].newValue
        }
        this.setHasToken(hasToken)
        console.debug(`Toolbar onChanged, hasToken: ${hasToken}, token: ${this.token}`)
      }
    })
  },
  methods: {
    __,
    ...mapMutations(['setScrollY', 'setHasToken']),
    ...mapActions(['switchNightMode', 'switchDrawer']),
    init() {
      this.onScroll()
      window.addEventListener('online', () => { this.online = true })
      window.addEventListener('offline', () => { this.online = false })
      chrome.runtime.onMessage.addListener(msg => {
        if (msg.refreshing) {
          this.syncing = true
        } else if (msg.refreshed) {
          this.syncing = false
          this.uploadSuccess = msg.refreshed.success
          if (this.uploadSuccess) {
            setTimeout(() => { this.uploadSuccess = false }, 3000)
          }
        }
      })
    },
    onScroll() {
      this.setScrollY(window.pageYOffset || document.documentElement.scrollTop)
      this.flat = this.scrollY === 0
    },
    logoutBtnClicked() {
      return sendMessage({logout: true})
    },
    pushBtnClicked(){
      console.log('lists: ', this.lists)
      if (this.lists === null || this.lists.length === 0) {
        return
      }

      let syncServerHost = ''
      let token = ''
      let username = ''

      chrome.storage.local.get(null, items => {
        if (items) {
          syncServerHost = items.syncServerHost
          token = items.token
          username = items.username
          console.debug('syncServerHost:', syncServerHost)
          console.debug('token:', token)
          console.debug('username:', username)

          if (syncServerHost !== '' && token !== '' && username !== '' &&
              syncServerHost !== null && token !== null && username !== null
          ) {
            fetch(syncServerHost + `/api/user/${username}/tabs`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Token: token,
              },
              body: JSON.stringify({
                tabs: this.lists,
                token: token
              }),
            })
              .then(async response => response.json())
              .then(async data => {
                console.log('data:', data)
              })
              .catch(error => {
                console.error('Error:', error)
              })
          }
        } else {
          console.log('The key myKey does not exist in local storage.')
        }
      })
    },
    debugBtnClicked(){
      console.debug('debugBtnClicked: hasToken:', this.hasToken)
    },
    loadBtnClicked() {
      chrome.storage.local.get(null, items => {
        if (items) {
          let syncServerHost = ''
          let token = ''
          let username = ''
          console.log('The value of myKey is:', items.syncServerHost)
          syncServerHost = items.syncServerHost
          token = items.token
          username = items.username
          console.debug('syncServerHost:', syncServerHost)
          console.debug('token:', token)
          console.debug('username:', username)


          if (syncServerHost !== '' && token !== '' && username !== '' &&
              syncServerHost !== null && token !== null && username !== null
          ) {
            console.log('host:', syncServerHost)
            console.log('username:', username)
            fetch(syncServerHost + `/api/user/${username}/tabs?token=${token}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            })
              .then(async response => {
                return response.json()
              })
              .then(async data => {
                console.log('Get tabs response:', data)

                if (data && data.tabs) {
                  this.$store.commit('setLists', data.tabs)

                  let storageNewValue = {
                    ...items,
                    lists: data.tabs
                  }
                  chrome.storage.local.set(storageNewValue, () => {
                    this.snackbarMessage = `Load tabs from server successfully, ${data.tabs.length} tabs loaded`
                    this.snackbar = true
                  })
                }
              })
              .catch((error) => {
                console.error('Error:', error)
                this.snackbarMessage = 'You got error when loading tabs from server' + error
                this.snackbar = true
              })
          }
        }
      })
    },
    syncBtnClicked() {
      if (!this.hasToken) {
        console.log('no token')
        // TODO: temporarily hide the login shortcut
        return this.$router.push('/app/options/sync')
        // return browser.tabs.create({url: SYNC_SERVICE_URL + '/login'})
      }

      console.log('lists: ', this.lists)
      if (this.lists === null || this.lists.length === 0) {
        return
      }

      let syncServerHost = ''
      let token = ''
      let username = ''

      chrome.storage.local.get(null, items => {
        if (items) {
          syncServerHost = items.syncServerHost
          token = items.token
          username = items.username
          console.debug('syncServerHost:', syncServerHost)
          console.debug('token:', token)
          console.debug('username:', username)

          if (syncServerHost !== '' && token !== '' && username !== '' &&
              syncServerHost !== null && token !== null && username !== null
          ) {
            fetch(syncServerHost + `/api/user/${username}/tabs`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Token: token,
              },
              body: JSON.stringify({
                tabs: this.lists,
                token: token
              }),
            })
              .then(async response => response.json())
              .then(async data => {
                console.log('data:', data)

                this.snackbarMessage = 'Load tabs from server successfully'
                this.snackbar = true
              })
              .catch(error => {
                console.error('Error:', error)
              })
          }
        } else {
          console.log('The key myKey does not exist in local storage.')

          this.snackbarMessage = 'You got error when loading tabs from server'
          this.snackbar = true
        }
      })
    },
  }
}
</script>
<style scoped>
.v-toolbar {
  transition-delay: 0.1s;
  transition-duration: .25s;
  transition-property: box-shadow;
  transition-timing-function: ease;
}
.slide-enter-active, .slide-leave-active {
  transition: all ease-out .22s;
}
.fade-enter-to, .fade-leave {
  opacity: 1;
}
.fade-leave-to, .fade-enter {
  opacity: 0;
}
</style>
