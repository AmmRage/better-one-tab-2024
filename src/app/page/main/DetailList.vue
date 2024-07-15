<template>
  <div>

    <div class="text-xs-center" v-if="pageLength > 1">
      <v-pagination
          :value="currentPage"
          @input="changePage"
          :length="pageLength"
          circle
      ></v-pagination>
    </div>

    <v-expansion-panels
        ref="panel"
        v-model="panel"
        multiple
        popout
        :readonly="opts.disableExpansion"
        :value="expandStatus"
        @input="expandStatusChanged"
        class="my-3"
    >
      <v-expansion-panel
          v-for="tabList in listsInView"
          hide-default-footer
          class="tab-list"
          :key="tabList.index"
          ref="list"
          @change="onTabListExpandChange(tabList)"
      >
        <v-expansion-panel-header>
          <v-flex no-wrap xs10>
            <v-menu open-on-hover top offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-chip
                    label
                    small
                    :color="tabList.color"
                    class="lighten-3"
                    v-bind="attrs"
                    v-on="on"
                    @click.prevent.stop
                >{{ tabList.tabs.length }} {{ __('ui_tab') }}
                </v-chip>
              </template>
              <v-card>
                <v-layout wrap class="color-panel">
                  <v-flex wrap xs3 v-for="(color, colorIndex) in colorList" :key="colorIndex">
                    <div
                        class="color-selector lighten-3"
                        :class="color"
                        @click.stop="changeColor([tabList.index, color])"
                    ></div>
                  </v-flex>
                </v-layout>
              </v-card>
            </v-menu>
            <!-- created at  -->
            <strong class="grey--text date">{{ __('ui_created') }}
              <dynamic-time v-model="tabList.time"></dynamic-time>
            </strong>

            <v-chip v-for="tag in tabList.tags" :color="getColorByHash(tag)" class="lighten-3" :key="tag"
                    label small>
              {{ tag }}
            </v-chip>

            <!-- title -->
            <v-text-field
                @keydown.enter="saveTitle(tabList.index)"
                @blur="saveTitle(tabList.index)"
                class="title-editor"
                autofocus
                v-if="tabList.titleEditing"
                @click.prevent.stop
                :value="tabList.title"
                @input="setTitle([tabList.index, $event])"
                single-line
                hide-details
            ></v-text-field>
            <div
                class="list-title"
                v-else
                :class="[
            'font-size-24px', // + opts.titleFontSize
            tabList.color ? tabList.color + '--text' : '',
          ]"
            >{{ tabList.title }}
            </div>
          </v-flex>
          <v-flex xs2 class="text-xs-right">
            <v-btn
                :title="__('ui_title_down_btn')"
                @click.stop="moveListDown(tabList.index)"
                text icon class="icon-in-title"
                v-if="$route.name === 'detailList'"
                :disabled="tabList.index === lists.length - 1"
            >
              <v-icon color="gray" :style="{fontSize: '14px'}">fas fa-arrow-down</v-icon>
            </v-btn>
            <v-btn
                :title="__('ui_title_up_btn')"
                @click.stop="moveListUp(tabList.index)"
                text icon class="icon-in-title"
                v-if="$route.name === 'detailList'"
                :disabled="tabList.index === 0"
            >
              <v-icon color="gray" :style="{fontSize: '14px'}">fas fa-arrow-up</v-icon>
            </v-btn>
            <v-btn
                :title="__('ui_title_pin_btn')"
                @click.stop="pinList([tabList.index, !tabList.pinned])"
                text icon class="icon-in-title"
            >
              <v-icon :color="tabList.pinned ? 'blue' : 'gray'" :style="{fontSize: '14px'}">fas fa-thumbtack</v-icon>
            </v-btn>
          </v-flex>
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <v-card>
            <v-layout>
              <v-flex class="checkbox-column">
                <!-- check box select all -->
                <v-checkbox
                    hide-details
                    class="checkbox ml-5"
                    :value="tabList.tabs.some(tab => tab.selected)"
                    :indeterminate="tabList.tabs.some(tab => tab.selected) && tabList.tabs.some(tab => !tab.selected)"
                    @change="selectAllBtnClicked(tabList.index)"
                ></v-checkbox>
              </v-flex>
              <v-flex class="ml-1">
                <v-btn
                    :ref="'multi-op-' + tabList.index"
                    text small v-on:click="multiOpBtnClicked(tabList.index, $event)"
                    icon :disabled="tabList.tabs.every(tab => !tab.selected)"
                >
                  <v-icon>more_vert</v-icon>
                </v-btn>
                <v-btn text small v-on:click="changeTabListTitleBtnClicked(tabList.index)">{{ __('ui_retitle_list') }}</v-btn>
                <v-btn text small v-on:click="restoreList([tabList.index])">{{ __('ui_restore_all') }}</v-btn>
                <v-btn text small v-on:click="restoreList([tabList.index, true])">{{
                    __('ui_restore_all_in_new_window')
                  }}
                </v-btn>
                <v-btn text small color="error" v-on:click="removeList(tabList.index)" :disabled="tabList.pinned">
                  {{ __('ui_remove_list') }}
                </v-btn>
                <v-btn text small v-on:click="pinList([tabList.index, !tabList.pinned])">
                  {{ tabList.pinned ? __('ui_unpin') : __('ui_pin') }} {{ __('ui_list') }}
                </v-btn>
                <v-btn text small v-on:click="editTag(tabList.index, $event)" :ref="'edit-tag-' + tabList.index">EDIT TAG
                </v-btn>
              </v-flex>
            </v-layout>
            <v-divider></v-divider>
            <v-list dense class="my-1">
              <draggable
                  :value="tabList.tabs"
                  @input="setTabs([tabList.index, $event])"
                  v-bind="draggableOptions"
                  @change="tabMoved([tabList.index])"
              >
                <v-list-item
                    v-for="(tab, tabIndex) in tabList.tabs"
                    :href="opts.itemClickAction !== 'none' ? tab.url : null"
                    :target="opts.itemClickAction !== 'none' ? '_blank' : null"
                    @click.stop="itemClicked([tabList.index, tabIndex])"
                    @contextmenu="rightClicked(tabList.index, tabIndex, $event)"
                    class="list-item"
                    :ref="'list-' + tabList.index + '-tab'"
                    :key="tabIndex"
                    v-if="tabIndex < 10 || tabList.showAll"
                >
                  <!-- per url/tab checkbox -->
                  <v-list-item-action>
                  </v-list-item-action>

                  <v-checkbox
                      hide-details
                      class="checkbox"
                      :value="tab.selected"
                      @click.prevent.stop.self="tabSelected([tabList.index, tabIndex, !tab.selected])"
                      @change="singleTabChecked(tabList.index, tabIndex, !tab.selected)"
                  ></v-checkbox>

                  <div class="drag-indicator" @click.stop.prevent><i></i></div>

                  <v-list-item-content>
                    <v-list-item-title>
                      <v-avatar
                          tile
                          size="16"
                          color="grey lighten-4"
                          v-if="!opts.hideFavicon"
                      >
                        <img
                            :src="tab.favIconUrl ? tab.favIconUrl : `https://www.google.com/s2/favicons?domain=${getDomain(tab.url)}`">
                      </v-avatar>
                      {{ opts.itemDisplay === 'url' ? tab.url : tab.title }}
                    </v-list-item-title>
                    <v-list-item-subtitle v-if="opts.itemDisplay === 'title-and-url'">
                      {{ tab.url }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-layout v-if="tabList.tabs.length > 10 && !tabList.showAll">
                  <v-flex class="text-xs-center">
                    <v-btn small text @click="showAll(tabList.index)">
                      <v-icon>more_horiz</v-icon>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </draggable>
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="text-xs-center" v-if="pageLength > 1">
      <v-pagination
          :value="currentPage"
          @input="changePage"
          :length="pageLength"
          circle
      ></v-pagination>
    </div>

    <v-layout v-if="processed && listsToDisplay.length === 0" align-center justify-center column fill-height
              class="no-list-tip">
      <h3 class="display-3 grey--text" v-text="__('ui_no_list')"></h3>
      <p class="display-2 grey--text text--lighten-1" v-html="__('ui_no_list_tip')"></p>
    </v-layout>

    <context-menu v-model="showMenu" ref="contextMenu" @click="contextMenuClicked"></context-menu>

    <v-fab-transition>
      <v-btn :key="1" v-if="scrollY > 100" color="pink" fab fixed bottom right @click="$vuetify.goTo(0)">
        <v-icon>keyboard_arrow_up</v-icon>
      </v-btn>
      <v-btn :key="2" v-else color="green" fab fixed bottom right title="fold all lists" @click="collapseAll">
<!--        <v-icon v-if="panel.length > 0">unfold_less_double</v-icon>-->
<!--        <v-icon v-if="panel.length = 0">unfold_more_double</v-icon>-->

            <v-icon>unfold_less_double</v-icon>
      </v-btn>
    </v-fab-transition>

    <v-menu
        v-model="tag.editing"
        :close-on-content-click="false"
        :position-x="tag.x"
        :position-y="tag.y"
        absolute
        offset-y
    >
      <v-combobox
          autofocus
          v-model="tag.value"
          @input="tagChanged"
          :hide-no-data="!tag.input"
          :items="Object.keys(taggedList)"
          :search-input.sync="tag.input"
          label="Search an existing tag"
          multiple
          small-chips
          solo
          hide-details
          dense
      >
        <template slot="no-data">
          <v-list-item>
            <span class="subtitle-1">Create</span>
            <v-chip label small>
              {{ tag.input }}
            </v-chip>
          </v-list-item>
        </template>

        <template slot="selection" slot-scope="{ item, parent, selected }">
          <v-chip :v-model="selected" :color="getColorByHash(item)" class="lighten-3" label small>
            <span class="pr-2">{{ item }}</span>
            <v-icon small @click="parent.selectItem(item)">close</v-icon>
          </v-chip>
        </template>

      </v-combobox>
    </v-menu>

  </div>
</template>
<script>
import draggable from 'vuedraggable'

import __ from '@/common/i18n'
import tabs from '@/common/tabs'
import {createNewTabList} from '@/common/list'
import {formatTime, getColorByHash} from '@/common/utils'
import dynamicTime from '@/app/component/DynamicTime'
import contextMenu from '@/app/component/main/detailList/ContextMenu'
import {COLORS} from '@/common/constants'
import {mapState, mapActions, mapMutations, mapGetters} from 'vuex'

export default {
  data() {
    return {
      colorList: COLORS,
      processed: false, // if task to get list completed
      choice: null, // choice in search result
      showMenu: false, // item right click menu
      rightClickedListIndex: null,
      currentHighlightItem: null, // after jump to an item
      draggableOptions: {
        group: {
          name: 'g',
          put: true,
          pull: true,
        },
        animation: 150,
        handle: '.drag-indicator',
      },
      expandStatus: [],
      tag: {
        editing: false,
        listIndex: null,
        x: NaN,
        y: NaN,
        value: [],
        input: '',
      },
      panel: [],
    }
  },
  watch: {
    listsToDisplay: 'updateExpandStatus',
  },
  computed: {
    ...mapGetters(['inPageLists', 'getPageLength', 'taggedList', 'indexedLists', 'pinnedList']),
    ...mapState(['opts', 'lists', 'scrollY']),
    currentPage() {
      return +this.$route.query.p || 1
    },
    tagInView() {
      return this.$route.params.tag
    },
    listsToDisplay() {
      return this.$route.name === 'pinnedList' ? this.pinnedList
        : this.tagInView ? this.taggedList[this.tagInView] || []
        : this.indexedLists
    },
    listsInView() {
      let tabListsInView = this.inPageLists(this.currentPage, this.listsToDisplay)
      // console.debug('listsInView', tabListsInView)
      let panelValueToUpdate = []

      for (let i = 0; i < tabListsInView.length; i++) {
        const tabList = tabListsInView[i]
        // if (tabList.expand === true) {
        //   panelValueToUpdate.push(tabList.index)
        // }
        panelValueToUpdate.push(tabList.index)
      }
      this.panel = panelValueToUpdate

      return tabListsInView
    },
    pageLength() {
      return this.getPageLength(this.listsToDisplay.length)
    },
  },
  created() {
    this.init()
    // console.log('lists', this.lists)
  },
  activated() {
    if (this.$route.query.listIndex != null) this.jumpTo(this.$route.query)
  },
  components: {
    draggable,
    dynamicTime,
    contextMenu,
  },
  methods: {
    log: console.log,
    __,
    formatTime,
    getColorByHash,
    ...mapMutations([
      'openChangeTitle', 'showAll', 'tabSelected', 'addTab',
      'removeTabDirectly', 'setTitle', 'addList', 'setTabs',
    ]),
    ...mapActions([
      'showSnackbar', 'itemClicked', 'getLists', 'removeList',
      'removeTab', 'restoreList', 'saveTitle', 'pinList',
      'moveListUp', 'moveListDown', 'expandList', 'changeColor',
      'tabMoved', 'setTags',
    ]),
    init() {
      if (DEBUG) window.dl = this
      this.getLists().then(() => {
        this.updateExpandStatus()
        if (!this.processed) {
          this.processed = true
          if (this.$route.query.listIndex != null) this.jumpTo(this.$route.query)
        }
      })
      document.addEventListener('click', () => {
        if (!this.currentHighlightItem) return
        this.currentHighlightItem.$el.classList.remove('elevation-20')
      })
      document.addEventListener('keydown', event => {
        if (event.keyCode === 27) this.showMenu = false
      })
    },
    getExpandStatus() {
      return this.listsInView.map(i => i.expand !== false)
    },
    expandStatusChanged(newStatus) {
      // console.debug('expandStatusChanged', newStatus)
      const indexInPage = this.expandStatus.findIndex((s, i) => s !== newStatus[i])
      if (!~indexInPage) return
      const index = indexInPage + (this.currentPage - 1) * this.opts.listsPerPage
      const expand = newStatus[indexInPage]
      this.expandList([expand, index])
    },
    async updateExpandStatus() {
      await this.$nextTick()
      if (this.opts.disableExpansion) {
        this.expandStatus = this.listsToDisplay.map(() => true)
      } else {
        this.expandStatus = this.getExpandStatus()
        // console.debug('updateExpandStatus', this.expandStatus)
      }
    },
    getDomain(url) {
      try {
        return new URL(url).hostname
      } catch (error) {
        return ''
      }
    },
    async contextMenuClicked(func, ...args) {
      await this[func](...args)
      this.showMenu = false
    },
    rightClicked(listIndex, tabIndex, $event) {
      $event.preventDefault()
      this.showMenu = false
      this.rightClickedListIndex = listIndex

      // refer gmail behaviour: unselect all except it if clicked item is not selected
      if (!this.lists[listIndex].tabs[tabIndex].selected) {
        for (let i = 0; i < this.lists[listIndex].tabs.length; i += 1) {
          this.tabSelected([listIndex, i, i === tabIndex])
        }
      }

      this.$refs.contextMenu.x = $event.clientX
      this.$refs.contextMenu.y = $event.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    },
    getSelectedItems() {
      const list = this.lists[this.rightClickedListIndex]
      const selectedItems = []
      list.tabs.forEach((tab, tabIndex) => {
        if (tab.selected) {
          selectedItems.push({
            // for avoid to change old functions
            listIndex: this.rightClickedListIndex,
            tabIndex,
          })
        }
      })
      return selectedItems
    },
    moveSelectedItemsTo(targetListIndex) {
      const items = this.getSelectedItems()
      if (!(items && items.length)) return
      const changedLists = [targetListIndex]
      const tabs = items.map(({
        listIndex,
        tabIndex,
      }) => {
        changedLists.push(listIndex)
        return this.lists[listIndex].tabs[tabIndex]
      })
      items.sort((a, b) => b.tabIndex - a.tabIndex)
        .forEach(({
          listIndex,
          tabIndex,
        }) => this.removeTabDirectly([listIndex, tabIndex]))

      if (targetListIndex === -1) {
        const newList = createNewTabList({tabs})
        // console.debug('newList', newList)
        this.addList([newList])
        this.tabMoved(changedLists.map(i => i + 1)) // it will create a new list
      } else {
        tabs.forEach(tab => this.addTab([targetListIndex, tab]))
        this.tabMoved(changedLists)
      }
    },
    openSelectedItems() {
      const items = this.getSelectedItems()
      if (!(items && items.length)) return
      const toRestoredTabs = items.map(({
        listIndex,
        tabIndex,
      }) => this.lists[listIndex].tabs[tabIndex])
      return tabs.restoreTabs(toRestoredTabs)
    },
    duplicateSelectedItems() {
      const items = this.getSelectedItems()
      if (!(items && items.length)) return
      const changedLists = []
      items.forEach(({
        listIndex,
        tabIndex,
      }) => {
        changedLists.push(listIndex)
        this.addTab([listIndex, this.lists[listIndex].tabs[tabIndex]])
      })
      this.tabMoved(changedLists)
    },
    async copyLinksOfSelectedItems() {
      const items = this.getSelectedItems()
      if (!(items && items.length)) return
      const text = items.map(({
        listIndex,
        tabIndex,
      }) => {
        const tab = this.lists[listIndex].tabs[tabIndex]
        return tab.url
      }).join('\n')
      if (await this.$copyText(text)) this.showSnackbar(__('ui_copied'))
    },
    async copyTitleOfSelectedItems() {
      const items = this.getSelectedItems()
      if (!(items && items.length)) return
      const text = items.map(({
        listIndex,
        tabIndex,
      }) => {
        const tab = this.lists[listIndex].tabs[tabIndex]
        return tab.title
      }).join('\n')
      if (await this.$copyText(text)) this.showSnackbar(__('ui_copied'))
    },
    removeSelectedItems() {
      const items = this.getSelectedItems()
      // console.log('removeSelectedItems', items)
      if (!(items && items.length)) return
      const changedLists = []
      items.sort((a, b) => b.tabIndex - a.tabIndex)
        .forEach(({
          listIndex,
          tabIndex,
        }) => {
          changedLists.push(listIndex)
          this.removeTabDirectly([listIndex, tabIndex])
        })
      this.tabMoved(changedLists)
    },
    changePage(page) {
      const {path} = this.$route
      this.$router.push({
        path,
        query: {p: page},
      })
    },
    selectAllBtnClicked(listIndex) {
      // console.debug('selectAllBtnClicked', listIndex)
      const list = this.lists[listIndex]
      const targetStatus = list.tabs.every(tab => !tab.selected)
      for (let i = 0; i < list.tabs.length; i += 1) {
        this.tabSelected([listIndex, i, targetStatus])
      }
    },
    singleTabChecked(parameterArray){

    },
    multiOpBtnClicked(listIndex, $event) {
      this.showMenu = false
      this.$refs.contextMenu.x = $event.x
      this.$refs.contextMenu.y = $event.y
      this.multiOpBtnClickedListIndex = listIndex
      this.$nextTick(() => {
        this.showMenu = true
      })
    },
    async jumpTo(item) {
      const page = (item.listIndex / this.opts.listsPerPage << 0) + 1
      this.$router.replace({
        name: 'detailList',
        query: {p: page},
      })
      await this.$nextTick()
      const opt = {
        duration: 500,
        offset: 100,
        easing: 'easeInOutCubic',
      }
      if (item.tabIndex == null) {
        this.currentHighlightItem = this.$refs.list[item.listIndex]
      } else {
        this.expandList([true, item.listIndex])
        this.currentHighlightItem = this.$refs[`list-${item.listIndex}-tab`][item.tabIndex]
      }
      await this.$nextTick()
      setTimeout(() => {
        this.$vuetify.goTo(this.currentHighlightItem, opt)
        this.currentHighlightItem.$el.classList.add('elevation-20')
      }, 0)
    },
    async collapseAll() {
      // console.debug('collapseAll')
      this.panel = []
    },
    editTag(listIndex, $event) {
      this.tag.listIndex = listIndex
      this.tag.value = this.lists[listIndex].tags || []
      this.tag.x = $event.x
      this.tag.y = $event.y
      this.tag.editing = true
    },
    tagChanged(tags) {
      this.setTags([this.tag.listIndex, tags])
    },
    changeTabListTitleBtnClicked(tabListIndex){
      // console.debug('changeTabListTitleBtnClicked', tabListIndex)
      this.openChangeTitle(tabListIndex)
    },
    onTabListExpandChange(changeValue) {
      // console.debug('onTabListExpandChange', changeValue)
    },
  },
}
</script>
<style lang="scss" scoped>
.color-panel {
  width: 136px;
  height: 110px;
  padding: 5px;

  .color-selector {
    display: inline-block;
    width: 26px;
    height: 26px;
    border-radius: 13px;
    border: 2px solid white !important;

    &:hover {
      border: 2px solid gray !important;
    }
  }
}

.date {
  font-size: 12px;
  margin-left: 12px;
}

.title-editor {
  padding: 0;
  position: absolute;
  display: inline-flex;
  width: 40%;
  font-size: 24px;
  margin-left: 100px;
}

.list-title {
  position: absolute;
  display: inline-block;
  line-height: 34px;
  padding: 0 12px;
}

.font-size-12px {
  font-size: 12px;
}

.font-size-18px {
  font-size: 18px;
}

.font-size-24px {
  font-size: 24px;
  margin-left: 100px;
  border-bottom: 2px solid #8bc34a !important;
}

.font-size-36px {
  font-size: 36px;
}

.tab-list {
  .icon-in-title {
    margin: 0 0 0 auto;
    width: 30px;
    height: 30px;
  }

  .icon-in-title {
    .gray--text {
      display: none;
    }
  }

  &:hover {
    .icon-in-title {
      .gray--text {
        display: flex;
      }
    }
  }

  .checkbox-column {
    max-width: 40px;
    margin-left: 40px;

    .checkbox {
      margin-left: 0;
      margin-top: 0;
      //padding-top: (40px - 24px) / 2;
    }
  }
}

.sortable-ghost, .sortable-chosen {
  opacity: .5;
  box-shadow: 0 3px 3px -2px rgba(0, 0, 0, .2), 0 3px 4px 0 rgba(0, 0, 0, .14), 0 1px 8px 0 rgba(0, 0, 0, .12);

  &.list-item {
    .drag-indicator {
      display: flex;
    }
  }
}

.sortable-drag {
  opacity: 0;
}

.list-item {
  padding-bottom: 20px;
  padding-left: 4px;

  .checkbox {
    margin-right: 5px;
    margin-top: 0;
  }

  .clear-btn {
    display: none;
  }

  &:hover {
    .clear-btn {
      display: block;
    }

    .drag-indicator {
      display: flex;
    }
  }

  .drag-indicator {
    position: absolute;
    cursor: move;
    z-index: 1000;
    display: none;
    flex-direction: column;
    justify-content: center;
    height: 100%;

    i {
      display: inline-block;
      width: 16px;
      height: 16px;
      background-repeat: no-repeat;
      background-size: contain;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAQAAABIkb+zAAABiElEQVR4Ae3ZgYYCYRQF4AVi9QhVMECJuefNtl6h9AS79QhJz1ADQFX7HFtUrMVWdxdYMv+PvVz/cL4DcBCYuZ15ov8iIiIiIqJeA31Z4fSbJQbdpr3vqFPHXO7Qv8gd807d3neR1bCBlmST1ex9BzKBlkcm1r4DyeQW/EE3yQx9H/kIGk4+MvR9YAcNR/aGvg98QSP5NPR94AKN5GLo+5A9NBx5N/R9YAyNZGzo+8jbscciWoZ+Ai+yqb3vckrIvvyRmNXsfadjThaPx5ksOnVD31+3iYEUOOIoRfg8jvT9ERERcRfiLsRdiLsQdyHuQtyFuAtxF+IuxF2IuxAREXEXyl+kwAEHWaHfa1RsF5KZ3B7+ns/wXJldSNalx9m6IrsQXqGBvFVgF0ILV2gg33k7+V1IhtBwZJj+LrSBRrJNfxc6QSM5pb8LnaGRnJPfhbCFRrIz7EKpjbv2Xcj/MXq170LVepFNE/vElNwuZDjOUtuFAudxgQ8csMSg1+AuREREREREXn4A0o+voNRuPgAAAAAASUVORK5CYII=);
    }
  }
}

.no-list-tip {
  user-select: none;
}
</style>
`
