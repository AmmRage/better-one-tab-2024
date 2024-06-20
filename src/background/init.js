import _ from 'lodash'
import logger from '../common/logger'
import options from '../common/options'
import storage from '../common/storage'
import migrate from '../common/migrate'
import boss from '../common/service/boss'
import {normalizeList} from '../common/list'
import commandHandler from './commandHandler'
import messageHandler from './messageHandler'
import listManager from '../common/listManager'
import {setupContextMenus, dynamicDisableMenu} from './contextMenus'
import installedEventHandler from './installedEventHandler'
import {updateBrowserAction} from './browserAction'

import browser from 'webextension-polyfill'
import {SYNC_SERVER_HOST_KEY, TOKEN_KEY, USER_NAME_KEY} from '../common/constants'

/* eslint-disable-next-line */
if (DEBUG && !MOZ) {
  import(
    /* webpackChunkName: "autoreload", webpackMode: "lazy" */
    '../common/autoreload'
  ).then(({autoreload}) => autoreload())
}

/* eslint-disable-next-line */
if (PRODUCTION) {
  import(
    /* webpackChunkName: "tracker", webpackMode: "lazy" */
    '../common/tracker'
  ).then(({tracker}) => tracker())
}

if (DEBUG) {
  window.browser = browser
  window.listManager = listManager
  window.boss = boss
  browser.browserAction.setBadgeText({text: 'dev'})
  import(
    /* webpackChunkName: "helper", webpackMode: "lazy" */
    '../common/helper'
  ).then(helper => {
    window.helper = helper
  })
}

const initOptions = async () => {
  // mount the `opts` to global
  const opts = window.opts = await storage.getOptions() || {}
  const defaultOptions = options.getDefaultOptions()

  // set it as default value if there is an option not in current options
  if (_.keys(defaultOptions).some(key => !_.has(opts, key))) {
    _.defaults(opts, defaultOptions)
    await storage.setOptions(opts)
  }

  // init nightmode status
  window.nightmode = opts.defaultNightMode
  return opts
}

const storageChangedHandler = changes => {
  console.debug('[storage changed]', changes)
  if (changes.boss_token) {
    window.boss_token = changes.boss_token
  }
  if (changes.lists) {
    if (changes.lists.newValue && changes.lists.newValue.length) {
      console.log('tabs to upload:', changes.lists.newValue)
      let syncServerHost = ''
      let token = ''
      let username = ''

      chrome.storage.local.get(null, items => {
        if (items) {
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
            fetch(syncServerHost + `/api/user/${username}/tabs`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Token: token,
              },
              body: JSON.stringify({
                tabs: changes.lists.newValue,
                token: token
              }),
            })
              .then(async response => response.json())
              .then(async data => {
                console.log('data:', data)
              })
              .catch(error => {
                console.error('Error:', error)
              })
          }
        } else {
          console.log('The key myKey does not exist in local storage.')
        }
      })
    }
    if (window.opts.disableDynamicMenu) return
    setupContextMenus(window.opts)
  }
}

const tabsChangedHandler = activeInfo => {
  if (window.opts.disableDynamicMenu) return
  window.coverBrowserAction(activeInfo)
  dynamicDisableMenu(activeInfo)
}

const fixDirtyData = async () => {
  const unlock = await listManager.RWLock.lock()
  const {lists} = await browser.storage.local.get('lists')
  if (lists) {
    const cleanLists = lists.filter(_.isPlainObject).map(normalizeList)
    await browser.storage.local.set({lists: cleanLists})
  }
  await unlock()
}

const init = async () => {
  logger.init()
  await listManager.init()
  const opts = await initOptions()
  await updateBrowserAction(opts.browserAction)
  await setupContextMenus(opts)
  await Promise.all([
    browser.commands.onCommand.addListener(commandHandler),
    browser.runtime.onMessageExternal.addListener(commandHandler),
    browser.runtime.onMessage.addListener(messageHandler),
    browser.runtime.onUpdateAvailable.addListener(detail => {
      window.update = detail.version
    }),
    browser.runtime.onInstalled.addListener(installedEventHandler),
    browser.browserAction.onClicked.addListener(() => window.browswerActionClickedHandler()),
    browser.contextMenus.onClicked.addListener(info => window.contextMenusClickedHandler(info)),
    browser.tabs.onActivated.addListener(_.debounce(tabsChangedHandler, 200)),
    browser.storage.onChanged.addListener(storageChangedHandler),
  ])
  await migrate()
  await fixDirtyData()
  await boss.init()
}

export default init