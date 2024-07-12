import Vue from 'vue'
import {createMemoryHistory, createRouter, createWebHashHistory, createWebHistory} from 'vue-router'

// const Main = () => import(/* webpackChunkName: "main" */ '@/app/page/Main')
import ExtensionMain from '../page/ExtensionMain.vue'
const Popup = () => import(/* webpackChunkName: "popup" */ '@/app/page/Popup')
const SyncInfo = () => import(/* webpackChunkName: "main" */ '@/app/page/main/SyncInfo')
const Options = () => import(/* webpackChunkName: "main" */ '@/app/page/main/Options')
const About = () => import(/* webpackChunkName: "main" */ '@/app/page/main/About')
const ImportExport = () => import(/* webpackChunkName: "main" */ '@/app/page/main/ImportExport')
const Search = () => import(/* webpackChunkName: "main" */ '@/app/page/main/Search')
const DetailList = () => import(/* webpackChunkName: "main" */ '@/app/page/main/DetailList')

const routes = [
  {
    path: '/popup',
    component: Popup,
    name: 'popup',
  },
  // {
  //   path: '/:pathMatch(.*)*',
  //   component: Main,
  //   name: 'all',
  // },
  {
    path: '/app',
    component:  ExtensionMain,
    name: 'ExtensionMain',
    children: [
      {
        path: 'options/sync',
        component: SyncInfo,
      },
      {
        path: 'options',
        component: Options,
      },
      {
        path: 'about',
        component: About,
      },
      {
        path: 'import-export',
        component: ImportExport,
      },
      {
        path: 'search',
        component: Search,
      },
      {
        path: 'list',
        component: DetailList,
      },
      {
        path: 'list/pinned',
        component: DetailList,
      },
      {
        path: 'list/tag/:tag',
        component: DetailList,
      },
      {
        path: '*',
        redirect: { name: 'detailList' }
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})


// if (PRODUCTION) {
//   console.log('PRODUCTION')
//  import(
//    /* webpackChunkName: "tracker", webpackMode: "lazy" */
//    '@/common/tracker'
//  ).then(({tracker}) => {
//    tracker()
//    router.beforeEach((to, from, next) => {
//      ga('set', 'page', to.name)
//      ga('send', 'pageview')
//      next()
//    })
//  })
// }

export default router
