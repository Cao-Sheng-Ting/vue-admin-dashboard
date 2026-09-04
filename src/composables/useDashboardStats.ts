import { useProjectStore } from '@/stores/projectStore'
import { useSkillStore } from '@/stores/skillStore'
import { countSkillTags } from '@/utils/skill'
import { formatCareerDuration } from '@/utils/date'
import { useExperienceStore } from '@/stores/experienceStore'
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

  const careerDurationStates = computed(() => {
    let totalDurationYears = 0
    let totalDurationMonths = 0

    if (experienceStore.timelineMap) {
      const career = experienceStore.timelineMap.find((t) => t.type === 'career')
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
    totalProjects: projectStore.projectsList.length || 0,
    completedProjects:
      projectStore.projectsList.filter((p) => p.status === 'completed').length || 0,
    developingProjects:
      projectStore.projectsList.filter((p) => p.status === 'developing').length || 0,
    totalSkills: countSkillTags(skillStore.mergedSkillGroups),
    frontendSkills: skillStore.mergedSkillGroups?.['frontend']?.tags.length || 0,
    backendSkills: skillStore.mergedSkillGroups?.['backend']?.tags.length || 0,
    careerDuration: careerDurationStates.value,
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
    const Top5Skills = getTopOccurrences(skillMap)

    const statusStats = calcPercentageByTotal(statusMap)
    const skillStats = calcPercentageByMax(Top5Skills)

    return { statusStats, skillStats }
  })

  return { cardStatsMap, chartStatsMap }
}
