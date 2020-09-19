<template>
  <el-dialog :custom-class="customClass" :visible="visible_" :width="width" @opened="opened" @close="close">
    <div class="search">
      <div class="heading label">Search</div>
      <dm5-search-options class="topic-options" :value="topicOptions" :types="searchTopicTypes" ref="topicOptions"
        @search="search" @create="clickCreate">
      </dm5-search-options>
      <el-collapse>
        <el-collapse-item title="Association">
          <dm5-search-options class="assoc-options" :value="assocOptions" :types="[]"></dm5-search-options>
        </el-collapse-item>
      </el-collapse>
      <dm5-topic-list :topics="resultTopics" empty-text="No Match" v-if="input" :marker-ids="markerIds_"
        @topic-click="topicClick" @icon-click="iconClick">
      </dm5-topic-list>
    </div>
    <div class="create" v-if="createEnabled_">
      <div class="heading label">Create</div>
      <div class="field-label">Topic Type</div>
      <!-- "Create" menu -->
      <el-select v-model="menuItem" value-key="uri" :disabled="!input">
        <el-option-group>
          <el-option v-for="type in createTopicTypes_" :label="type.value" :value="type" :key="type.uri">
            <span class="fa icon">{{type.icon}}</span><span>{{type.value}}</span>
          </el-option>
        </el-option-group>
        <el-option-group label="View">
          <el-option v-for="maptype in topicmapTypes" :label="maptype.name" :value="maptype" :key="maptype.uri">
            <span class="fa icon">{{type(maptype).icon}}</span><span>{{maptype.name}}</span>
          </el-option>
        </el-option-group>
        <el-option-group label="DMX">
          <el-option v-for="item in extraMenuItems_" :label="type(item).value" :value="item" :key="item.uri"
              :disabled="disabled(item)">
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
import dm5 from 'dmx-api'

export default {

  created () {
    // console.log('dm5-search-widget created', this.visible_, this.createTopicTypes)
  },

  mounted () {
    // console.log('dm5-search-widget mounted', this.visible_, this.createTopicTypes)
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
    createTopicTypes: Array,  // types listed in create menu (array of dm5.TopicType)
    topicmapTypes: Array,     // topicmap types listed in create menu
    extraMenuItems: Array
  },

  data () {
    return {
      // dialog
      customClass: `dm5-search-widget ${this.layout}`,
      // search
      topicOptions: {
        input: '',
        check1: false,
        check2: false,
        type: undefined,      // selected type (dm5.TopicType); undefined if no type is selected
      },
      assocOptions: {
        input: '',
        check1: false,
        check2: false,
        type: undefined,      // selected type (dm5.AssocType); undefined if no type is selected
      },
      searchTopicTypes: undefined,      // types listed in search menu (array of dm5.TopicType)
      resultTopics: [],
      // create
      menuItem: undefined,    // Selected item of create menu.
                              // Either a dm5.TopicType or an extra menu item (Object).
                              // Undefined if no item is selected.
      // mirror props
      visible_:          this.visible,
      markerIds_:        this.markerIds,
      createEnabled_:    this.createEnabled,
      createTopicTypes_: this.createTopicTypes,
      extraMenuItems_:   this.extraMenuItems,
      //
      isAdmin: false
    }
  },

  computed: {

    // TODO: assoc filter
    input () {
      return this.topicOptions.input
    },

    // TODO: assoc filter
    check1 () {
      return this.topicOptions.check1
    },

    // TODO: assoc filter
    check2 () {
      return this.topicOptions.check2
    },

    // TODO: assoc filter
    searchTopicType () {
      return this.topicOptions.type
    },

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
      return (this.isTopicmapType || this.isExtraMenuItem) && this.menuItem.optionsComp
    },

    isTopicmapType () {
      return this.menuItem && this.menuItem.renderer
    },

    isExtraMenuItem () {
      return this.menuItem && this.menuItem.create
    }
  },

  watch: {

    // needed when instantiated via template
    visible ()          {this.visible_          = this.visible},
    createEnabled ()    {this.createEnabled_    = this.createEnabled},
    createTopicTypes () {this.createTopicTypes_ = this.createTopicTypes},
    // FIXME: add watchers for the remaining props?

    query ()        {this.search()},
    topicTypeUri () {this.search()},
    check2 ()       {this.search()},

    createTopicTypes_ () {
      // Set the initial "search" types the same as the "create" types.
      // Note: at component instantiation the "create" types are not known yet.
      if (!this.searchTopicTypes) {
        this.searchTopicTypes = this.createTopicTypes_
      }
    }
  },

  methods: {

    opened () {
      this.$refs.topicOptions.focus()
      this.search()
      // update isAdmin state
      dm5.isAdmin().then(isAdmin => {
        this.isAdmin = isAdmin
        // create menu: remove selection if item is disabled meanwhile
        if (this.menuItem && this.disabled(this.menuItem)) {
          this.menuItem = undefined
        }
      })
    },

    search: dm5.utils.debounce(function () {
      // compare to dm5-text-field.vue (module dm5-object-renderer)
      console.log('search', this.query, this.topicTypeUri, this.check2)
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

    topicClick (topic) {
      this.$emit('topic-click', topic)
      this.close()
    },

    iconClick (topic) {
      this.$emit('icon-click', topic)
      // leave dialog open # TODO?
    },

    type (extraItem) {
      return dm5.typeCache.getTopicType(extraItem.uri)
    },

    disabled (extraItem) {
      // TODO: add extension point. Move logic to AccessControl module.
      return extraItem.uri === 'dmx.accesscontrol.user_account' && !this.isAdmin
    },

    create () {
      const optionsComp = this.$refs.optionsComp
      const optionsData = optionsComp && optionsComp.$data
      if (this.isTopicmapType) {
        this.$emit('topicmap-create', {
          name:            this.trimmedInput,
          topicmapTypeUri: this.menuItem.uri,
          viewProps:       optionsData
        })
      } else if (this.isExtraMenuItem) {
        this.$emit('extra-create', {
          extraItem: this.menuItem,
          value:     this.trimmedInput,
          optionsData
        })
      } else {
        this.$emit('topic-create', {
          topicType: this.menuItem,
          value:     this.trimmedInput
        })
      }
      this.close()
    },

    clickCreate () {
      const button = this.$refs.create
      button && button.$el.click()
    },

    close () {
      // console.log('close')
      // FIXME: called twice when closing programmatically (topicClick(), create())
      this.$emit('close')
    }
  },

  components: {
    'dm5-topic-list':     require('dmx-topic-list').default,
    'dm5-search-options': require('./dm5-search-options').default
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

.dm5-search-widget .search .topic-options {
  margin-bottom: 1em;
}

.dm5-search-widget .search .assoc-options {
  margin-left: 1.5em;
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

/* Element UI */

.dm5-search-widget .search .el-collapse-item__header {
  color: var(--label-color);            /* was #303133 */
  font-size: var(--label-font-size);    /* was 13px */
  font-weight: unset;                   /* was 500 */
  line-height: 24px;                    /* was 48px */
  height: unset;                        /* was 48px */
}

.dm5-search-widget .search .el-collapse-item__content {
  padding-bottom: 4px;                  /* was 25px */
  font-size: unset;                     /* was 13px */
  line-height: unset;                   /* was 1.769230769230769 */
}

</style>
