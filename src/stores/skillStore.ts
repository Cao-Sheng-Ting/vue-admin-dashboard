import { defineStore } from 'pinia'
import type { SkillsData, SkillsGroupMap, DisplayGroup, Tag } from '@/types/skill'
import {
  getDefaultSkillsAPI,
  getUserSkillsAPI,
  editUserSkillsAPI,
  deleteSkillGroupAPI,
  editDefaultSkillsAPI,
} from '@/services/skillService'
import { handleFetchFailure } from '@/utils/fetchHelpers'
import { useUserStore } from './userStore'
import { AppError, showErrorMessage } from '@/utils/error'

export const useSkillStore = defineStore('skills', () => {
  const userStore = useUserStore()

  //原始資料
  const defaultSkills = ref<SkillsGroupMap | null>(null)
  const userSkills = ref<SkillsGroupMap | null>(null)
  const skillOrder = ref<SkillsData['order'] | null>(null)
  const isLoading = ref<boolean>(false)
  const isError = ref<boolean>(false)
  const isUserSkillsError = ref<boolean>(false)
  const errorMessage = ref<string>('')

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

    // 疊加個人標籤庫，相同分類合併進 tags
    // 刪分類會同時從 order 裡拿掉，公用庫reduce 會走訪不到，該分類底下標籤直接不顯示
    // TODO：後續規劃處理孤兒分類標籤，看是統一歸類至「待整理」或「其他」分類
    // TODO：tag 拖拉功能
    // TODO：個人標籤庫是否需要可以新增分類
    const merged = skillOrder.value.reduce(
      (acc, key) => {
        const category = users?.[key]
        if (category) {
          const { name, label, tags } = category
          if (acc[key]) {
            acc[key].tags.push(...tags.map((tag: string): Tag => ({ name: tag, type: 'personal' })))
          } else {
            // 防呆：order 有、公用庫裡沒有的分類（資料不一致）才會走到這
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
          // 初始值：複製 tags，避免 push 修改到 publicSkillGroups
          { ...group, tags: [...group.tags] },
        ]),
      ),
    )

    return merged
  })

  /**
   * 取得標籤庫資料（共用 + 個人）
   * 訪客只載公共庫，個人庫失敗不擋公共庫
   */
  const fetchSkills = async () => {
    isLoading.value = true
    isError.value = false //每次獲取時重置錯誤狀態，避免頁面卡在失敗畫面
    isUserSkillsError.value = false
    try {
      const defaults = await getDefaultSkillsAPI()
      defaultSkills.value = defaults.skills
      skillOrder.value = defaults.order

      if (userStore.userInfo?.uid) {
        try {
          userSkills.value = await getUserSkillsAPI(userStore.userInfo.uid)
        } catch (error) {
          // 個人標籤庫失敗不擋公用庫，降級為空確保沒有上一位使用者資料殘留，並禁止編輯
          showErrorMessage(error)
          isUserSkillsError.value = true
          userSkills.value = null
        }
      } else {
        userSkills.value = null
      }
    } catch (error) {
      handleFetchFailure({ isError, isLoading, errorMessage }, error)
    } finally {
      isLoading.value = false
    }
  }

  const editUserSkills = async () => {
    if (!userSkills.value) throw new AppError('個人技能庫資料異常，請重新整理後再試')

    if (!userStore.userInfo?.uid) throw new AppError('登入狀態已失效，請重新登入')

    await editUserSkillsAPI(userSkills.value, userStore.userInfo.uid)
  }

  const skillGroupDelete = async (key: string) => {
    if (!defaultSkills.value || !skillOrder.value) {
      throw new AppError('資料異常，請重新整理頁面後再試')
    }

    await deleteSkillGroupAPI(key)

    // API 成功後才改 store，以免失敗時畫面與 Firestore 資料不一致
    delete defaultSkills.value[key]
    skillOrder.value = skillOrder.value.filter((item) => item !== key)
  }

  const defaultSkillsSubmit = async () => {
    if (!defaultSkills.value || !skillOrder.value)
      throw new AppError('公共技能庫資料異常，請重新整理頁面後再試')

    const payload = {
      order: skillOrder.value,
      skills: defaultSkills.value,
    }
    await editDefaultSkillsAPI(payload)
  }

  watch(
    () => userStore.userInfo?.uid,
    (uid) => {
      if (!uid) {
        userSkills.value = null
        isUserSkillsError.value = false
      }
    },
  )

  return {
    defaultSkills,
    userSkills,
    skillOrder,
    isLoading,
    isError,
    isUserSkillsError,
    errorMessage,
    publicSkillGroups,
    mergedSkillGroups,
    fetchSkills,
    editUserSkills,
    skillGroupDelete,
    defaultSkillsSubmit,
  }
})
