<script setup lang="ts">
import { useProjectStore } from '@/stores/projectStore'

withDefaults(defineProps<{
  isError: boolean
  isEmpty?: boolean
  errorDescription?: string
  emptyDescription?: string
}>(), {
  isEmpty: false
}
)

const projectStore = useProjectStore()

const loadData = async () => {
  await projectStore.fetchProjects()
}

</script>
<template>
  <div v-if="isError" class="flex flex-col h-full w-full items-center justify-center gap-3">
    <el-button size="large" @click="loadData" class="border-none text-2xl">
      <icon-tabler:refresh />
    </el-button>
    <div class="text-lg text-gray-600">{{ errorDescription ?? '重新整理' }}</div>
  </div>

  <div v-else-if="isEmpty" class="flex w-full h-full items-center justify-center pb-32">
    <el-empty :description="emptyDescription ?? '目前沒有內容'" />
  </div>
</template>
