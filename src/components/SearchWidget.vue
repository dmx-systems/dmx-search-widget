<template>
  <el-dialog class="search-widget" :visible="visible" @update:visible="update" title="Search">
  </el-dialog>
</template>

<script>
export default {

  computed: {
    visible () {
      return this.$store.state.searchWidget.visible
    }
  },

  methods: {
    update (visible) {
      if (!visible) {
        this.$store.dispatch('onSearchWidgetClosed')
      }
    }
  },

  created () {
    this.$store.registerModule('searchWidget', require('../search-widget').default)
  }
}
</script>

<style>
.search-widget {
}
</style>
