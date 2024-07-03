<template>
  <v-app-bar app clipped-left  :flat="flat" v-scroll="onScroll">
    <v-app-bar-nav-icon dark @click="switchDrawer"></v-app-bar-nav-icon>
    <v-toolbar-title class="white--text">Better OneTab 2024</v-toolbar-title>
    <v-spacer></v-spacer>
    <search-form v-if="!opts.disableSearch"></search-form>
    <v-spacer></v-spacer>

    <v-toolbar-title v-if="lastUpdate!==''" class="white--text">Last sync: {{ lastUpdate }}</v-toolbar-title>
    <v-spacer></v-spacer>

    <!-- history -->
    <v-tooltip bottom>
      <v-btn slot="activator" icon dark :disabled="!online" @click="showHistoryBtnClicked">
        <transition name="fade" mode="out-in">
          <span class="material-icons">history</span>
        </transition>
      </v-btn>
      <span>for debug / test purpose<dynamic-time v-if="!tooltip" v-model="lastUpdated"></dynamic-time></span>
    </v-tooltip>

    <!-- download -->
    <v-tooltip v-if="hasToken" bottom>
      <v-btn slot="activator" icon dark :disabled="!online" @click="loadBtnClicked">
        <transition name="fade" mode="out-in">
          <span class="material-icons">cloud_download</span>
        </transition>
      </v-btn>
      <span>download tabs immediately from server<dynamic-time v-if="!tooltip"
                                                               v-model="lastUpdated"></dynamic-time></span>
    </v-tooltip>

    <!-- login / sync icon -->
    <v-tooltip bottom>
      <v-btn slot="activator" icon dark :loading="syncing" :disabled="!online" @click="syncBtnClicked">
        <transition name="fade" mode="out-in">
          <span v-if="!online" class="material-icons">cloud_off</span>
          <span v-else-if="!hasToken" class="material-icons">login</span>
          <span v-else class="material-icons">cloud_sync</span>
        </transition>
      </v-btn>
      <span v-if="!online">You are offline now!<dynamic-time v-if="!tooltip"
                                                             v-model="lastUpdated"></dynamic-time></span>
      <span v-else-if="!hasToken">Login here<dynamic-time v-if="!tooltip" v-model="lastUpdated"></dynamic-time></span>
      <span v-else>click to sync tabs to server<dynamic-time v-if="!tooltip"
                                                             v-model="lastUpdated"></dynamic-time></span>
    </v-tooltip>

    <!-- display mode -->
    <v-tooltip bottom>
      <v-btn slot="activator" icon dark @click="switchNightMode">
        <v-icon>{{ nightmode ? 'brightness_5' : 'brightness_4' }}</v-icon>
      </v-btn>
      <span>{{ __('ui_nightmode') }}</span>
    </v-tooltip>

    <!-- logout -->
    <v-tooltip v-if="this.hasToken" bottom>
      <v-btn slot="activator" icon dark :disabled="!online" @click="logoutBtnClicked">
        <transition name="fade" mode="out-in">
          <span class="material-icons">logout</span>
        </transition>
      </v-btn>
      <span>log out<dynamic-time v-if="!tooltip" v-model="lastUpdated"></dynamic-time></span>
    </v-tooltip>

    <v-snackbar
        v-model="snackbar"
        :timeout="30000"
        top
        dark
    >
      {{ this.snackbarMessage }}
      <v-btn color="pink" text @click="this.snackbar = false">Close</v-btn>
    </v-snackbar>

    <!-- modal -->
    <v-dialog
        v-model="showHistoryDialog"
        scrollable
        max-width="1500px"
    >
      <v-card>
        <v-card-title>Historical tabs</v-card-title>
        <v-divider></v-divider>

        <v-card-text style="height: 800px;">
          <v-progress-circular v-if="historyLoading"
                               :size="70"
                               :width="7"
                               color="green"
                               indeterminate
          ></v-progress-circular>
          <v-list v-if="!historyLoading" two-line>
            <template v-for="(item, index) in items" >
              <v-list-item
                  :key="item.title"
                  ripple
                  @click="toggle(index)"
              >
                <v-list-item-content>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                  <v-list-item-subtitle class="text--primary">{{ item.headline }}</v-list-item-subtitle>
                  <v-list-item-subtitle>{{ item.subtitle }}</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-list-item-action-text>{{ item.action }}</v-list-item-action-text>
                  <v-icon
                      v-if="selected.indexOf(index) < 0"
                      color="grey lighten-1"
                  >
                    star_border
                  </v-icon>

                  <v-icon
                      v-else
                      color="yellow darken-2"
                  >
                    star
                  </v-icon>
                </v-list-item-action>

              </v-list-item>
              <v-divider
                  v-if="index + 1 < items.length"
                  :key="index"
              ></v-divider>
            </template>
          </v-list>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn
              color="blue darken-1"
              text
              @click="showHistoryDialog = false"
          >
            Close
          </v-btn>
          <v-btn
              color="blue darken-1"
              text
              @click="showHistoryDialog = false"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script>
