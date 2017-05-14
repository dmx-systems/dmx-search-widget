<template>
  <el-dialog :visible="visible" @update:visible="update" :modal="false" title="Search" custom-class="search-widget">
    <el-input v-model="search" size="small"></el-input>
    <el-table :data="searchResult">
      <el-table-column prop="value" label="Topic"></el-table-column>
      <el-table-column prop="typeName" label="Type"></el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
import dm5 from 'dm5'

export default {

  data () {
    return {
      search: '',
      searchResult: undefined
    }
  },

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

  watch: {
    search () {
      if (this.search) {
        dm5.restClient.searchTopics(this.search).then(topics => {
          this.searchResult = topics
        })
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
  transform: none;    /* reset el-dialog translateX */
}

/* TODO: avoid dialog overflow and drop this rule then */
.el-dialog__wrapper {
  overflow: hidden;
}
</style>
