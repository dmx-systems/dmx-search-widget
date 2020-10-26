<template>
  <el-dialog :title="title" :custom-class="customClass" :visible="visible_" :width="width" :modal="false" v-draggable
      @opened="opened" @close="close">
    <div class="search">
      <div class="heading label" v-if="createEnabled_">Search</div>
      <el-collapse v-model="expandedFilters">
        <el-collapse-item title="Topic Filter" :name="0">
          <dm5-search-options :model="topicFilter" :types="searchTopicTypes" ref="topicFilter"
            @search="search" @create="clickCreateButton">
          </dm5-search-options>
        </el-collapse-item>
        <el-collapse-item title="Association Filter">
          <dm5-search-options :model="assocFilter" :types="searchAssocTypes_" ref="assocFilter"
            @search="search" @create="clickCreateButton">
          </dm5-search-options>
        </el-collapse-item>
      </el-collapse>
      <dm5-topic-list :topics="resultTopics" topics-label="Result" empty-text="No Result" v-if="resultVisible"
        :marker-ids="markerIds_" @topic-click="topicClick" @icon-click="iconClick" @assoc-click="assocClick">
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
    searchAssocTypes: Array,  // assoc types listed in search menu (array of dm5.AssocType)
    markerIds: Array,         // Optional: IDs of topics to render as "marked" in result list
    // create
    createEnabled: Boolean,   // whether the create-panel is rendered
    createTopicTypes: Array,  // topic types listed in create menu (array of dm5.TopicType)
    topicmapTypes: Array,     // topicmap types listed in create menu
    extraMenuItems: Array
  },

  data () {
    return {
      // dialog
      customClass: `dm5-search-widget ${this.layout}`,
      // search
      expandedFilters: [0],
      topicFilter: {
        label: 'Restrict by topic type',
        typesFunc: dm5.typeCache.getAllTopicTypes,    // evaluated lazily in dm5-type-dialog.vue
        input: '',
        check1: false,
        check2: false,
        type: undefined,      // selected type (dm5.TopicType); undefined if no type is selected
      },
      assocFilter: {
        label: 'Restrict by association type',
        typesFunc: dm5.typeCache.getAllAssocTypes,    // evaluated lazily in dm5-type-dialog.vue
        input: '',
        check1: false,
        check2: false,
        type: undefined,      // selected type (dm5.AssocType); undefined if no type is selected
      },
      searchTopicTypes: undefined,      // topic types listed in search menu (array of dm5.TopicType)
      resultTopics: [],
      resultVisible: false,
      // create
      menuItem: undefined,    // Selected item of create menu.
                              // Either a dm5.TopicType or an extra menu item (Object).
                              // Undefined if no item is selected.
      // mirror props
      visible_:          this.visible,
      searchAssocTypes_: this.searchAssocTypes,
      markerIds_:        this.markerIds,
      createEnabled_:    this.createEnabled,
      createTopicTypes_: this.createTopicTypes,
      extraMenuItems_:   this.extraMenuItems,
      //
      isAdmin: false
    }
  },

  computed: {

    title () {
      return 'Search' + (this.createEnabled_ ? ' / Create' : '')
    },

    input () {
      return this.topicFilter.input
    },

    trimmedInput () {
      return this.input.trim()
    },

    // Topic Filter

    isTopicFilterSet () {
      return this.$refs.topicFilter.isSet
    },

    topicQuery () {
      return this.$refs.topicFilter.query
    },

    topicTypeUri () {
      return this.$refs.topicFilter.typeUri
    },

    topicCheck2 () {
      return this.topicFilter.check2
    },

    // Assoc Filter

    isAssocFilterSet () {
      return this.$refs.assocFilter.isSet
    },

    assocQuery () {
      return this.$refs.assocFilter.query
    },

    assocTypeUri () {
      return this.$refs.assocFilter.typeUri
    },

    assocCheck2 () {
      return this.assocFilter.check2
    },

    // Create

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
      this.$refs.topicFilter.focus()
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
      if (this.isTopicFilterSet || this.isAssocFilterSet) {
        console.log('search',
          this.topicQuery, this.topicTypeUri, this.topicCheck2, this.assocQuery, this.assocTypeUri, this.assocCheck2
        )
        dm5.restClient.query(
          this.topicQuery, this.topicTypeUri, this.topicCheck2, this.assocQuery, this.assocTypeUri, this.assocCheck2
        ).then(result => {
          if (this.isResultUptodate(result)) {
            this.resultTopics = result.topics
            this.resultVisible = true
          }
        }).catch(e => {
          console.warn(`Query '${this.topicQuery}' failed (${e})`)
          this.resultTopics = []
          this.resultVisible = false
        })
      } else {
        this.resultTopics = []
        this.resultVisible = false
      }
    }, 300),

    isResultUptodate (result) {
      if (result.topicQuery          === this.topicQuery &&
          result.topicTypeUri        === this.topicTypeUri &&
          result.searchTopicChildren === this.topicCheck2 &&
          result.assocQuery          === this.assocQuery &&
          result.assocTypeUri        === this.assocTypeUri &&
          result.searchAssocChildren === this.assocCheck2) {
        return true
      }
      console.log("Ignoring " + result.topics.length + " result topics of query\n\"" + result.topicQuery + "\" (" +
        result.topicTypeUri + ", " + result.searchTopicChildren + ") \"" + result.assocQuery + "\" (" +
        result.assocTypeUri + ", " + result.searchAssocChildren + "), current query is\n\"" + this.topicQuery + "\" (" +
        this.topicTypeUri + ", " + this.topicCheck2 + ") \"" + this.assocQuery + "\" (" +
        this.assocTypeUri + ", " + this.assocCheck2 + ")")
    },

    topicClick (topic) {
      this.$emit('topic-click', topic)
      this.close()
    },

    iconClick (topic) {
      this.$emit('icon-click', topic)
      // leave dialog open # TODO?
    },

    assocClick (assoc) {
      this.$emit('assoc-click', assoc)
      this.close()
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

    clickCreateButton () {
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

.dm5-search-widget .search .el-collapse {
  background-color: var(--background-color);
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
  background-color: unset;              /* was #fff */
  font-size: var(--label-font-size);    /* was 13px */
  font-weight: normal;                  /* was 500 */
  line-height: 24px;                    /* was 48px */
  height: 24px;                         /* was 48px */
}

.dm5-search-widget .search .el-collapse-item__wrap {
  background-color: unset;              /* was #fff */
}

.dm5-search-widget .search .el-collapse-item__content {
  padding: 0 12px 24px 12px;            /* was padding-bottom: 25px */
  font-size: unset;                     /* was 13px */
  line-height: unset;                   /* was 1.769230769230769 */
}

</style>
