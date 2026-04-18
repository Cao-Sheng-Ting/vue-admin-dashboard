import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectList } from '@/views/content/data'

export const useProjectStore = defineStore('project', () => {
  //原始資料
  const projectsList = ref(projectList)

  //篩選狀態
  const searchQuery = ref('')
  const tagsFilter = ref([])
  const statusFilter = ref('all')

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

  return {
    projectsList,
    searchQuery,
    tagsFilter,
    statusFilter,
    filteredProjects,
  }
})
