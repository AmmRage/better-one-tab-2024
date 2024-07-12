<template>
  <div >
    <h1>App.vue</h1>
    <!--  <p>-->
    <!--    <router-link to="/">Home</router-link> |-->
    <!--    <router-link to="/about">About</router-link>-->
    <!--  </p>-->

  </div>
  <router-view />
</template>
<script>
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import '@/assets/css/fontawesome-all.min.css'

export default {
  name: 'app',
  created() {
    console.log('App created')
    /* eslint-disable-next-line */
    if (PRODUCTION) {
      import(
          /* webpackChunkName: "tracker", webpackMode: "lazy" */
          '@/common/tracker'
          ).then(({tracker}) => {
        tracker()
        if (!this.$route.name) return
        ga('set', 'page', this.$route.name)
        ga('send', 'pageview')
      })
    }
  },
}
</script>
<style lang="scss">
</style>

