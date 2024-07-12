<template>
  <h1>ExtensionMain.vue</h1>
  <v-app :class="{'no-transition': opts.disableTransition}">
    <h1>App.vue</h1>
    <drawer :value="drawer"></drawer>
    <toolbar></toolbar>
    <v-main>
      <v-container>
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </v-container>
    </v-main>
    <v-footer app :style="footerStyle">
      <v-spacer></v-spacer>
      <span>
      Made with <i class="fa fa-heart throb" style="color:#d43f57"></i> by <a style="text-decoration: none;"
                                                                              href="https://www.cnwangjie.com/"
                                                                              target="_blank">WangJie</a>
    </span>
      <v-spacer></v-spacer>
    </v-footer>
    <snackbar></snackbar>
  </v-app>
</template>
<script>
import __ from '@/common/i18n'

import drawer from '@/app/component/main/Drawer'
import toolbar from '@/app/component/main/Toolbar'
import snackbar from '@/app/component/main/Snackbar'

import {mapState, mapActions} from 'vuex'

export default {
  data() {
    return {
      syncing: false,
      lastUpdated: NaN,
      uploadError: null,
    }
  },
  components: {
    drawer,
    toolbar,
    snackbar,
  },
  computed: {
    ...mapState(['drawer', 'nightmode', 'opts']),
    footerStyle() {
      const isDark = this.$vuetify.theme.dark
      const color = isDark ? this.$vuetify.theme.themes.dark.footer : this.$vuetify.theme.themes.light.footer
      return {
        backgroundColor: color,
      }
    },
  },
  created() {
    console.log('Main created')
    this.init()
  },
  methods: {
    __,
    ...mapActions(['loadOptions', 'checkToken', 'loadNightmode', 'loadDrawer', 'switchDrawer']),
    init() {
      this.loadNightmode()
      this.checkToken()
      this.loadDrawer()
      this.loadOptions()
    },
  },
}
</script>
<style>
.no-transition * {
  transition: none !important;
}

</style>
