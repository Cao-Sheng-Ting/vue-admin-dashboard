import { defineStore } from 'pinia'
import type { Experience } from '@/types/experience'
import { ElMessage } from 'element-plus'
import { getExperiencesAPI } from '@/services/experienceService'

export const useExperienceStore = defineStore('experiences', () => {
  const timelineMap = ref<Experience[] | null>(null)
  const isLoading = ref<boolean>(false)
  const isError = ref<boolean>(false)

  const fetchExperiences = async () => {
    isLoading.value = true
    isError.value = false

    try {
      timelineMap.value = await getExperiencesAPI()
    } catch (error) {
      isError.value = true
      ElMessage.error('載入經歷資料失敗，請稍後再試')
      console.error(error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    timelineMap,
    isLoading,
    isError,
    fetchExperiences,
  }
})
