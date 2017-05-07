<template>
  <el-dialog :visible="visible" @update:visible="update" :modal="false" title="Search" custom-class="search-widget">
  </el-dialog>
</template>

<script>
export default {

  computed: {

    visible () {
      return this.$store.state.searchWidget.visible
    },

    pos () {
      return this.$store.state.searchWidget.pos
    }
  },

  methods: {
    update (visible) {
      if (visible) {
        var style = this.$el.querySelector('.el-dialog.search-widget').style
        style.top  = this.pos.y + 'px'
        style.left = this.pos.x + 'px'
      } else {
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
  transform: none;
}

/* TODO: avoid dialog overflow and drop this rule then */
.el-dialog__wrapper {
  overflow: hidden;
}
</style>
