<script setup lang="ts">
defineProps({
  type: {
    type: String,
    default: 'primary'
  },
  plain: {
    type: Boolean,
    default: true
  }
})

defineEmits(['click'])

</script>
<template>
  <el-button @click="$emit('click')" :type="type" :plain="plain">
    <div class="flex items-center gap-1">
      <slot />
    </div>
  </el-button>
</template>
