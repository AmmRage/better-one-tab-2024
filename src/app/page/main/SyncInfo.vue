<template>
  <div>
    <v-layout>
      <v-flex xs12 sm6 offset-sm3>
        <v-card>
          <v-card-title>
            <v-btn flat icon @click="$router.go(-1)">
              <v-icon>arrow_back</v-icon>
            </v-btn>
            <h2>{{ __('ui_sync_setting') }}</h2>
            <v-spacer></v-spacer>
          </v-card-title>
          <v-card-text v-if="this.hasToken" >
            <v-layout row wrap>
              <h1>You have signed in !</h1>

              <v-flex xs12>
                <v-text-field label="Sync Server" v-model="syncServerHost" readonly></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field label="Username" v-model="syncServerUsername" readonly></v-text-field>
              </v-flex>
            </v-layout>

          </v-card-text>

          <v-card-text v-if="!this.hasToken" >

            <v-text-field v-if="!hasToken" label="Your storage server, eg: https://example.com"
                          v-model="syncServerHost"></v-text-field>

            <v-text-field v-if="!hasToken" label="Username" v-model="syncServerUsername"></v-text-field>

            <v-text-field v-if="!hasToken" label="Password" v-model="syncServerPassword"></v-text-field>

            <v-btn v-if="!hasToken" block color="success" @click="this.login">
              Login To Sync Server
            </v-btn>

          </v-card-text>
        </v-card>


        <v-snackbar
            v-model="snackbar"
            :timeout="3000"
            top
            dark
        >
          {{ this.snackbarMessage}}
          <v-btn color="pink" flat @click="this.snackbar = false">Close</v-btn>
        </v-snackbar>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import __ from '@/common/i18n'
import {SYNC_SERVICE_URL} from '@/common/constants'
import {formatTime} from '@/common/utils'
import boss from '@/common/service/boss'
import browser from 'webextension-polyfill'
import {mapState, mapGetters, mapMutations, mapActions} from 'vuex'

export default {
  data() {
    return {
      uid: '',
      apiUrl: SYNC_SERVICE_URL,
      syncServerHost: 'http://127.0.0.1:9401',
      syncServerUsername: 'admin123',
      syncServerPassword: 'password456',
      loading: false,
      snackbarMessage: 'You have login to Better One Tab 2024 server successfully',
      snackbar: false,
    }
  },
  created() {
    console.log('SyncInfo component hasToken: ', this.hasToken)
  },
  computed: {
    ...mapState(['hasToken']),
  },
  methods: {
    __,
    ...mapActions(['checkToken', 'updateSyncServerHost', 'updateUsername']),
    formatTime,
    login() {
      // console.log(this.syncServerHost)
      fetch(this.syncServerHost + '/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.syncServerUsername,
          password: this.syncServerPassword,
        }),
      })
        .then(async response => response.json())
        .then(async data => {
          // console.log('data:', data)
          if (data) {
            const token = data
            await boss.setSyncServerHost(this.syncServerHost)
            await boss.setUsername(this.syncServerUsername)
            await boss.setToken(token)

            this.updateSyncServerHost(this.syncServerHost)
            this.updateUsername(this.syncServerUsername)

            this.snackbarMessage = 'You have login to Better One Tab 2024 server successfully'
            this.snackbar = true
            // const loginNotificationId = 'login'
            // browser.notifications.create(loginNotificationId, {
            //   type: 'basic',
            //   iconUrl: 'assets/icons/icon_128.png',
            //   title: 'you have login to Better One Tab 2024 server successfully',
            //   message: '',
            // })
            // setTimeout(() => {
            //   browser.notifications.clear(loginNotificationId)
            // }, 3000)
          } else {
            this.snackbarMessage = 'Login failed !'
            this.snackbar = true
          }
        })
        .catch(error => {
          this.snackbarMessage = `Login failed error ${error}`
          this.snackbar = true
        })
    },
  },
}
</script>
