<script setup lang="ts">
defineProps({
  type: {
    type: String,
    default: 'primary'
  },
  plain: {
    type: Boolean,
    default: true
  },
  buttonText: {
    type: String,
    default: '選擇使用技術'
  }
})

defineEmits(['click'])

</script>
<template>
  <el-button @click="$emit('click')" :type="type" :plain="plain">
    <div class="flex items-center gap-1">
      <icon-ic:round-plus />
      <span>{{ buttonText }}</span>
    </div>
  </el-button>
</template>
