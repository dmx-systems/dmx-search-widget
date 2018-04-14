<template>
  <el-dialog custom-class="dm5-search-widget" :visible="visible" :modal="false" :show-close="false" @open="open"
      @close="close">
    <el-tabs type="border-card">
      <el-tab-pane label="Search" class="search">
        <el-input v-model="searchTerm"></el-input>
        <dm5-topic-list :topics="resultTopics" empty-text="No Match" v-if="searchTerm" @topic-click="revealTopic">
        </dm5-topic-list>
      </el-tab-pane>
      <el-tab-pane label="Create" class="create" :disabled="!searchTerm">
        <div class="field-label">Topic Type</div>
        <el-select v-model="menuItem" value-key="uri">
          <el-option v-for="type in menuTopicTypes" :label="type.value" :value="type" :key="type.uri"></el-option>
          <el-option value="-" disabled></el-option>
          <el-option v-for="item in extraMenuItems" :label="item.label" :value="item" :key="item.uri"></el-option>
        </el-select>
        <span class="value">"{{searchTerm}}"</span>
        <el-button type="primary" plain :disabled="!menuItem" @click="create">Create</el-button>
        <component :is="optionsComp" class="options" ref="optionsComp"></component>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
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
      menuItem: undefined   // Selected item of create menu.
                            // Either a dm5.TopicType or an extra menu item (Object).
                            // Undefined if no item is selected.
    }
  },

  computed: {

    ...mapState({
      visible:        state => state.searchWidget.visible,
      pos:            state => state.searchWidget.pos,
      extraMenuItems: state => state.searchWidget.extraMenuItems,
      noSelect:       state => state.searchWidget.noSelect,
      topicHandler:   state => state.searchWidget.topicHandler
    }),

    searchQuery () {
      return this.searchTerm + '*'    // TODO
    },

    optionsComp () {
      return this.isExtraMenuItem && this.menuItem.optionsComp
    },

    isExtraMenuItem () {
      return this.menuItem && this.menuItem.constructor.name === 'Object'
    }
  },

  methods: {

    open () {
      // console.log('open')
      var style = this.$el.querySelector('.el-dialog.dm5-search-widget').style
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

    create () {
      this.close()
      if (this.isExtraMenuItem) {
        this.createExtra()
      } else {
        this.createTopic()
      }
    },

    createTopic () {
      const topicType = this.menuItem
      const topicModel = topicType.newTopicModel(this.searchTerm)
      // console.log('createTopic', topicModel)
      dm5.restClient.createTopic(topicModel).then(topic => {
        console.log(topic)
        this._revealTopic(topic)
      })
    },

    createExtra () {
      const optionsComp = this.$refs.optionsComp
      this.menuItem.create(this.searchTerm, optionsComp && optionsComp.$data)
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
.dm5-search-widget {
  margin: 0 !important;     /* reset el-dialog margin for manual dialog positioning */
}

.dm5-search-widget .el-dialog__header {
  padding: 0;               /* was 20px 20px 10px */
}

.dm5-search-widget .el-dialog__body {
  padding: 0;               /* was 15px due to overrides in App.vue */
}

.dm5-search-widget .search .dm5-topic-list {
  margin-top: 1.5em;
}

.dm5-search-widget .create .value {
  margin-left: 0.5em;
  margin-right: 0.5em;
}

.dm5-search-widget .create .options {
  margin-top: 1.5em;
}
</style>
