<template>
  <el-dialog :title :custom-class :visible :width :modal="false" @opened="opened" @close="close">
    <div class="search">
      <div class="heading label" v-if="createEnabled">Search</div>
      <el-collapse v-model="expandedFilters">
        <el-collapse-item title="Topic Filter" :name="0">
          <dmx-search-options :model="topicFilter" :types="searchTopicTypes" ref="topicFilter"
            @search="search" @create="clickCreateButton">
          </dmx-search-options>
        </el-collapse-item>
        <el-collapse-item title="Association Filter">
          <dmx-search-options :model="assocFilter" :types="searchAssocTypes" ref="assocFilter" @search="search"
            @create="clickCreateButton">
          </dmx-search-options>
        </el-collapse-item>
      </el-collapse>
      <dmx-topic-list :topics="resultTopics" topics-label="Result" empty-text="No Result" v-if="resultVisible"
        :marker-topic-ids :marker-assoc-ids @topic-click="topicClick" @icon-click="iconClick" @assoc-click="assocClick">
      </dmx-topic-list>
    </div>
    <div class="create" v-if="createEnabled">
      <div class="heading label">Create</div>
      <!-- "Create" menu -->
      <el-select v-model="menuItem" value-key="uri" :disabled="menuDisabled" :title="menuTitle">
        <el-option-group label="Topic Type">
          <el-option v-for="type in createTopicTypes" :label="type.value" :value="type" :key="type.uri">
            <span class="fa icon">{{type.icon}}</span><span>{{type.value}}</span>
          </el-option>
        </el-option-group>
        <el-option-group label="Topicmap Type">
          <el-option v-for="maptype in topicmapTypes" :label="maptype.name" :value="maptype" :key="maptype.uri">
            <span class="fa icon">{{type(maptype).icon}}</span><span>{{maptype.name}}</span>
          </el-option>
        </el-option-group>
        <el-option-group label="Meta">
          <el-option v-for="item in extraMenuItems" :label="type(item).value" :value="item" :key="item.uri"
              :disabled="disabled(item)">
            <span class="fa icon">{{type(item).icon}}</span><span>{{type(item).value}}</span>
          </el-option>
        </el-option-group>
      </el-select>
      <!-- "Create" options -->
      <component :is="optionsComp" class="options" ref="optionsComp"></component>
      <!-- "Create" button -->
      <el-button class="create-button" ref="create" type="primary" plain :disabled="buttonDisabled" :title="buttonTitle"
        @click="create">{{buttonLabel}}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import dmx from 'dmx-api'

