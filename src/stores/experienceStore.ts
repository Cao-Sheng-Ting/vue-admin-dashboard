import { defineStore } from 'pinia'
import type { Experience } from '@/types/experience'
import { getExperiencesAPI } from '@/services/experienceService'
import { isOffline, handleFetchFailure } from '@/utils/fetchHelpers'

export const useExperienceStore = defineStore('experiences', () => {
  const timelineMap = ref<Experience[] | null>(null)
  const isLoading = ref<boolean>(false)
  const isError = ref<boolean>(false)

  const fetchExperiences = async () => {
    isLoading.value = true
    isError.value = false

    if (isOffline()) {
      handleFetchFailure({ isError, isLoading })
      return
    }

    try {
      timelineMap.value = await getExperiencesAPI()
    } catch (error) {
      handleFetchFailure({ isError, isLoading }, '載入經歷資料失敗，請稍後再試')
      console.error(error)
    } finally {
      isLoading.value = false
    }
  }

  const isEmpty = computed(() => timelineMap.value?.length === 0)

  return {
    timelineMap,
    isLoading,
    isError,
    fetchExperiences,
    isEmpty,
  }
})
