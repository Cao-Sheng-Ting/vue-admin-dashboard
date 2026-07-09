import { defineStore } from 'pinia'
import type { SkillsData, SkillsGroup, MergedGroup } from '@/types/skill'
import { ref } from 'vue'
import { getDefaultSkillsAPI, getUserSkillsAPI } from '@/services/skillService'
import { ElMessage } from 'element-plus'

export const useSkillsStore = defineStore('skills', () => {
  //原始資料
  const defaultSkills = ref<SkillsGroup | null>(null)
  const userSkills = ref<SkillsGroup | null>(null)
  const skillOrder = ref<SkillsData['order'] | null>(null)
  const isLoading = ref<boolean>(false)
  /**
   * 結合共用標籤庫和個人標籤庫，並加入 removable 供給頁面使用
   * 使用 computed 確保資料連動與緩存
   */
  const mergedSkillGroups = computed(() => {
    if (!skillOrder.value || !defaultSkills.value) return {}

    const defaults = defaultSkills.value
    const users = userSkills.value

    const result = skillOrder.value.reduce(
      (acc, key) => {
        const category = defaults[key]
        if (category) {
          const { label, tags } = category
          acc[key] = {
            label,
            tags: tags.map((tag: string) => ({ name: tag, removable: false })),
          }
        }

        return acc
      },
      {} as Record<string, MergedGroup>,
    )

    const merged = skillOrder.value.reduce((acc, key) => {
      const category = users?.[key]
      if (category) {
        const { label, tags } = category
        if (acc[key]) {
          acc[key].tags.push(...tags.map((tag: string) => ({ name: tag, removable: true })))
        } else {
          acc[key] = {
            label,
            tags: tags.map((tag: string) => ({ name: tag, removable: true })),
          }
        }
      }
      return acc
    }, result)

    return merged
  })

  const fetchSkills = async (uid: string) => {
    isLoading.value = true

    try {
      const defaults = await getDefaultSkillsAPI()

      defaultSkills.value = defaults.skills
      userSkills.value = await getUserSkillsAPI(uid)
      skillOrder.value = defaults.order
    } catch (error) {
      ElMessage.error('載入標籤庫失敗，請稍後再試')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const TECH_STACK_CONFIG: SkillsData = {
    skills: {
      frontend: {
        label: '前端技術',
        tags: ['Vue 3', 'TypeScript', 'Element Plus', 'Tailwind', 'Pinia'],
      },
      backend: {
        label: '後端與部署',
        tags: ['Node.js', 'Firebase', 'GitHub Copilot', 'Git', 'Docker'],
      },
      others: {
        label: '其他',
        tags: ['FL Studio', '100LS', 'English'],
      },
    },
    order: ['frontend', 'backend', 'others'],
  }

  return {
    TECH_STACK_CONFIG,
    defaultSkills,
    userSkills,
    mergedSkillGroups,
    fetchSkills,
  }
})
