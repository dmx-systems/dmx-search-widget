<template>
  <el-dialog custom-class="search-widget" :visible.sync="visible" :modal="false" :show-close="false"
    title="Search / Create">
    <div class="controls">
      <div class="search">
        <div class="field-label">Search</div>
        <el-input v-model="search" size="small"></el-input>
      </div>
      <div class="create">
        <el-select v-model="menuItem" value-key="uri" size="small">
          <el-option v-for="type in menuTopicTypes" :label="type.value" :value="type" :key="type.uri"></el-option>
          <el-option value="-" disabled></el-option>
          <el-option v-for="item in extraMenuItems" :label="item.label" :value="item" :key="item.uri"></el-option>
        </el-select>
        <el-button size="small" :disabled="!search || !menuItem" @click="buttonHandler">Create</el-button>
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

  created () {
    this.$store.registerModule('searchWidget', require('../search-widget').default)
  },

  props: ['menuTopicTypes'],

  data () {
    return {
      search: '',
      searchResult: undefined,
      menuItem: undefined
    }
  },

  computed: {

    visible: {
      get () {
        return this.$store.state.searchWidget.visible
      },
      set (visible) {
        // console.log('visible setter', visible)    // FIXME: called twice on close
        if (visible) {
          var style = this.$el.querySelector('.el-dialog.search-widget').style
          style.top  = this.pos.render.y + 'px'
          style.left = this.pos.render.x + 'px'
        } else {
          this.close()
        }
      }
    },

    pos () {
      return this.$store.state.searchWidget.pos
    },

    extraMenuItems () {
      return this.$store.state.searchWidget.extraMenuItems
    },

    noSelect () {
      return this.$store.state.searchWidget.noSelect
    },

    auxAction () {
      return this.$store.state.searchWidget.auxAction
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

    buttonHandler () {
      this.close()
      if (this.menuItem instanceof dm5.TopicType) {
        this.createTopic(this.menuItem)
      } else {
        this.createExtra()
      }
    },

    createTopic (topicType) {
      const topicModel = topicType.newTopicModel(this.search)
      console.log('createTopic', topicModel)
      dm5.restClient.createTopic(topicModel).then(topic => {
        console.log(topic)
        this._revealTopic(topic)
      }).catch(error => {
        console.error(error)
      })
    },

    createExtra () {
      this.menuItem.create(this.search)
    },

    _revealTopic (topic) {
      this.$store.dispatch('revealTopic', {
        topic,
        pos: this.pos.model,
        select: !this.noSelect
      })
      if (this.auxAction) {
        this.$store.dispatch(this.auxAction, topic)
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

.search-widget .controls .create {
  display: flex;
  margin-left: 1em;
}

.search-widget .el-table {
  margin-top: 1em;
}
</style>