export default {

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
    searchAssocTypes: Array,  // assoc types listed in search menu (array of dmx.AssocType)
    markerTopicIds: Array,    // Optional: IDs of topics to render as "marked" in result list
    markerAssocIds: Array,    // Optional: IDs of assocs to render as "marked" in result list
    // create
    createEnabled: Boolean,   // whether the create-panel is rendered
    createTopicTypes: Array,  // topic types listed in create menu (array of dmx.TopicType)
    topicmapTypes: Array,     // topicmap types listed in create menu
    extraMenuItems: Array
  },

  data () {
    return {
      // dialog
      customClass: `dmx-search-widget ${this.layout}`,
      // search
      expandedFilters: [0],
      topicFilter: {
        label: 'Restrict by topic type',
        typesFunc: dmx.typeCache.getAllTopicTypes,    // evaluated lazily in dmx-type-dialog.vue
        input: '',
        check1: false,
        check2: false,
        type: undefined       // selected type (dmx.TopicType); undefined if no type is selected
      },
      assocFilter: {
        label: 'Restrict by association type',
        typesFunc: dmx.typeCache.getAllAssocTypes,    // evaluated lazily in dmx-type-dialog.vue
        input: '',
        check1: false,
        check2: false,
        type: undefined       // selected type (dmx.AssocType); undefined if no type is selected
      },
      searchTopicTypes: undefined,      // topic types listed in search menu (array of dmx.TopicType)
      resultTopics: [],       // TODO: rename "resultObjects"
      resultVisible: false,
      // create
      menuItem: undefined,    // Selected item of create menu.
                              // Either a dmx.TopicType, a topicmap type (Object), or an extra menu item (Object).
                              // Undefined if no item is selected.
      //
      isAdmin: false
    }
  },

  computed: {

    title () {
      return 'Search' + (this.createEnabled ? ' / Create' : '')
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
    },

    buttonLabel () {
      let label
      if (this.isTopicmapType) {
        label = this.menuItem.name
      } else if (this.isExtraMenuItem) {
        label = this.type(this.menuItem).value
      } else {
        label = this.menuItem ? this.menuItem.value : ''
      }
      return 'Create' + (label ? ' ' + label : '')
    },

    menuDisabled () {
      return !this.trimmedInput
    },

    menuTitle () {
      if (!this.trimmedInput) {
        return 'Not active because nothing is typed into "Topic Filter" (left side)'
      }
    },

    buttonDisabled () {
      return !this.trimmedInput || !this.menuItem
    },

    buttonTitle () {
      if (!this.trimmedInput) {
        return 'Not active because nothing is typed into "Topic Filter" (left side)'
      } else if (!this.menuItem) {
        return 'Not active because nothing is selected from above menu'
      }
    }
  },

  watch: {
    createTopicTypes () {
      // Set the initial "search" types the same as the "create" types.
      // Note: at component instantiation the "create" types are not known yet.
      if (!this.searchTopicTypes) {
        this.searchTopicTypes = this.createTopicTypes
      }
    }
  },

  methods: {

    opened () {
      this.$refs.topicFilter.focus()
      this.search()
      // update isAdmin state
      dmx.isAdmin().then(isAdmin => {
        this.isAdmin = isAdmin
        // create menu: remove selection if item is disabled meanwhile
        if (this.menuItem && this.disabled(this.menuItem)) {
          this.menuItem = undefined
        }
      })
    },

    search: dmx.utils.debounce(function () {
      // compare to dmx-text-field.vue (module dmx-object-renderer)
      if (this.isTopicFilterSet || this.isAssocFilterSet) {
        dmx.rpc.query(
          this.topicQuery, this.topicTypeUri, this.topicCheck2, this.assocQuery, this.assocTypeUri, this.assocCheck2
        ).then(result => {
          if (this.isResultUptodate(result)) {
            this.resultTopics = result.objects
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
      /* console.log('Ignoring ' + result.topics.length + ' result topics of query\n"' + result.topicQuery + '" (' +
        result.topicTypeUri + ', ' + result.searchTopicChildren + ') "' + result.assocQuery + '" (' +
        result.assocTypeUri + ', ' + result.searchAssocChildren + '), current query is\n"' + this.topicQuery + '" (' +
        this.topicTypeUri + ', ' + this.topicCheck2 + ') "' + this.assocQuery + '" (' +
        this.assocTypeUri + ', ' + this.assocCheck2 + ')') */
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
      return dmx.typeCache.getTopicType(extraItem.uri)
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
    'dmx-topic-list':     require('dmx-topic-list').default,
    'dmx-search-options': require('./dmx-search-options').default
  }
}
</script>

<style>
.dmx-search-widget .el-dialog__body {
  display: flex;
}

.dmx-search-widget.column .el-dialog__body {
  flex-direction: column;
}

.dmx-search-widget .heading {
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5em;
}

.dmx-search-widget .search {
  flex: auto;
}

.dmx-search-widget .search .el-collapse {
  background-color: var(--background-color);
}

.dmx-search-widget .search .dmx-topic-list {
  margin-top: 2em;
}

.dmx-search-widget.row .create {
  margin-left: 3em;
}

.dmx-search-widget.column .create {
  margin-top: 3em;
}

.dmx-search-widget .create .options {
  margin-top: 1.5em;
}

.dmx-search-widget .create .create-button {
  display: block;
  margin-top: 1.5em;
}

/* Element UI */

.dmx-search-widget .search .el-collapse-item__header {
  color: var(--label-color);            /* was #303133 */
  background-color: unset;              /* was #fff */
  font-size: var(--label-font-size);    /* was 13px */
  font-weight: normal;                  /* was 500 */
  line-height: 24px;                    /* was 48px */
  height: 24px;                         /* was 48px */
}

.dmx-search-widget .search .el-collapse-item__wrap {
  background-color: unset;              /* was #fff */
}

.dmx-search-widget .search .el-collapse-item__content {
  padding: 0 12px 24px 12px;            /* was padding-bottom: 25px */
  font-size: unset;                     /* was 13px */
  line-height: unset;                   /* was 1.769230769230769 */
}

</style>
