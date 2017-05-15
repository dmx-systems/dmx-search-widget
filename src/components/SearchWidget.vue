<template>
  <el-dialog custom-class="search-widget" :visible="visible" @update:visible="update" :modal="false" title="Search">
    <el-input v-model="search" size="small"></el-input>
    <el-table :data="searchResult" highlight-current-row @current-change="onSelection">
      <el-table-column prop="value" label="Topic"></el-table-column>
      <el-table-column prop="typeName" label="Type"></el-table-column>
    </el-table>
    <el-button @click="revealTopic">Reveal Topic</el-button>
  </el-dialog>
</template>

<script>
import dm5 from 'dm5'

export default {

  data () {
    return {
      search: '',
      searchResult: undefined,
      topic: undefined
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
        style.top  = this.pos.rendered.y + 'px'
        style.left = this.pos.rendered.x + 'px'
      } else {
        this.close()
      }
    },

    onSelection (topic) {
      this.topic = topic
    },

    revealTopic () {
      this.close()
      this.$store.dispatch('onTopicReveal', {
        id: this.topic.id,
        pos: this.pos.model
      })
    },

    close () {
      this.$store.dispatch('closeSearchWidget')
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

.search-widget .el-table {
  margin-top: 1em;
  margin-bottom: 1em;
}

/* TODO: avoid dialog overflow and drop this rule then */
/*.el-dialog__wrapper {
  overflow: hidden;
}*/
</style>
