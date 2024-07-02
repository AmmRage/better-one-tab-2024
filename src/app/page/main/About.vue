<template>
<div>
  <v-layout>
    <v-flex xs12 sm6 offset-sm3>
      <h2 style="margin-bottom: 50px">
        This extension is a fork of https://github.com/cnwangjie/better-onetab, which is not maintained anymore.
        For more information about the original extension, please visit the original repository.
        The motivation of this fork is to learn rust by create a simple server to host the tabs api.
      </h2>
      <v-card>
        <v-list>
          <v-list-item >
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


      <v-subheader class="mt-4">Change Logs</v-subheader>
      <v-btn text block href="https://github.com/cnwangjie/better-onetab/blob/master/CHANGELOG.md">Click to view the whole change logs</v-btn>
    </v-flex>
  </v-layout>
</div>
</template>
<script>
import __ from '@/common/i18n'

export default {
  data() {
    return {
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
    },
    reload() {
      chrome.runtime.reload()
    },
  }
}
</script>
<style lang="scss">
</style>
