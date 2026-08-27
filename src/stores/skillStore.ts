import { defineStore } from 'pinia'
import type { SkillsData, SkillsGroupMap, MergedGroup } from '@/types/skill'
import { ref } from 'vue'
import { getDefaultSkillsAPI, getUserSkillsAPI } from '@/services/skillService'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

export const useSkillStore = defineStore('skills', () => {
  const router = useRouter()

  //原始資料
  const defaultSkills = ref<SkillsGroupMap | null>(null)
  const userSkills = ref<SkillsGroupMap | null>(null)
  const skillOrder = ref<SkillsData['order'] | null>(null)
  const isLoading = ref<boolean>(false)
  const isError = ref<boolean>(false)

  /**
   * 結合共用標籤庫和個人標籤庫，並加入 removable 供給頁面使用
   * 使用 computed 確保資料連動與緩存
   */
  const mergedSkillGroups = computed(() => {
    if (!skillOrder.value || !defaultSkills.value) return {}

    const defaults = defaultSkills.value
    const users = userSkills.value

    // 先加入共用標籤資料建立基礎結構，共用標籤 removable 都為 false（不可刪除）
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

    // 再疊加個人標籤庫，相同分類合併進 tags，不同分類（該 defaults 分類已被刪除）則新增，
    // 個人標籤 removable 都為 true（可刪除）
    // 註：目前保留孤兒分類供使用者可自行刪除其內容標籤，避免無故遺失個人標籤，
    //     未來優化考慮統一歸類至「待整理」或「其他」分類
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

  /**
   * 取得標籤庫資料（共用 + 個人）
   * uid 允許為 undefined：由呼叫端（onMounted）傳入 userInfo?.uid，
   * 讓判斷是否為登入狀態由這裡統一處理，避免判斷邏輯分散各處
   */
  const fetchSkills = async (uid: string | undefined) => {
    if (!uid) {
      router.push('/auth/login')
      return
    }

    isLoading.value = true
    isError.value = false //每次獲取時重置錯誤狀態，避免頁面卡在失敗畫面
    try {
      const defaults = await getDefaultSkillsAPI()
      defaultSkills.value = defaults.skills
      skillOrder.value = defaults.order

      userSkills.value = await getUserSkillsAPI(uid)
    } catch (error) {
      isError.value = true
      ElMessage.error('載入標籤庫失敗，請稍後再試')
      console.log(error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    defaultSkills,
    userSkills,
    isLoading,
    isError,
    mergedSkillGroups,
    fetchSkills,
  }
})
