<template>
  <el-dialog custom-class="search-widget" :visible="visible" @update:visible="update" :modal="false" :show-close="false"
             title="Search / Create">
    <div class="controls">
      <div class="search">
        <div class="label">Search</div>
        <el-input v-model="search" size="small"></el-input>
      </div>
      <div class="create">
        <el-select v-model="topicTypeUri" size="small">
          <el-option v-for="topicType in menuTopicTypes" :label="topicType.value" :value="topicType.uri"
                     :key="topicType.uri">
          </el-option>
        </el-select>
        <el-button size="small" :disabled="!search || !topicTypeUri" @click="createTopic">Create Topic</el-button>
      </div>
    </div>
    <el-table :data="searchResult" :default-sort="{prop: 'typeName'}" empty-text="No Match" @row-click="revealTopic">
      <el-table-column prop="value"    label="Topic" sortable></el-table-column>
      <el-table-column prop="typeName" label="Type"  sortable></el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
import dm5 from 'dm5'

export default {

  props: ['menuTopicTypes'],

  data () {
    return {
      search: '',
      searchResult: undefined,
      topicTypeUri: undefined
    }
  },

  computed: {

    visible () {
      return this.$store.state.searchWidget.visible
    },

    pos () {
      return this.$store.state.searchWidget.pos
    },

    searchQuery () {
      return this.search + '*'    // TODO
    }
  },

  methods: {

    revealTopic (topic) {
      this.close()
      this._revealTopic(topic)
    },

    createTopic () {
      this.close()
      const topicModel = dm5.typeCache.getTopicType(this.topicTypeUri).newTopicModel(this.search)
      console.log('createTopic', topicModel)
      dm5.restClient.createTopic(topicModel).then(topic => {
        console.log(topic)
        this._revealTopic(topic)
      }).catch(error => {
        console.error(error)
      })
    },

    _revealTopic (topic) {
      this.$store.dispatch('revealTopic', {
        topic,
        pos: this.pos.model,
        select: true
      })
    },

    update (visible) {
      if (visible) {
        var style = this.$el.querySelector('.el-dialog.search-widget').style
        style.top  = this.pos.render.y + 'px'
        style.left = this.pos.render.x + 'px'
      } else {
        this.close()
      }
    },

    close () {
      this.$store.dispatch('closeSearchWidget')
    }
  },

  watch: {
    search () {
      if (this.search) {
        dm5.restClient.searchTopics(this.searchQuery).then(topics => {
          this.searchResult = topics
        })
      } else {
        this.searchResult = undefined
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

.search-widget .controls {
  display: flex;
  align-items: flex-end;
}

.search-widget .controls .search {
  flex: auto;
}

.search-widget .controls .search .label {
  font-size: var(--label-font-size);
  color:     var(--label-color);
}

.search-widget .controls .create {
  display: flex;
  margin-left: 1em;
}

.search-widget .el-table {
  margin-top: 1em;
}

/* TODO: avoid dialog overflow and drop this rule then */
/*.el-dialog__wrapper {
  overflow: hidden;
}*/
</style>
