<script setup lang="ts">
import { useExperienceStore } from '@/stores/experienceStore'


const experienceStore = useExperienceStore()


onMounted(async () => {
  await experienceStore.fetchExperiences()
})
</script>
<template>
  <div class="main-box bg-white flex-1 rounded p-6 flex flex-col">

    <div class="flex flex-col gap-2">
      <el-card v-for="timeline in experienceStore.timelineMap" :key="timeline.id">
        <div class="flex flex-row items-center">
          <div class="time-line-name text-l p-3 rounded bg-teal-700 text-white">{{ timeline.timeLineName }}</div>
          <div class="h-1 w-14 bg-teal-700"></div>
          <div v-for="item in timeline.item" :key="item.id">
            <div>{{ item.title }}</div>
            <div class="h-1 w-14 bg-teal-700"></div>
          </div>
          <icon-ph:plus-circle class="text-xl text-zinc-700 cursor-pointer" />
        </div>
      </el-card>
    </div>

  </div>
</template>
