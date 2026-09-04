<script setup lang="ts">
import { DASHBOARD_CARDS_CONFIG, DASHBOARD_CHART_CONFIG } from '@/constants/dashboard'
import { useDashboardStats } from '@/composables/useDashboardStats'
import { useUserStore } from '@/stores'
import { useProjectStore } from '@/stores/projectStore'
import { useSkillStore } from '@/stores/skillStore'
import { useExperienceStore } from '@/stores/experienceStore'


const userStore = useUserStore()
const projectStore = useProjectStore()
const skillStore = useSkillStore()
const experienceStore = useExperienceStore()


const { cardStatsMap, chartStatsMap } = useDashboardStats()
const statuses = DASHBOARD_CHART_CONFIG.find(item => item.key === 'projectStatus')
const skills = DASHBOARD_CHART_CONFIG.find(item => item.key === 'projectSkills')

const dashboardCards = computed(() => {
  return DASHBOARD_CARDS_CONFIG.map(card => ({
    ...card,
    items: card.items.map(item => ({
      ...item,
      value: cardStatsMap.value[item.key]
    }))
  }))
})

const dashboardCharts = computed(() => {
  const { statusStats, skillStats } = chartStatsMap.value

  const statusChart = statuses && statusStats ? {
    ...statuses,
    items: statuses.items.map(item => {
      const stats = statusStats.find(i => i.name === item.status)

      return {
        ...item,
        total: stats?.total,
        percentage: stats?.percentage
      }
    })
  } : null

  const skillsChart = skills && skillStats ? {
    label: skills.label,
    items: skillStats.map((current, index) => ({
      ...current,
      color: skills.colors[index]
    }))
  } : null

  console.log('statusChart:', statusChart)
  console.log('skillsChart:', skillsChart)

  return { statusChart, skillsChart }
})



onMounted(async () => {
  await projectStore.fetchProjects()
  await skillStore.fetchSkills(userStore.userInfo?.uid)
  await experienceStore.fetchExperiences()
})


</script>

<template>
  <div class="main-box bg-white flex-1 rounded p-6 flex flex-col gap-8">
    <el-row :gutter="20">
      <el-col :xs="12" :sm="8" :md="8" v-for="card in dashboardCards" :key="card.group">
        <el-card class="min-w-40 mb-3">
          <h3 class="card-title text-lg font-bold pb-4">{{ card.groupLabel }}</h3>
          <div class="card-contents grid gap-3"
            :class="card.items.length > 1 ? 'grid-cols-3 justify-between' : 'justify-center'">
            <div v-for="item in card.items" :key="item.key" class="flex flex-col gap-2 items-center">
              <h5 class="whitespace-nowrap text-sm text-gray-400">{{ item.label }}</h5>
              <div class="text-3xl text-sky-800">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card class="mb-4">
          <div v-if="dashboardCharts.skillsChart" class="max-w-2xl">
            <h4 class="pb-2 text-lg">{{ dashboardCharts.skillsChart.label }}</h4>
            <div v-for="item in dashboardCharts.skillsChart.items" :key="item.name">
              <h5>{{ item.name }}</h5>
              <div class="flex gap-2">
                <div class="h-5 rounded-full" :style="{ width: `${item.percentage}%` }" :class="item.color"></div>
                <div class="text-emerald-800">{{ `${item.total}` }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card class="mb-4">
          <div v-if="dashboardCharts.statusChart" class="max-w-2xl  flex flex-col gap-1">
            <h4 class="pb-2 text-lg">{{ dashboardCharts.statusChart.label }}</h4>
            <div class="flex h-7 rounded-full overflow-hidden">
              <div v-for="item in dashboardCharts.statusChart.items" :key="item.status"
                class="flex justify-center items-center text-white" :class="item.color"
                :style="{ width: `${item.percentage}%` }">{{ `${item.percentage}%` }}</div>
            </div>
            <div class="flex flex-row">
              <div v-for="item in dashboardCharts.statusChart.items" :key="item.status"
                :style="{ width: `${item.percentage}%` }" class="flex justify-center text-sm gap-1">
                <span class="whitespace-nowrap">{{ `${item.label}` }}</span>
                <span class="text-sky-800">{{ item.total }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

    </el-row>
  </div>
</template>
