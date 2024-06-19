<template>
<v-toolbar app clipped-left :color="nightmode ? null : 'primary'" :flat="flat" v-scroll="onScroll">
  <v-toolbar-side-icon dark @click="switchDrawer"></v-toolbar-side-icon>
  <v-toolbar-title class="white--text">Better OneTab</v-toolbar-title>
  <v-spacer></v-spacer>
  <search-form v-if="!opts.disableSearch"></search-form>
  <v-spacer></v-spacer>

  <v-tooltip v-if="hasToken" left>
    <v-btn slot="activator" :disabled="!online" @click="loadBtnClicked">
      Load
    </v-btn>
    <span>log out<dynamic-time v-if="!tooltip" v-model="lastUpdated"></dynamic-time></span>
  </v-tooltip>

  <v-tooltip v-if="hasToken" left>
    <v-btn slot="activator" icon dark :disabled="!online" @click="logoutBtnClicked">
      <transition name="fade" mode="out-in">
        <v-icon :key="logoutIcon">{{ logoutIcon }}</v-icon>
      </transition>
    </v-btn>
    <span>log out<dynamic-time v-if="!tooltip" v-model="lastUpdated"></dynamic-time></span>
  </v-tooltip>

  <v-tooltip left>
    <v-btn slot="activator" icon dark :loading="syncing" :disabled="!online" @click="syncBtnClicked">
      <transition name="fade" mode="out-in">
        <v-icon :key="syncIcon">{{ syncIcon }}</v-icon>
      </transition>
    </v-btn>
    <span>{{ tooltip }}<dynamic-time v-if="!tooltip" v-model="lastUpdated"></dynamic-time></span>
  </v-tooltip>
  <v-tooltip left>
    <v-btn slot="activator" icon dark @click="switchNightMode">
      <v-icon>{{ nightmode ? 'brightness_5' : 'brightness_4' }}</v-icon>
    </v-btn>
    <span>{{ __('ui_nightmode') }}</span>
  </v-tooltip>
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

export default {
  data() {
    return {
      flat: false,
      syncing: false,
      online: navigator.onLine,
      uploadSuccess: false,
      token: '',
    }
  },
  components: {
    searchForm,
    dynamicTime,
  },
  computed: {
    ...mapState(['opts', 'hasToken', 'nightmode', 'scrollY', 'syncServerHost', 'username']),
    tooltip() {
      return !this.online ? __('ui_offline') // eslint-disable-line
        : !this.hasToken ? __('ui_not_login') // eslint-disable-line
        : this.syncing ? __('ui_syncing')
        : __('ui_refresh')
    },
    syncIcon() {
      return !this.online ? 'cloud_off' // eslint-disable-line
        : !this.hasToken ? 'cloud_off' // eslint-disable-line
        : this.uploadSuccess ? 'cloud_done'
        : 'cloud_upload'
    },
    logoutIcon() {
      return 'mdi-logout'
    }
  },
  created() {
    this.init()
    getToken().then(token => {
      this.token = token
      console.log('getToken:', token)
    })
  },
  methods: {
    __,
    ...mapMutations(['setScrollY']),
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
              })
              .catch((error) => {
                console.error('Error:', error)
              })
          }
        }
      })

    },
    syncBtnClicked() {
      console.log('syncBtnClicked: ', this.token, this.syncServerHost)
      if (this.hasToken) {
        fetch(this.syncServerHost + `/api/tabs?token=${this.token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(async response => {
            console.log('Get tabs response:', response)
            if (response.ok) {
              const token = response.json()
              // this.syncServerToken = token
              // await boss.setToken(token)
              // await this.loadUID()
            } else {
              window.alert('Login failed')
            }
          })
          .catch((error) => {
            console.error('Error:', error)
          })
        return sendMessage({refresh: true})
      } else {
        console.log('no token')
        // TODO: temporarily hide the login shortcut
        return this.$router.push('/app/options/sync')
        // return browser.tabs.create({url: SYNC_SERVICE_URL + '/login'})
      }
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
