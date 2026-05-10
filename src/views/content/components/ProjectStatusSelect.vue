<script setup lang="ts">
// import { useProjectStore } from '@/stores/projectStore';
import { STATUS_MAP } from '@/constants/project';


// const projectStore = useProjectStore()
const selectedStatus = defineModel()
</script>
<template>
  <el-select v-model="selectedStatus" class="w-40 flex-shrink-0" placeholder="請選擇">
    <template #prefix>
      <span>專案狀態:</span>
    </template>
    <slot></slot>
    <el-option v-for="(config, key) in STATUS_MAP" :key="key" :label="config.name" :value="key"></el-option>
  </el-select>
</template>
