import Vue from 'vue'
import {createMemoryHistory, createRouter, createWebHistory} from 'vue-router'
import Main from '../page/Main.vue'
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
  {
    path: '/:pathMatch(.*)*',
    component: Main,
    name: 'all',
  },
  {
    path: '/app',
    component: Main,
    children: [
      {
        path: 'options/sync',
        component: SyncInfo,
        name: 'syncInfo',
      },
      {
        path: 'options',
        component: Options,
        name: 'options',
      },
      {
        path: 'about',
        component: About,
        name: 'about',
      },
      {
        path: 'import-export',
        component: ImportExport,
        name: 'import-export',
      },
      {
        path: 'search',
        component: Search,
        name: 'search',
      },
      {
        path: 'list',
        component: DetailList,
        name: 'detailList',
      },
      {
        path: 'list/pinned',
        component: DetailList,
        name: 'pinnedList',
      },
      {
        path: 'list/tag/:tag',
        component: DetailList,
        name: 'taggedList'
      },
      {
        path: '*',
        redirect: { name: 'detailList' }
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


if (PRODUCTION) {
 import(
   /* webpackChunkName: "tracker", webpackMode: "lazy" */
   '@/common/tracker'
 ).then(({tracker}) => {
   tracker()
   router.beforeEach((to, from, next) => {
     ga('set', 'page', to.name)
     ga('send', 'pageview')
     next()
   })
 })
}

export default router
