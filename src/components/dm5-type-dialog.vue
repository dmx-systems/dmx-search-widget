<template>
  <el-dialog custom-class="dm5-type-dialog" :visible="visible" append-to-body @close="close">
    <el-checkbox v-for="type in types" :value="checked(type)" :key="type.uri">
      <span>{{type.value}}</span><span class="fa icon">{{type.icon}}</span>
    </el-checkbox>
  </el-dialog>
</template>

<script>
import dm5 from 'dm5'

export default {

  props: {
    visible: Boolean,
    searchTopicTypes: Array
  },

  computed: {
    types () {
      return dm5.typeCache.getAllTopicTypes()
        .sort((tt1, tt2) => tt1.value.localeCompare(tt2.value))
    }
  },

  methods: {

    checked (type) {
      return this.searchTopicTypes.some(_type => _type.uri === type.uri)
    },

    close () {
      this.$emit('close')
    }
  }
}
</script>

<style>
.dm5-type-dialog .el-checkbox {
  display: block;
}

.dm5-type-dialog .el-checkbox .icon {
  color: var(--color-topic-icon);
  margin-left: var(--icon-spacing);
}
</style>
