<template>
  <el-dialog custom-class="dm5-search-widget" :visible="visible_" :modal="false" :show-close="false" @close="close">
    <div class="search">
      <div class="heading label">Search</div>
      <el-input v-model="searchTerm" ref="input" @keyup.native.enter="clickCreate"></el-input>
      <dm5-topic-list :topics="resultTopics" empty-text="No Match" v-if="searchTerm" :marker-ids="markerIds_"
        @topic-click="revealTopic">
      </dm5-topic-list>
    </div>
    <div class="create" v-if="createEnabled_">
      <div class="heading label">Create</div>
      <div class="field-label">Topic Type</div>
      <!-- "Create" menu -->
      <el-select v-model="menuItem" value-key="uri" :disabled="!searchTerm">
        <el-option-group>
          <el-option v-for="type in menuTopicTypes_" :label="type.value" :value="type" :key="type.uri">
            <span class="fa icon">{{type.icon}}</span><span>{{type.value}}</span>
          </el-option>
        </el-option-group>
        <el-option-group label="DMX">
          <el-option v-for="item in extraMenuItems_" :label="type(item).value" :value="item" :key="item.uri">
            <span class="fa icon">{{type(item).icon}}</span><span>{{type(item).value}}</span>
          </el-option>
        </el-option-group>
      </el-select>
      <!-- "Create" options -->
      <component :is="optionsComp" class="options" ref="optionsComp"></component>
      <!-- "Create" button -->
      <el-button class="create-button" ref="create" type="primary" plain :disabled="!searchTerm || !menuItem"
        @click="create">Create
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import dm5 from 'dm5'

export default {

  created () {
    // console.log('dm5-search-widget created', this.visible_)
  },

  mounted () {
    // console.log('dm5-search-widget mounted', this.visible_)
  },

  props: {
    // dialog
    visible: Boolean,
    pos: Object,
    // search panel
    markerIds: Array,         // Optional: IDs of topics to render as "marked" in result list
    // create panel
    createEnabled: Boolean,
    menuTopicTypes: Array,
    extraMenuItems: Array
  },

  data () {
    return {
      searchTerm: '',
      resultTopics: [],
      menuItem: undefined,    // Selected item of create menu.
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
      this.search()
    },

    visible_ () {
      // console.log('watch visible_', this.visible_)
      if (this.visible_) {
        this.$nextTick(() => this.$refs.input.select())
        this.search()
      }
    },

    pos_ () {
      // console.log('watch pos_', this.pos_)
      this.position()
    }
  },

  methods: {

    search: dm5.utils.debounce(function () {
      // console.log('search', this.searchTerm)
      if (this.searchTerm) {
        dm5.restClient.searchTopics(this.searchQuery).then(topics => {
          this.resultTopics = topics
        })
      } else {
        this.resultTopics = []
      }
    }, 300),

    revealTopic (topic) {
      this.close()
      this.$emit('topic-reveal', topic)     // TODO: include "pos" in arg?
    },

    type (extraItem) {
      return dm5.typeCache.getTopicType(extraItem.uri)
    },

    create () {
      this.close()
      if (this.isExtraMenuItem) {
        const optionsComp = this.$refs.optionsComp
        this.$emit('extra-create', {        // TODO: include "pos" in arg?
          extraItem: this.menuItem,
          value:     this.searchTerm,
          optionsData: optionsComp && optionsComp.$data
        })
      } else {
        this.$emit('topic-create', {        // TODO: include "pos" in arg?
          topicType: this.menuItem,
          value:     this.searchTerm
        })
      }
    },

    clickCreate () {
      const button = this.$refs.create
      button && button.$el.click()
    },

    /**
     * Syncs the dialog position with the "pos_" state.
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

.dm5-search-widget .el-dialog__body {
  display: flex;
}

.dm5-search-widget .heading {
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5em;
}

.dm5-search-widget .search {
  flex-grow: 1;
}

.dm5-search-widget .search .dm5-topic-list {
  margin-top: 1.5em;
}

.dm5-search-widget .create {
  margin-left: 3em;
}

.dm5-search-widget .create .options {
  margin-top: 1.5em;
}

.dm5-search-widget .create .create-button {
  display: block;
  margin-top: 1.5em;
}
</style>
