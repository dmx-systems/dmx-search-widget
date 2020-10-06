<template>
  <div class="dm5-search-options">
    <el-input v-model="model.input" ref="input" @keyup.native.enter="$emit('create')"></el-input>
    <div class="type-select">
      <el-checkbox v-model="model.check1">{{model.label}}</el-checkbox>
      <!-- "Search" menu -->
      <el-select v-model="model.type" value-key="uri" :disabled="!model.check1">
        <el-option-group>
          <el-option v-for="type in types" :label="type.value" :value="type" :key="type.uri">
            <span class="fa icon">{{type.icon}}</span><span>{{type.value}}</span>
          </el-option>
        </el-option-group>
        <el-option-group>
          <el-option label="Customize Type List…" value="customize"></el-option>
        </el-option-group>
      </el-select>
    </div>
    <el-checkbox v-model="model.check2" :disabled="check2Disabled">Widen search to child topics</el-checkbox>
    <dm5-type-dialog :visible="typeDialogVisible" :types-func="model.typesFunc" :checked-types="types"
      @close="closeTypeDialog" @checked="checked" @unchecked="unchecked">
    </dm5-type-dialog>
  </div>
</template>

<script>
import dm5 from 'dmx-api'

export default {

  props: {
    model: Object,
    types: Array      // types listed in menu (array of dm5.TopicType/dm5.AssocType)
  },

  data () {
    return {
      typeDialogVisible: false,
      prevType: undefined    // previously selected type in menu (dm5.TopicType/dm5.AssocType)
    }
  },

  computed: {

    query () {
      return dm5.utils.fulltextQuery(this.model.input)
    },

    typeUri () {
      // Note: if checkbox is unchecked undefined must be passed to REST client (instead of false)
      return this.model.check1 && this.model.type && this.model.type.uri || undefined
    },

    isSet () {
      return this.query || this.typeUri
    },

    check2Disabled () {
      return !this.query || !this.typeUri
    }
  },

  watch: {

    "model.type": function () {
      if (this.model.type === "customize") {
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

    "model.check2": function () {
      this.$emit('search')
    }
  },

  methods: {

    focus () {
      this.$refs.input.focus()
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
      this.types.sort((tt1, tt2) => tt1.value.localeCompare(tt2.value))
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
    'dm5-type-dialog': require('./dm5-type-dialog').default
  }
}
</script>

<style>
.dm5-search-options .type-select {
  margin-top: 6px;
  margin-bottom: 2px;
}

.dm5-search-options .type-select .el-select {
  margin-left: 6px;
}

.dm5-search-options .el-checkbox__label {
  font-size: var(--label-font-size);
  color:     var(--label-color);
}
</style>
