<template>
  <div>
    <v-layout>
      <v-flex xs12 sm6 offset-sm3>
        <h3 class="mb-10 mt-5">
          This extension is a fork of https://github.com/cnwangjie/better-onetab, which is not maintained anymore.
          For more information about the original extension, please visit the original repository.
          The motivation of this fork is to learn rust by create a simple server to host the tabs api.
        </h3>
        <v-divider></v-divider>
        <v-subheader>Storage Usage: {{ storageUsage }} Bytes</v-subheader>
        <v-divider></v-divider>
        <v-card class="mt-5 mb-5">
          <v-list>
            <v-list-item>
              <v-list-item-avatar tile>
                <img src="~@/assets/icons/icon_128.png">
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>Better-One-Tab-2024</v-list-item-title>
                <v-list-item-subtitle>
                  <span>Version: {{ version }}</span>
                  <strong v-if="!!update" :style="{ color: 'green' }">v{{ update }} Has Available!</strong>
                  <span v-else>(Already the latest version)</span>
                </v-list-item-subtitle>

              </v-list-item-content>


              <v-list-item-action>
                <v-btn v-if="!!update" color="success" v-on:click="reload">Update</v-btn>
              </v-list-item-action>
            </v-list-item>

          </v-list>
        </v-card>

        <v-divider></v-divider>
        <v-subheader class="mt-5">Change Logs</v-subheader>
        <v-btn text block href="https://github.com/cnwangjie/better-onetab/blob/master/CHANGELOG.md">Click to view the
          whole change logs
        </v-btn>
      </v-flex>
    </v-layout>
  </div>
</template>
<script>
import __ from '@/common/i18n'

export default {
  data() {
    return {
      storageUsage: 0,
      version: '',
      update: '',
    }
  },
  created() {
    this.init()
  },
  methods: {
    __,
    init() {
      const manifest = chrome.runtime.getManifest()
      this.version = manifest.version
      chrome.runtime.getBackgroundPage(background => {
        this.update = background.update || ''
      })
      chrome.storage.local.getBytesInUse(null, count => {
        this.storageUsage = count
      })
    },
    reload() {
      chrome.runtime.reload()
    },
  },
}
</script>
<style lang="scss">
</style>
