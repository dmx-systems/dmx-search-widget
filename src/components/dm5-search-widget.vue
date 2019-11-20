<template>
  <el-dialog :custom-class="customClass" :visible="visible_" :width="width" @opened="opened" @close="close">
    <div class="search">
      <div class="heading label">Search</div>
      <el-input v-model="input" ref="input" @keyup.native.enter="clickCreate"></el-input>
      <div id="type-select">
        <el-checkbox v-model="check1">Search only selected type</el-checkbox>
        <!-- "Search" menu -->
        <el-select v-model="searchTopicType" value-key="uri" :disabled="!check1">
          <el-option-group>
            <el-option v-for="type in searchTopicTypes" :label="type.value" :value="type" :key="type.uri">
              <span class="fa icon">{{type.icon}}</span><span>{{type.value}}</span>
            </el-option>
          </el-option-group>
          <el-option-group>
            <el-option label="Customize Type List…" value="customize"></el-option>
          </el-option-group>
        </el-select>
      </div>
      <el-checkbox v-model="check2" :disabled="!check1">Search child topics</el-checkbox>
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
    <dm5-type-dialog :visible="typeDialogVisible" :checkedTopicTypes="searchTopicTypes" @close="closeTypeDialog"
      @checked="checked" @unchecked="unchecked">
    </dm5-type-dialog>
  </el-dialog>
</template>

<script>
import dm5 from 'dm5'

