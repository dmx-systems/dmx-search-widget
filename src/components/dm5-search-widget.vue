<template>
  <el-dialog custom-class="search-widget" :visible="visible" :modal="false" :show-close="false" @open="open"
      @close="close">
    <div class="controls">
      <div class="search">
        <div class="field-label">Search</div>
        <el-input v-model="searchTerm"></el-input>
      </div>
      <div class="create">
        <el-select v-model="menuItem" value-key="uri">
          <el-option v-for="type in menuTopicTypes" :label="type.value" :value="type" :key="type.uri"></el-option>
          <el-option value="-" disabled></el-option>
          <el-option v-for="item in extraMenuItems" :label="item.label" :value="item" :key="item.uri"></el-option>
        </el-select>
        <el-button :disabled="!searchTerm || !menuItem" @click="buttonHandler">Create</el-button>
      </div>
    </div>
    <dm5-topic-list :topics="resultTopics" empty-text="No Match" v-if="searchTerm" @topic-click="revealTopic">
    </dm5-topic-list>
  </el-dialog>
</template>

<script>
import Vuex from 'vuex'
import dm5 from 'dm5'

export default {

  created () {
    this.$store.registerModule('searchWidget', require('../search-widget').default)
  },

  props: ['menuTopicTypes'],

  data () {
    return {
      searchTerm: '',
      resultTopics: [],
      menuItem: undefined
    }
  },

  computed: {

    ...Vuex.mapState({
      visible:        state => state.searchWidget.visible,
      pos:            state => state.searchWidget.pos,
      extraMenuItems: state => state.searchWidget.extraMenuItems,
      noSelect:       state => state.searchWidget.noSelect,
      topicHandler:   state => state.searchWidget.topicHandler
    }),

    searchQuery () {
      return this.searchTerm + '*'    // TODO
    }
  },

  methods: {

    open () {
      // console.log('open')
      var style = this.$el.querySelector('.el-dialog.search-widget').style
      style.top  = this.pos.render.y + 'px'
      style.left = this.pos.render.x + 'px'
    },

    close () {
      // FIXME: called twice when closing programmatically (through revealTopic())
      // console.log('close')
      this.$store.dispatch('closeSearchWidget')
    },

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
      const topicModel = topicType.newTopicModel(this.searchTerm)
      // console.log('createTopic', topicModel)
      dm5.restClient.createTopic(topicModel).then(topic => {
        console.log(topic)
        this._revealTopic(topic)
      }).catch(error => {
        console.error(error)
      })
    },

    createExtra () {
      this.menuItem.create(this.searchTerm)
    },

    _revealTopic (topic) {
      // TODO: decoupling. Don't dispatch into host application.
      this.$store.dispatch('revealTopic', {
        topic,
        pos: this.pos.model,
        select: !this.noSelect
      })
      if (this.topicHandler) {
        this.topicHandler(topic)
      }
    }
  },

  watch: {
    searchTerm () {
      if (this.searchTerm) {
        dm5.restClient.searchTopics(this.searchQuery).then(topics => {
          this.resultTopics = topics
        })
      } else {
        this.resultTopics = []
      }
    }
  },

  components: {
    'dm5-topic-list': require('dm5-topic-list').default
  }
}
</script>

<style>
.el-dialog.search-widget {
  margin: 0 !important;    /* reset el-dialog margin */
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

.search-widget .dm5-topic-list {
  margin-top: 1.5em;
}
</style>
