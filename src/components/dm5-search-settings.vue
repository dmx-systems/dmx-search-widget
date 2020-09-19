<template>
  <div class="dm5-search-settings">
    <el-input v-model="value.input" ref="input" @keyup.native.enter="clickCreate"></el-input>
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
  </div>
</template>

<script>
export default {

  props: {
    value: Object,
    types: Array      // array of dm5.TopicType/dm5.AssocType
  },

  methods: {
    focus () {
      this.$refs.input.focus()
    }
  }
}
</script>

<style>
  
</style>
