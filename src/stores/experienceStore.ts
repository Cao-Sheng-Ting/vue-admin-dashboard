import { defineStore } from 'pinia'
import { getExperiencesAPI, updateExperienceAPI } from '@/services/experienceService'
import { handleFetchFailure } from '@/utils/fetchHelpers'
import type { Experience, TimelineItem } from '@/types/experience'

export const useExperienceStore = defineStore('experiences', () => {
  const timelines = ref<Experience[] | null>(null)
  const isLoading = ref<boolean>(false)
  const isError = ref<boolean>(false)
  const errorMessage = ref<string>('')

  const fetchExperiences = async () => {
    isLoading.value = true
    isError.value = false

    try {
      timelines.value = await getExperiencesAPI()
    } catch (error) {
      handleFetchFailure({ isError, isLoading, errorMessage }, error)
    } finally {
      isLoading.value = false
    }
  }

  const updateTimeline = async (id: Experience['id'], updatedItems: TimelineItem[]) => {
    const result = await updateExperienceAPI(id, updatedItems)

    const foundItem = timelines.value?.find((item) => item.id === id)

    if (foundItem) {
      foundItem.items = result.items
    }
  }

  const isEmpty = computed(() => timelines.value?.length === 0)

  return {
    timelines,
    isLoading,
    isError,
    errorMessage,
    fetchExperiences,
    updateTimeline,
    isEmpty,
  }
})
