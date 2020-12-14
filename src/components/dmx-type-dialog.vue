<template>
  <el-dialog custom-class="dmx-type-dialog" :visible="visible" title="Customize Type List" width="40%" append-to-body
      :modal="false" v-draggable @close="close">
    <el-checkbox v-for="type in types" :value="checked(type)" :key="type.uri" @input="input(type, $event)">
      <span>{{type.value}}</span><span class="fa icon">{{type.icon}}</span>
    </el-checkbox>
  </el-dialog>
</template>

<script>
export default {

  props: {
    visible: Boolean,
    typesFunc: Function,
    checkedTypes: Array
  },

  computed: {
    types () {
      return this.typesFunc().sort((tt1, tt2) => tt1.value.localeCompare(tt2.value))
    }
  },

  methods: {

    checked (type) {
      return this.checkedTypes.some(_type => _type.uri === type.uri)
    },

    input (type, checked) {
      // console.log('input', type.uri, checked)
      this.$emit(checked ? 'checked' : 'unchecked', type)
    },

    close () {
      this.$emit('close')
    }
  }
}
</script>

<style>
.dmx-type-dialog .el-checkbox {
  display: block;
  line-height: 1.5;
}

.dmx-type-dialog .el-checkbox .icon {
  color: var(--color-topic-icon);
  margin-left: var(--icon-spacing);
}
</style>
