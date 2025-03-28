<template>
  <div class="dmx-search-options">
    <el-input v-model="model.input" ref="input" @keyup.native.enter="$emit('create')"></el-input>
    <div class="type-select">
      <el-checkbox v-model="model.check1">{{model.label}}</el-checkbox>
      <!-- "Search" menu -->
      <el-select v-model="model.type" value-key="uri" :disabled="!model.check1">
        <el-option-group>
          <el-option v-for="type in sortedTypes" :label="type.value" :value="type" :key="type.uri">
            <span class="fa icon">{{type.icon}}</span><span>{{type.value}}</span>
          </el-option>
        </el-option-group>
        <el-option-group>
          <el-option label="Customize Type List…" value="customize"></el-option>
        </el-option-group>
      </el-select>
    </div>
    <el-checkbox v-model="model.check2" :disabled="check2Disabled">Widen search to child topics</el-checkbox>
    <dmx-type-dialog :visible="typeDialogVisible" :types-func="model.typesFunc" :checked-types="types"
      @close="closeTypeDialog" @checked="checked" @unchecked="unchecked">
    </dmx-type-dialog>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  props: {
    model: Object,
    types: Array              // types listed in menu (array of dmx.TopicType/dmx.AssocType)
  },

  data () {
    return {
      typeDialogVisible: false,
      prevType: undefined     // previously selected type in menu (dmx.TopicType/dmx.AssocType)
    }
  },

  computed: {

    query () {
      return dmx.utils.fulltextQuery(this.model.input)
    },

    sortedTypes () {
      return this.types.sort((t1, t2) => t1.value.localeCompare(t2.value))
    },

    typeUri () {
      // Note: if checkbox is unchecked undefined must be passed to REST client (instead of false)
      return this.model.check1 && this.model.type && this.model.type.uri || undefined
      /* eslint no-mixed-operators: "off" */
    },

    isQuerySet () {
      return this.query && this.query !== '*'
    },

    isSet () {
      return this.isQuerySet || this.typeUri
    },

    check2Disabled () {
      return !this.isQuerySet || !this.typeUri
    }
  },

  watch: {

    'model.type': function () {
      if (this.model.type === 'customize') {
        this.model.type = this.prevType             // Note: retriggers this watcher
        this.openTypeDialog()
      } else {
        this.prevType = this.model.type
      }
    },

    query () {
      this.$emit('search')
    },

    typeUri () {
      this.$emit('search')
    },

    'model.check2': function () {
      this.$emit('search')
    }
  },

  methods: {

    focus () {
      this.$refs.input.select()
    },

    // Type Dialog

    openTypeDialog () {
      this.typeDialogVisible = true
    },

    closeTypeDialog () {
      this.typeDialogVisible = false
    },

    checked (type) {
      // console.log('checked', type)
      this.types.push(type)
    },

    unchecked (type) {
      // console.log('unchecked', type)
      const i = this.types.findIndex(_type => _type.uri === type.uri)
      this.types.splice(i, 1)
      // reset selection when selected type is no longer in type list
      if (type.uri === (this.model.type && this.model.type.uri)) {
        this.model.type = undefined
      }
    }
  },

  components: {
    'dmx-type-dialog': require('./dmx-type-dialog').default
  }
}
</script>

<style>
.dmx-search-options .type-select {
  margin-top: 6px;
  margin-bottom: 2px;
}

.dmx-search-options .type-select .el-select {
  max-width: 200px;
  margin-left: 6px;
}

.dmx-search-options .el-checkbox__label {
  font-size: var(--label-font-size);
  color:     var(--label-color);
}
</style>
