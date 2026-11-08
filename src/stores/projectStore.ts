import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProjectStatus, ProjectItem, AddProjectData, EditProjectData } from '@/types/project'
import {
  getProjectsAPI,
  addProjectAPI,
  editProjectAPI,
  deleteProjectAPI,
  deleteProjectsBatchAPI,
} from '@/services/projectService'
import { handleFetchFailure } from '@/utils/fetchHelpers'

export const useProjectStore = defineStore('projects', () => {
  //原始資料
  const projectsList = ref<ProjectItem[]>([])
  const isLoading = ref<boolean>(false)
  const isError = ref<boolean>(false)
  const errorMessage = ref<string>('')

  //篩選狀態
  const searchQuery = ref<string>('')
  const tagsFilter = ref<string[]>([])
  const statusFilter = ref<ProjectStatus | 'all'>('all')
  const currentPage = ref(1)
  const pageSize = ref(8)

  //篩選後結果
  /**
   * 結合搜尋框輸入字串、技術標籤和專案狀態進行多層過濾
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
        p.skillTags.some((tag) => tag.toLowerCase().includes(query))

      //2. 技術標籤：須符合所有選中的標籤才可通過篩選
      const matchTags =
        !tagsFilter.value.length ||
        tagsFilter.value.every((selectedTag) => p.skillTags.includes(selectedTag))

      //3. 專案狀態： 需符合所選的專案狀態，未選擇狀態時預設通行
      const matchStatus = statusFilter.value === 'all' || p.status === statusFilter.value

      // 同時符合三項篩選條件才會被渲染
      return matchSearch && matchTags && matchStatus
    })
  })

  const pagedProjects = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredProjects.value.slice(start, start + pageSize.value)
  })

  const total = computed(() => filteredProjects.value.length)

  const isEmpty = computed(() => filteredProjects.value.length === 0)

  const addProject = async (data: AddProjectData) => {
    const project = await addProjectAPI(data)
    projectsList.value.unshift(project)
  }

  const editProject = async (data: EditProjectData) => {
    const updatedAt = await editProjectAPI(data)
    const index = projectsList.value.findIndex((p) => p.id === data.id)
    const old = projectsList.value[index]

    // 找不到代表資料已過期，重新抓取以免畫面和資料庫不一致
    if (!old) {
      await fetchProjects()
      return
    }
    // createdAt 沿用舊值；updatedAt 暫時用本機時間，重新整理後同步伺服器時間
    projectsList.value[index] = { ...old, ...data, updatedAt }
  }

  const deleteProject = async (id: ProjectItem['id']) => {
    await deleteProjectAPI(id)
    const index = projectsList.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      projectsList.value.splice(index, 1)
    }
  }

  const deleteProjectsBatch = async (list: ProjectItem['id'][]) => {
    await deleteProjectsBatchAPI(list)
    const remainingProjects = projectsList.value.filter((p) => {
      return !list.includes(p.id)
    })
    projectsList.value = remainingProjects
  }

  const fetchProjects = async () => {
    isLoading.value = true
    isError.value = false //每次獲取時重置錯誤狀態，避免頁面卡在失敗畫面

    // TODO： 之後考慮將 fetch 寫成高階函式獨立出來讓每個 store 調用
    try {
      projectsList.value = await getProjectsAPI()
    } catch (error) {
      handleFetchFailure({ isError, isLoading, errorMessage }, error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    projectsList,
    isLoading,
    isError,
    errorMessage,
    searchQuery,
    tagsFilter,
    statusFilter,
    currentPage,
    pageSize,
    filteredProjects,
    pagedProjects,
    total,
    isEmpty,
    addProject,
    editProject,
    deleteProject,
    deleteProjectsBatch,
    fetchProjects,
  }
})
