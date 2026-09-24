import { defineStore } from 'pinia'
import type { SkillsData, SkillsGroupMap, DisplayGroup, Tag } from '@/types/skill'
import { ref } from 'vue'
import { getDefaultSkillsAPI, getUserSkillsAPI } from '@/services/skillService'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

export const useSkillStore = defineStore('skills', () => {
  //優化： 應在頁面 OnMounted 中執行
  const router = useRouter()

  //原始資料
  const defaultSkills = ref<SkillsGroupMap | null>(null)
  const userSkills = ref<SkillsGroupMap | null>(null)
  const skillOrder = ref<SkillsData['order'] | null>(null)
  const isLoading = ref<boolean>(false)
  const isError = ref<boolean>(false)

  /**
   * 共用標籤庫加入 type 供給頁面使用
   * 使用 computed 確保資料連動與緩存
   */
  const publicSkillGroups = computed((): Record<string, DisplayGroup> => {
    if (!skillOrder.value || !defaultSkills.value) return {}

    const defaults = defaultSkills.value

    const result = skillOrder.value.reduce(
      (acc, key) => {
        const category = defaults[key]
        if (category) {
          const { name, label, tags } = category
          acc[key] = {
            name,
            label,
            tags: tags.map((tag: string): Tag => ({ name: tag, type: 'public' })),
          }
        }

        return acc
      },
      {} as Record<string, DisplayGroup>,
    )

    return result
  })

  /**
   * 結合共用標籤庫和個人標籤庫，並加入 type 供給頁面使用
   * 使用 computed 確保資料連動與緩存
   */
  const mergedSkillGroups = computed(() => {
    if (!skillOrder.value) return {}

    const users = userSkills.value

    // 疊加個人標籤庫，相同分類合併進 tags，不同分類（該 defaults 分類已被刪除）則新增，
    // 個人標籤 removable 都為 true（可刪除）
    // 註：目前保留孤兒分類供使用者可自行刪除其內容標籤，避免無故遺失個人標籤，
    // 未來優化考慮：統一歸類至「待整理」或「其他」分類、 tag 拖拉功能、個人標籤庫是否需要可以新增分類
    const merged = skillOrder.value.reduce(
      (acc, key) => {
        const category = users?.[key]
        if (category) {
          const { name, label, tags } = category
          if (acc[key]) {
            acc[key].tags.push(...tags.map((tag: string): Tag => ({ name: tag, type: 'personal' })))
          } else {
            acc[key] = {
              name,
              label,
              tags: tags.map((tag: string): Tag => ({ name: tag, type: 'personal' })),
            }
          }
        }
        return acc
      },
      Object.fromEntries(
        Object.entries(publicSkillGroups.value).map(([key, group]) => [
          key,
          { ...group, tags: [...group.tags] },
        ]),
      ),
    )

    return merged
  })

  /**
   * 取得標籤庫資料（共用 + 個人）
   * uid 允許為 undefined：由呼叫端（onMounted）傳入 userInfo?.uid，
   * 讓判斷是否為登入狀態由這裡統一處理，避免判斷邏輯分散各處
   */
  const fetchSkills = async (uid: string | undefined) => {
    //優化： 跳轉是 UI 職責，應在頁面 OnMounted 中執行
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
    skillOrder,
    isLoading,
    isError,
    publicSkillGroups,
    mergedSkillGroups,
    fetchSkills,
  }
})