import __ from '@/common/i18n'
import searchForm from './SearchForm'
import dynamicTime from '@/app/component/DynamicTime'
import 'material-icons/iconfont/material-icons.css'
import {mapActions, mapMutations, mapState} from 'vuex'
import {TOKEN_KEY} from '../../../common/constants'
import {sendMessage} from '../../../common/utils'
import boss from '../../../common/service/boss'

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
      lastUpdate: '',
      showHistoryDialog: false,
      dialogm1: '',
      selected: [2],
      historyLoading: true,
      items: [
        {
          action: '15 min',
          headline: 'Brunch this weekend?',
          title: 'Ali Connors',
          subtitle: 'I\'ll be in your neighborhood doing errands this weekend. Do you want to hang out?',
        },
      ],
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
    },
  },
  created() {
    this.init()
    // 初始化时从存储中获取值
    browser.storage.local.get(TOKEN_KEY).then(result => {
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
    browser.storage.local.get('updated_at').then(result => {
      // eslint-disable-next-line no-undefined
      if (result['updated_at'] !== undefined && result['updated_at'] !== null && result['updated_at'] !== '') {
        this.lastUpdate = new Date(result['updated_at'] * 1000).toLocaleString()
      }
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

      if (area === 'local' && changes['updated_at']) {
        // console.debug('snackbar changes: ', changes)
        this.lastUpdate = new Date(changes.updated_at.newValue * 1000).toLocaleString()
        this.snackbarMessage = `uploaded to server at ${this.lastUpdate}`
        this.snackbar = true
      } else if (area === 'local' && changes['snackbar_updated_at']) {
        browser.storage.local.get('snackbarMessage').then(result => {
          this.snackbarMessage = result['snackbarMessage']
          this.snackbar = true
        })
      }
    })
  },
  methods: {
    __,
    ...mapMutations(['setScrollY', 'setHasToken']),
    ...mapActions(['switchNightMode', 'switchDrawer']),
    init() {
      this.onScroll()
      window.addEventListener('online', () => {
        this.online = true
      })
      window.addEventListener('offline', () => {
        this.online = false
      })
      chrome.runtime.onMessage.addListener(msg => {
        if (msg.refreshing) {
          this.syncing = true
        } else if (msg.refreshed) {
          this.syncing = false
          this.uploadSuccess = msg.refreshed.success
          if (this.uploadSuccess) {
            setTimeout(() => {
              this.uploadSuccess = false
            }, 3000)
          }
        }
      })
    },
    onScroll() {
      this.setScrollY(window.pageYOffset || document.documentElement.scrollTop)
      this.flat = this.scrollY === 0
    },
    logoutBtnClicked() {
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
          // console.debug('syncServerHost:', syncServerHost)
          // console.debug('token:', token)
          // console.debug('username:', username)

          if (syncServerHost !== '' && token !== '' && username !== '' &&
              syncServerHost !== null && token !== null && username !== null
          ) {
            fetch(syncServerHost + `/api/user/${username}/logout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Token: token,
              },
              body: JSON.stringify(token),
            })
                .then(async response => {
                  if (response.status === 200) {
                    this.snackbarMessage = `user logout successfully`
                    this.snackbar = true
                    console.log('save tabs response:', response)
                    return response.json()
                  } else {
                    this.snackbarMessage = `user logout fail with status: ${response.status}`
                    this.snackbar = true
                    return null
                  }
                })
                .then(async data => {
                  if (data) {
                    console.log('response data:', data)
                    return sendMessage({logout: true})
                  }
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
    pushBtnClicked() {
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
          // console.debug('syncServerHost:', syncServerHost)
          // console.debug('token:', token)
          // console.debug('username:', username)

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
                token,
              }),
            })
                .then(async response => {
                  if (response.status === 200) {
                    console.log('save tabs response:', response)
                    return response.json()
                  } else if (response.status === 401) {
                    console.log('Invalid token')
                    boss.removeToken().then(() => {
                    })
                    chrome.storage.local.set({
                      snackbar_updated_at: Date.now(),
                      snackbarMessage: 'Invalid token, please login again',
                    })
                    return null
                  } else if (response.status === 403) {
                    console.log('Access forbidden')
                    boss.removeToken().then(() => {
                    })
                    chrome.storage.local.set({
                      snackbar_updated_at: Date.now(),
                      snackbarMessage: 'Access forbidden',
                    })
                    return null
                  } else {
                    console.log('Unknown error')
                    return null
                  }
                })
                .then(async data => {
                  if (data) {
                    console.log('save tabs response data:', data)
                    chrome.storage.local.set({
                      snackbar_updated_at: Date.now(),
                      snackbarMessage: 'Tabs uploaded successfully',
                      updated_at: data.updated_at,
                    })
                  }
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
    showHistoryBtnClicked() {
      console.debug('showHistoryBtnClicked: hasToken:', this.hasToken)
      this.showHistoryDialog = true
    },
    debugBtnClicked() {
      console.debug('debugBtnClicked: hasToken:', this.hasToken)
    },
    loadBtnClicked() {
      chrome.storage.local.get(null, items => {
        if (items) {
          let syncServerHost = ''
          let token = ''
          let username = ''
          // console.log('The value of myKey is:', items.syncServerHost)
          syncServerHost = items.syncServerHost
          token = items.token
          username = items.username
          // console.debug('syncServerHost:', syncServerHost)
          // console.debug('token:', token)
          // console.debug('username:', username)


          if (syncServerHost !== '' && token !== '' && username !== '' &&
              syncServerHost !== null && token !== null && username !== null &&
              // eslint-disable-next-line no-undefined
              syncServerHost !== undefined && token !== undefined && username !== undefined
          ) {
            // console.log('host:', syncServerHost)
            // console.log('username:', username)
            fetch(syncServerHost + `/api/user/${username}/tabs?token=${token}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            })
                .then(async response => {
                  if (response.status === 200) {
                    return response.json()
                  } else if (response.status === 401) {
                    console.log('Invalid token')
                    boss.removeToken().then(() => {
                    })
                    chrome.storage.local.set({
                      snackbar_updated_at: Date.now(),
                      snackbarMessage: 'Invalid token, please login again',
                    })
                    return null
                  } else if (response.status === 403) {
                    console.log('Access forbidden')
                    boss.removeToken().then(() => {
                    })
                    chrome.storage.local.set({
                      snackbar_updated_at: Date.now(),
                      snackbarMessage: 'Access forbidden',
                    })
                    return null
                  } else {
                    console.log('Unknown error')
                    return null
                  }
                })
                .then(async data => {
                  // console.log('Get tabs response:', data)

                  if (data && data.tabs) {
                    this.$store.commit('setLists', data.tabs)

                    const storageNewValue = {
                      ...items,
                      lists: data.tabs,
                    }
                    chrome.storage.local.set(storageNewValue, () => {
                      this.snackbarMessage = `Load tabs from server successfully, ${data.tabs.length} tabs list loaded`
                      this.snackbar = true
                    })
                  }
                })
                .catch(error => {
                  console.error('Error:', error)
                  this.snackbarMessage = 'You got error when loading tabs from server' + error
                  this.snackbar = true
                })
          }
        } else {
          this.snackbarMessage = `You got error when read local storage`
          this.snackbar = true
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

      // console.log('lists: ', this.lists)
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
          // console.debug('syncServerHost:', syncServerHost)
          // console.debug('token:', token)
          // console.debug('username:', username)

          if (syncServerHost !== '' && token !== '' && username !== '' &&
              syncServerHost !== null && token !== null && username !== null &&
              // eslint-disable-next-line no-undefined
              syncServerHost !== undefined && token !== undefined && username !== undefined
          ) {
            fetch(syncServerHost + `/api/user/${username}/tabs`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Token: token,
              },
              body: JSON.stringify({
                tabs: this.lists,
                token,
              }),
            })
                .then(async response => response.json())
                .then(async data => {
                  if (data) {
                    this.snackbarMessage = 'Load tabs from server successfully'
                    this.snackbar = true
                  }
                })
                .catch(error => {
                  console.error('Error:', error)
                  this.snackbarMessage = 'You got error when syncing tabs to server' + error
                  this.snackbar = true
                })
          } else {
            this.snackbarMessage = `wrong syncServerHost or token or username: ${syncServerHost}, ${token}, ${username}`
            this.snackbar = true
          }
        } else {
          console.log('The key myKey does not exist in local storage.')

          this.snackbarMessage = 'You got error when loading tabs from server'
          this.snackbar = true
        }
      })
    },
  },
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