export default {

  created () {
    // console.log('dm5-search-widget created', this.visible_, this.menuTopicTypes)
  },

  mounted () {
    // console.log('dm5-search-widget mounted', this.visible_, this.menuTopicTypes)
  },

  props: {
    // dialog
    visible: Boolean,
    width: {type: String, default: '66%'},
    layout: {                 // Optional: 'row' (default) or 'column'.
      type: String,           // If 'column' the create panel is rendered *below* the search panel.
      default: 'row',
      validator: layout => ['row', 'column'].includes(layout)
    },
    // search
    markerIds: Array,         // Optional: IDs of topics to render as "marked" in result list
    // create
    createEnabled: Boolean,   // whether the create-panel is rendered
    menuTopicTypes: Array,    // types listed in create menu (array of dm5.TopicType) // TODO: rename "createTopicTypes"
    extraMenuItems: Array
  },

  data () {
    return {
      // dialog
      customClass: `dm5-search-widget ${this.layout}`,
      // search
      input: '',
      check1: false,
      check2: false,
      searchTopicTypes: undefined,      // types listed in search menu (array of dm5.TopicType)
      searchTopicType: undefined,       // selected type in search menu (dm5.TopicType)
      prevSearchTopicType: undefined,   // previously selected type in search menu (dm5.TopicType)
      typeDialogVisible: false,
      resultTopics: [],
      // create
      menuItem: undefined,    // Selected item of create menu.
                              // Either a dm5.TopicType or an extra menu item (Object).
                              // Undefined if no item is selected.
      // mirror props
      visible_:        this.visible,
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

    topicTypeUri () {
      // Note: if checkbox is unchecked undefined must be passed to REST client (instead of false)
      return this.check1 && this.searchTopicType && this.searchTopicType.uri || undefined
    },

    query () {
      return dm5.utils.fulltextQuery(this.input)
    },

    optionsComp () {
      return this.isExtraMenuItem && this.menuItem.optionsComp
    },

    isExtraMenuItem () {
      return this.menuItem && this.menuItem.constructor.name === 'Object'
    }
  },

  watch: {

    // needed when instantiated via template
    visible ()        {this.visible_        = this.visible},
    createEnabled ()  {this.createEnabled_  = this.createEnabled},
    menuTopicTypes () {this.menuTopicTypes_ = this.menuTopicTypes},
    // FIXME: add watchers for the remaining props?

    input ()  {this.search()},
    check1 () {this.search()},
    check2 () {this.search()},

    menuTopicTypes_ () {
      // Set the initial "search" types the same as the "create" types.
      // Note: at component instantiation the "create" types are not known yet.
      if (!this.searchTopicTypes) {
        this.searchTopicTypes = this.menuTopicTypes_
      }
    },

    searchTopicType () {
      if (this.searchTopicType === "customize") {
        this.searchTopicType = this.prevSearchTopicType             // Note: retriggers this watcher
        this.openTypeDialog()
      } else {
        if (this.searchTopicType !== this.prevSearchTopicType) {    // ignore if retriggered through "customize"
          this.prevSearchTopicType = this.searchTopicType
          this.search()
        }
      }
    }
  },

  methods: {

    opened () {
      this.$refs.input.select()
      this.search()
    },

    openTypeDialog () {
      this.typeDialogVisible = true
    },

    closeTypeDialog () {
      this.typeDialogVisible = false
    },

    checked (type) {
      // console.log('checked', type)
      this.searchTopicTypes.push(type)
      this.searchTopicTypes.sort((tt1, tt2) => tt1.value.localeCompare(tt2.value))
    },

    unchecked (type) {
      // console.log('unchecked', type)
      const i = this.searchTopicTypes.findIndex(_type => _type.uri === type.uri)
      this.searchTopicTypes.splice(i, 1)
      // reset selection when selected type is no longer in type list
      if (type.uri === this.topicTypeUri) {
        this.searchTopicType = undefined
      }
    },

    search: dm5.utils.debounce(function () {
      // compare to dm5-text-field.vue (module dm5-object-renderer)
      // console.log('search', this.query, this.topicTypeUri, this.check2)
      if (this.query) {
        dm5.restClient.queryTopicsFulltext(this.query, this.topicTypeUri, this.check2).then(result => {
          if (this.isResultUptodate(result)) {
            this.resultTopics = result.topics
          }
        }).catch(e => {
          console.warn(`Query "${this.query}" failed (${e})`)
          this.resultTopics = []
        })
      } else {
        this.resultTopics = []
      }
    }, 300),

    isResultUptodate (result) {
      if (result.query === this.query &&
          result.topicTypeUri === this.topicTypeUri &&
          result.searchChildTopics === this.check2) {
        return true
      }
      console.log("Ignoring " + result.topics.length + " result topics of query \"" + result.query + "\" (" +
        result.topicTypeUri + ", " + result.searchChildTopics + "), current query is \"" + this.query + "\" (" +
        this.topicTypeUri + ", " + this.check2 + ")")
    },

    revealTopic (topic) {
      this.close()
      this.$emit('topic-reveal', topic)
    },

    type (extraItem) {
      return dm5.typeCache.getTopicType(extraItem.uri)
    },

    create () {
      this.close()
      if (this.isExtraMenuItem) {
        const optionsComp = this.$refs.optionsComp
        this.$emit('extra-create', {
          extraItem: this.menuItem,
          value:     this.trimmedInput,
          optionsData: optionsComp && optionsComp.$data
        })
      } else {
        this.$emit('topic-create', {
          topicType: this.menuItem,
          value:     this.trimmedInput
        })
      }
    },

    clickCreate () {
      const button = this.$refs.create
      button && button.$el.click()
    },

    close () {
      // console.log('close')
      // FIXME: called twice when closing programmatically (revealTopic(), create())
      this.$emit('close')
    }
  },

  components: {
    'dm5-topic-list':  require('dm5-topic-list').default,
    'dm5-type-dialog': require('./dm5-type-dialog').default
  }
}
</script>

<style>
.dm5-search-widget .el-dialog__body {
  display: flex;
}

.dm5-search-widget.column .el-dialog__body {
  flex-direction: column;
}

.dm5-search-widget .heading {
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5em;
}

.dm5-search-widget .search {
  flex: auto;
}

.dm5-search-widget .search #type-select {
  margin-top: 0.8em;
  margin-bottom: 0.2em;
}

.dm5-search-widget .search #type-select .el-select {
  margin-left: 0.4em;
}

.dm5-search-widget .search .el-checkbox__label {
  font-size: var(--label-font-size);
  color:     var(--label-color);
}

.dm5-search-widget .search .dm5-topic-list {
  margin-top: 2em;
}

.dm5-search-widget.row .create {
  margin-left: 3em;
}

.dm5-search-widget.column .create {
  margin-top: 3em;
}

.dm5-search-widget .create .options {
  margin-top: 1.5em;
}

.dm5-search-widget .create .create-button {
  display: block;
  margin-top: 1.5em;
}
</style>
