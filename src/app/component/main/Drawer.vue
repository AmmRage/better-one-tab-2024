<template>
<v-navigation-drawer
  class="app-drawer text-body-2"
  v-model="value"
  floating
  width="300px"
>
  <v-list>
    <v-list-item :to="'/app/list'" exact>
      <v-list-item-action>
        <v-icon>list</v-icon>
      </v-list-item-action>

        {{ __('ui_tab_list') }}

    </v-list-item>
    <v-list-item :to="'/app/list/pinned'" exact>
      <v-list-item-action>
        <v-icon>done</v-icon>
      </v-list-item-action>

        {{ __('ui_pinned') }}

    </v-list-item>
    <v-list-item v-for="(lists, tag) in taggedList" :key="tag" :to="'/app/list/tag/' + tag">
      <v-list-item-action>
        <v-icon>label</v-icon>
      </v-list-item-action>

        {{ tag }}

    </v-list-item>
    <v-divider class="my-1"></v-divider>
    <v-list-item :to="'/app/options'">
      <v-list-item-action>
        <v-icon>settings</v-icon>
      </v-list-item-action>

        {{ __('ui_options') }}

    </v-list-item>

    <v-list-item :to="'/app/import-export'">
      <v-list-item-action>
        <v-icon>import_export</v-icon>
      </v-list-item-action>

        {{ __('ui_export_import') }}

    </v-list-item>
    <v-list-item @click="openShortcutPage" :disabled="isLowFirefox">
      <v-list-item-action>
        <v-icon>keyboard</v-icon>
      </v-list-item-action>

        {{ __('ui_keyboard_shortcuts') }}

      <v-list-item-action>
        <v-icon size="small">open_in_new</v-icon>
      </v-list-item-action>
    </v-list-item>
    <v-list-item target="_blank" href="https://github.com/AmmRage/better-one-tab-2024/issues/new/choose">
      <v-list-item-action>
        <v-icon>feedback</v-icon>
      </v-list-item-action>

        {{ __('ui_create_issue') }}

    </v-list-item>

    <v-list-item :to="'/app/about'">
      <v-list-item-action>
        <v-icon>info</v-icon>
      </v-list-item-action>

        {{ __('ui_about') }}

    </v-list-item>
<!--    <v-list-item href="https://gitter.im/better-onetab/Lobby?utm_source=app">-->
<!--      <v-list-item-action>-->
<!--        <v-icon>fab fa-gitter</v-icon>-->
<!--      </v-list-item-action>-->
<!--      <v-list-item-content>-->
<!--        Gitter-->
<!--      </v-list-item-content>-->
<!--    </v-list-item>-->
<!--    <v-list-item href="https://github.com/cnwangjie/better-onetab">-->
<!--      <v-list-item-action>-->
<!--        <v-icon>fab fa-github</v-icon>-->
<!--      </v-list-item-action>-->
<!--      <v-list-item-content>-->
<!--        {{ __('ui_github') }}-->
<!--      </v-list-item-content>-->
<!--    </v-list-item>-->
  </v-list>
</v-navigation-drawer>
</template>
<script>
import __ from '@/common/i18n'
import browser from 'webextension-polyfill'
import { mapActions, mapGetters } from 'vuex'

export default {
  data() {
    return {
      isFirefox: false,
      isLowFirefox: false,
    }
  },
  computed: {
    ...mapGetters(['taggedList']),
  },
  props: {
    value: Boolean,
  },
  created() {
    this.init()
  },
  methods: {
    ...mapActions(['preloadLists']),
    __,
    async init() {
      try {
        const {name, version} = await browser.runtime.getBrowserInfo()
        if (name === 'Firefox') {
          this.isFirefox = true
          if (version < '66') this.isLowFirefox = true
        }
      } catch (e) {
        // ignored
      }
      this.preloadLists()
    },
    async openShortcutPage() {
      if (this.isFirefox) await browser.tabs.create({url: 'about:addons'})
      else await browser.tabs.create({url: 'chrome://extensions/shortcuts'})
    },
  }
}
</script>
<style scoped>
</style>
