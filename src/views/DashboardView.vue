<script setup lang="ts">
import { DASHBOARD_CARDS_CONFIG } from '@/constants/dashboard'
import { useDashboardStats } from '@/composables/useDashboardStats'
import { useUserStore } from '@/stores'
import { useProjectStore } from '@/stores/projectStore'
import { useSkillStore } from '@/stores/skillStore'
import { useExperienceStore } from '@/stores/experienceStore'

const userStore = useUserStore()
const projectStore = useProjectStore()
const skillStore = useSkillStore()
const experienceStore = useExperienceStore()


const statsMap = useDashboardStats()

const dashboardCards = computed(() => {
  return DASHBOARD_CARDS_CONFIG.map(card => ({
    ...card,
    items: card.items.map(item => ({
      ...item,
      value: statsMap.value[item.key]
    }))
  }))
})

onMounted(async () => {
  await projectStore.fetchProjects()
  await skillStore.fetchSkills(userStore.userInfo?.uid)
  await experienceStore.fetchExperiences()
})


</script>

<template>
  <div class="main-box bg-white flex-1 rounded p-6 flex flex-col">
    <el-row :gutter="20">
      <el-col :xs="12" :sm="8" :md="8" v-for="card in dashboardCards" :key="card.group">
        <el-card class="min-w-40 mb-3">
          <h3 class="card-title text-lg font-bold pb-4">{{ card.groupLabel }}</h3>
          <div class="card-contents grid gap-3"
            :class="card.items.length > 1 ? 'grid-cols-3 justify-between' : 'justify-center'">
            <div v-for="item in card.items" :key="item.key" class="flex flex-col gap-2 items-center">
              <h5 class="whitespace-nowrap text-sm text-gray-400">{{ item.label }}</h5>
              <div class="text-3xl text-slate-700">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div class="flex h-4 rounded-full overflow-hidden">
      <div class="bg-blue-500" :style="{ width: '30%' }"></div>
      <div class="bg-green-500" :style="{ width: '20%' }"></div>
      <div class="bg-orange-500" :style="{ width: '50%' }"></div>
    </div>
  </div>
</template>
