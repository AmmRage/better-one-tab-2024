<template>
<div>

<v-menu
  :model-value="value"

  min-width="200"
  absolute
>
  <v-list density="compact">
    <!-- <v-subheader>{{ __('ui_move_to') }}</v-subheader> -->
    <v-menu  open-on-hover>
      <v-list-item @click.stop="$emit('click', 'init')" slot="activator">
        <v-list-item-action>
          <v-icon size="small">move_to_inbox</v-icon>
        </v-list-item-action>

          {{ __('ui_move_to') }}

        <v-list-item-action>
          <v-icon :style="{transform: 'rotate(-90deg)'}">arrow_drop_down</v-icon>
        </v-list-item-action>
      </v-list-item>
      <v-list density="compact">
        <v-list-item
          v-for="list in titledList"
          :key="list.index"
          @click.stop="$emit('click', 'moveSelectedItemsTo', list.index)"
          :color="list.color"
        >
          <v-list-item-title>{{ list.title }}</v-list-item-title>
        </v-list-item>
        <v-list-item @click.stop="$emit('click', 'moveSelectedItemsTo', -1)">
          <v-list-item-title>
            <v-icon size="small">create_new_folder</v-icon>
            {{ __('ui_a_new_list') }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-divider class="my-1"></v-divider>

    <v-list-item @click.stop="$emit('click', 'openSelectedItems')">
      <v-list-item-action>
        <v-icon size="small">open_in_browser</v-icon>
      </v-list-item-action>

        {{ __('ui_open') }}

    </v-list-item>

    <v-list-item @click.stop="$emit('click', 'duplicateSelectedItems')">
      <v-list-item-action>
        <v-icon size="small">content_copy</v-icon>
      </v-list-item-action>

        {{ __('ui_duplicate') }}

    </v-list-item>

    <v-list-item @click.stop="$emit('click', 'copyLinksOfSelectedItems')">
      <v-list-item-action>
        <v-icon size="small">link</v-icon>
      </v-list-item-action>

        {{ __('ui_copy_link') }}

    </v-list-item>

    <v-list-item @click.stop="$emit('click', 'copyTitleOfSelectedItems')">
      <v-list-item-action>
        <v-icon size="small">title</v-icon>
      </v-list-item-action>

        {{ __('ui_copy_title') }}

    </v-list-item>

    <v-divider class="my-1"></v-divider>

    <v-list-item @click.stop="$emit('click', 'removeSelectedItems')">
      <v-list-item-action>
        <v-icon size="small">delete</v-icon>
      </v-list-item-action>

        {{ __('ui_remove') }}

    </v-list-item>
  </v-list>
</v-menu>

</div>
</template>

<script>
import { mapGetters } from 'vuex'
import __ from '@/common/i18n'

export default {
  data() {
    return {
      x: NaN, y: NaN, // menu position
    }
  },
  computed: {
    ...mapGetters(['titledList']),
  },
  props: {
    value: Boolean,
  },
  methods: {
    __,
  },
}
</script>
