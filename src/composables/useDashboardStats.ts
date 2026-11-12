import { useProjectStore } from '@/stores/projectStore'
import { useSkillStore } from '@/stores/skillStore'
import { useExperienceStore } from '@/stores/experienceStore'
import { countSkillTags } from '@/utils/skill'
import { formatCareerDuration } from '@/utils/date'
import {
  countOccurrences,
  getTopOccurrences,
  calcPercentageByTotal,
  calcPercentageByMax,
} from '@/utils/stats'
import type { ProjectStatus } from '@/types/project'

export const useDashboardStats = () => {
  const projectStore = useProjectStore()
  const skillStore = useSkillStore()
  const experienceStore = useExperienceStore()

  const careerDurationStats = computed(() => {
    let totalDurationYears = 0
    let totalDurationMonths = 0

    if (experienceStore.timelines) {
      const career = experienceStore.timelines.find((t) => t.type === 'career')
      if (career) {
        for (let i = 0; i < career.items.length; i++) {
          totalDurationYears += career.items[i]?.durationYears || 0
          totalDurationMonths += career.items[i]?.durationMonths || 0
        }
      }
    }

    return formatCareerDuration(totalDurationYears, totalDurationMonths)
  })

  const cardStatsMap = computed(() => ({
    totalProjects: projectStore.projectsList.length,
    completedProjects: projectStore.projectsList.filter((p) => p.status === 'completed').length,
    developingProjects: projectStore.projectsList.filter((p) => p.status === 'developing').length,
    totalSkills: countSkillTags(skillStore.mergedSkillGroups),
    frontendSkills:
      Object.values(skillStore.mergedSkillGroups ?? {}).find((group) => group.name === 'frontend')
        ?.tags.length ?? 0,
    backendSkills:
      Object.values(skillStore.mergedSkillGroups ?? {}).find((group) => group.name === 'backend')
        ?.tags.length ?? 0,
    careerDuration: careerDurationStats.value,
  }))

  const chartStatsMap = computed(() => {
    const statuses: ProjectStatus[] = []
    const skillTags: string[] = []

    projectStore.projectsList.forEach((p) => {
      statuses.push(p.status)
      skillTags.push(...p.skillTags)
    })

    const statusMap = countOccurrences(statuses)

    const skillMap = countOccurrences(skillTags)
    const top5Skills = getTopOccurrences(skillMap)

    const statusStats = calcPercentageByTotal(statusMap)
    const skillStats = calcPercentageByMax(top5Skills)

    return { statusStats, skillStats }
  })

  const isLoading = computed(
    () => projectStore.isLoading || skillStore.isLoading || experienceStore.isLoading,
  )

  const isError = computed(
    () => projectStore.isError || skillStore.isError || experienceStore.isError,
  )

  const fetchAll = async () => {
    await Promise.all([
      projectStore.fetchProjects(),
      skillStore.fetchSkills(),
      experienceStore.fetchExperiences(),
    ])
  }

  return { cardStatsMap, chartStatsMap, isLoading, isError, fetchAll }
}
