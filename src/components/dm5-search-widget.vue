<template>
  <el-dialog custom-class="dm5-search-widget" :visible="visible_" :modal="false" :show-close="false" @close="close">
    <el-tabs type="border-card">
      <el-tab-pane label="Search" class="search">
        <el-input v-model="searchTerm"></el-input>
        <dm5-topic-list :topics="resultTopics" empty-text="No Match" v-if="searchTerm" :marker-ids="markerIds_"
          @topic-click="revealTopic">
        </dm5-topic-list>
      </el-tab-pane>
      <el-tab-pane label="Create" class="create" :disabled="!createEnabled_ || !searchTerm">
        <div class="field-label">Topic Type</div>
        <el-select v-model="menuItem" value-key="uri">
          <el-option v-for="type in menuTopicTypes_" :label="type.value" :value="type" :key="type.uri"></el-option>
          <el-option value="-" disabled></el-option>
          <el-option v-for="item in extraMenuItems_" :label="item.label" :value="item" :key="item.uri"></el-option>
        </el-select>
        <span class="value">"{{searchTerm}}"</span>
        <el-button type="primary" plain :disabled="!menuItem" @click="create">Create</el-button>
        <component :is="optionsComp" class="options" ref="optionsComp"></component>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
import dm5 from 'dm5'

export default {

  created () {
    // console.log('dm5-search-widget created', this.visible_)
  },

  props: {
    // dialog
    visible: Boolean,
    pos: Object,
    // search-tab
    markerIds: Array,           // Optional: IDs of topics to render as "marked" in result list
    // create-tab
    createEnabled: Boolean,
    menuTopicTypes: Object,
    extraMenuItems: Array
  },

  data () {
    return {
      searchTerm: '',
      resultTopics: [],
      menuItem: undefined,  // Selected item of create menu.
                            // Either a dm5.TopicType or an extra menu item (Object).
                            // Undefined if no item is selected.
      // mirror props
      visible_:        this.visible,
      pos_:            this.pos,
      markerIds_:      this.markerIds,
      createEnabled_:  this.createEnabled,
      menuTopicTypes_: this.menuTopicTypes,
      extraMenuItems_: this.extraMenuItems
    }
  },

  computed: {

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

  watch: {

    searchTerm () {
      if (this.searchTerm) {
        dm5.restClient.searchTopics(this.searchQuery).then(topics => {
          this.resultTopics = topics
        })
      } else {
        this.resultTopics = []
      }
    },

    pos_ () {
      // console.log('watch pos_', this.pos_)
      this.position()
    }
  },

  methods: {

    revealTopic (topic) {
      this.close()
      this.$emit('topic-reveal', topic)
    },

    create () {
      this.close()
      if (this.isExtraMenuItem) {
        const optionsComp = this.$refs.optionsComp
        this.$emit('extra-create', {
          extraItem: this.menuItem,
          value:     this.searchTerm,
          optionsData: optionsComp && optionsComp.$data
        })
      } else {
        this.$emit('topic-create', {
          topicType: this.menuItem,
          value:     this.searchTerm
        })
      }
    },

    /**
     * Positions the dialog according to "pos_" data.
     *
     * Note: for positioning we can't use data binding in the template. The <el-dialog> element
     * interpolates to the dialog's screen mask. The actual dialog is a child element of it.
     */
    position () {
      var style = this.$el.querySelector('.el-dialog.dm5-search-widget').style
      style.top  = this.pos_.render.y + 'px'
      style.left = this.pos_.render.x + 'px'
    },

    close () {
      // console.log('close')
      // FIXME: called twice when closing programmatically (revealTopic(), create())
      this.$emit('close')
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
  padding: 0 !important;    /* was 20px 20px 10px */
}

.dm5-search-widget .el-dialog__body {
  padding: 0 !important;    /* was 15px due to overrides in App.vue */
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
