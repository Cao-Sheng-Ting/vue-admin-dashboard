import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProjectStatus, ProjectItem } from '@/types/project'
import { getProjectsAPI } from '@/services/projectService'
import { ElMessage } from 'element-plus'

export const useProjectStore = defineStore('projects', () => {
  //原始資料
  const projectsList = ref<ProjectItem[]>([])
  const isLoading = ref<boolean>(false)
  const isError = ref<boolean>(false)

  //篩選狀態
  const searchQuery = ref<string>('')
  const tagsFilter = ref<string[]>([])
  const statusFilter = ref<ProjectStatus | 'all'>('all')

  //篩選後結果
  /**
   * 結合搜尋匡輸入字串、技術標籤和專案狀態進行多層過濾
   * 使用 computed 確保資料連動與緩存
   */
  const filteredProjects = computed(() => {
    const query = searchQuery.value.toLowerCase()

    return projectsList.value.filter((p) => {
      //1. 頁面搜尋：對比標題、描述和技術標籤，query為空時預設通行
      const matchSearch =
        !query ||
        p.title.toLowerCase().includes(query) ||
        (p.description?.toLowerCase().includes(query) ?? false) ||
        p.tags.some((tag) => tag.toLowerCase().includes(query))

      //2. 技術標籤：須符合所有選中的標籤才可通過篩選
      const matchTags =
        !tagsFilter.value.length ||
        tagsFilter.value.every((selectedTag) => p.tags.includes(selectedTag))

      //3. 專案狀態： 需符合所選的專案狀態，未選擇狀態時預設通行
      const matchStatus = statusFilter.value === 'all' || p.status === statusFilter.value

      // 同時符合三項篩選條件才會被渲染
      return matchSearch && matchTags && matchStatus
    })
  })
  const isEmpty = computed(() => filteredProjects.value.length === 0)

  const fetchProjects = async () => {
    isLoading.value = true
    isError.value = false //每次獲取時重置錯誤狀態，避免頁面卡在失敗畫面
    try {
      projectsList.value = await getProjectsAPI()
      console.log('isError', isError.value)
    } catch (error) {
      isError.value = true
      ElMessage.error('載入專案失敗，請稍後再試')
      console.error(error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    projectsList,
    isLoading,
    isError,
    isEmpty,
    searchQuery,
    tagsFilter,
    statusFilter,
    filteredProjects,
    fetchProjects,
  }
})
