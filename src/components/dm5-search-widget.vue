<template>
  <el-dialog custom-class="dm5-search-widget" :visible="visible_" @open="open" @close="close">
    <div class="search">
      <div class="heading label">Search</div>
      <div id="settings">
        <div>
          <el-input v-model="input" ref="input" @keyup.native.enter="clickCreate"></el-input>
          <el-checkbox v-model="check1">Search selected types only</el-checkbox>
          <el-checkbox v-model="check2" :style="advancedStyle">Search in child topics as well</el-checkbox>
        </div>
        <div :style="advancedStyle">
          <ul>
            <li>Topic Type 1</li>
            <li>Topic Type 2</li>
            <li>Topic Type 3</li>
          </ul>
        </div>
      </div>
      <dm5-topic-list :topics="resultTopics" empty-text="No Match" v-if="input" :marker-ids="markerIds_"
        @topic-click="revealTopic">
      </dm5-topic-list>
    </div>
    <div class="create" v-if="createEnabled_">
      <div class="heading label">Create</div>
      <div class="field-label">Topic Type</div>
      <!-- "Create" menu -->
      <el-select v-model="menuItem" value-key="uri" :disabled="!input">
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
      <el-button class="create-button" ref="create" type="primary" plain :disabled="!input || !menuItem"
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
      input: '',
      check1: false,
      check2: false,
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

    trimmedInput () {
      return this.input.trim()
    },

    query () {
      return dm5.utils.fulltextQuery(this.input)
    },

    advancedStyle () {
      return {
        display: this.check1 ? 'initial' : 'none'
      }
    },

    optionsComp () {
      return this.isExtraMenuItem && this.menuItem.optionsComp
    },

    isExtraMenuItem () {
      return this.menuItem && this.menuItem.constructor.name === 'Object'
    }
  },

  watch: {

    input () {
      this.search()
    },

    pos_ () {
      this.position()
    }
  },

  methods: {

    open () {
      this.$nextTick(() => this.$refs.input.select())
      this.search()
    },

    search: dm5.utils.debounce(function () {
      // compare to dm5-text-field.vue (module dm5-object-renderer)
      console.log('query', this.query)
      if (this.query) {
        dm5.restClient.queryTopicsFulltext(this.query).then(result => {
          if (result.query === this.query) {
            this.resultTopics = result.topics
          } else {
            console.log(`Ignoring ${result.topics.length} result topics of query "${result.query}"` +
              ` (current query is "${this.query}")`)
          }
        }).catch(e => {
          console.warn(`Query "${this.query}" failed`)
          this.resultTopics = []
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
          value:     this.trimmedInput,
          optionsData: optionsComp && optionsComp.$data
        })
      } else {
        this.$emit('topic-create', {        // TODO: include "pos" in arg?
          topicType: this.menuItem,
          value:     this.trimmedInput
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
  flex: auto;
}

.dm5-search-widget .search #settings {
  display: flex;
}

.dm5-search-widget .search #settings > div {
  flex: auto;
}

.dm5-search-widget .search #settings > div:nth-of-type(2) {
  border: 1px solid var(--border-color);
  margin-left: 1em;
}

.dm5-search-widget .search #settings .el-checkbox {
  display: block;
}

.dm5-search-widget .search #settings .el-checkbox:nth-of-type(1) {
  margin-top: 0.8em;
}

.dm5-search-widget .search #settings .el-checkbox:nth-of-type(2) {
  margin-left: 1.6em;
}

.dm5-search-widget .search #settings .el-checkbox__label {
  font-size: var(--label-font-size);
  color:     var(--label-color);
}

.dm5-search-widget .search #settings ul {
  list-style-type: none;
  line-height: 1.5;
  margin: 0;
  padding: 0;
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
