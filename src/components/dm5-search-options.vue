<template>
  <div class="dm5-search-options">
    <el-input v-model="value.input" ref="input" @keyup.native.enter="$emit('create')"></el-input>
    <div id="type-select">
      <el-checkbox v-model="value.check1">Search only selected type</el-checkbox>
      <!-- "Search" menu -->
      <el-select v-model="value.type" value-key="uri" :disabled="!value.check1">
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
    <el-checkbox v-model="value.check2" :disabled="!value.check1">Search child topics</el-checkbox>
    <dm5-type-dialog :visible="typeDialogVisible" :checkedTopicTypes="types" @close="closeTypeDialog"
      @checked="checked" @unchecked="unchecked">
    </dm5-type-dialog>
  </div>
</template>

<script>
export default {

  props: {
    value: Object,
    types: Array      // types listed in menu (array of dm5.TopicType/dm5.AssocType)
  },

  data () {
    return {
      typeDialogVisible: false,
      prevType: undefined    // previously selected type in menu (dm5.TopicType/dm5.AssocType)
    }
  },

  watch: {
    "value.type": function () {
      if (this.value.type === "customize") {
        this.value.type = this.prevType             // Note: retriggers this watcher
        this.openTypeDialog()
      } else {
        if (this.value.type !== this.prevType) {    // ignore if retriggered through "customize"
          this.prevType = this.value.type
          this.$emit('search')
        }
      }
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
      if (type.uri === (this.value.type && this.value.type.uri)) {
        this.value.type = undefined
      }
    }
  },

  components: {
    'dm5-type-dialog': require('./dm5-type-dialog').default
  }
}
</script>

<style>
</style>
