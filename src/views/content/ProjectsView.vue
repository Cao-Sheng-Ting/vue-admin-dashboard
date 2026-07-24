<script setup lang="ts">
import { ref } from 'vue'
import ProjectsCard from './components/ProjectsCard.vue'
import ProjectEditDrawer from './components/ProjectEditDrawer.vue'
import ProjectTagDialog from './components/ProjectTagDialog.vue'
import { useDebounceSearch } from '@/composables/useDebounce'
import { useProjectStore } from '@/stores/projectStore'
import ProjectStatusSelect from './components/ProjectStatusSelect.vue'
import type { ProjectStatus, ProjectItem } from '@/types/project'
import { getProjectsAPI } from '@/services/projectService.ts'
import { ElMessageBox } from 'element-plus'
import { deleteProjectsBatchAPI } from '@/services/projectService.ts'
import BaseButton from '@/components/BaseButton.vue'
import BaseErrorState from '@/components/BaseErrorState.vue';

const projectStore = useProjectStore()

//  --- 搜尋與篩選 ---
const keyword = useDebounceSearch()
const isTagFilterVisible = ref<boolean>(false)
const selectedTags = ref<string[]>([])
const selectedStatus = ref<ProjectStatus | 'all'>('all')

const handleTagClose = (tag: string) => {
  projectStore.tagsFilter = projectStore.tagsFilter.filter(t => t !== tag)
}

const handleTagsFilter = (tags: string[]) => {
  selectedTags.value = tags
  projectStore.tagsFilter = tags
}

//  --- 批量操作 ---
const isBatchEdit = ref<boolean>(false)
const projectCheckList = ref<string[]>([])

// --- 專案 Drawer 彈出  ---
const isDrawerVisible = ref<boolean>(false)
const isProjectEdit = ref<boolean>(false)
const editCardData = ref<ProjectItem | null>(null)

const openAddDrawer = () => {
  isProjectEdit.value = false
  editCardData.value = null
  isDrawerVisible.value = true
}

const openEditDrawer = (card: ProjectItem) => {
  isProjectEdit.value = true
  editCardData.value = card
  isDrawerVisible.value = true
}

// --- 專案 Drawer   ---

const handleAddProject = (project: ProjectItem) => {
  projectStore.projectsList.unshift(project)
}

const handleUpdateProject = async (project: ProjectItem) => {
  const index = projectStore.projectsList.findIndex(p => p.id === project.id)

  if (index !== -1) {
    projectStore.projectsList[index] = project
  } else {
    projectStore.projectsList = await getProjectsAPI()
  }
  console.log('更新後的資料', project)
}

// --- 專案刪除  ---
const handleEditAction = () => {
  isBatchEdit.value = !isBatchEdit.value
  if (!isBatchEdit.value) projectCheckList.value = []
}

const handleBatchDelete = async (list: string[]) => {
  console.log(projectCheckList.value)
  try {
    await ElMessageBox.confirm('確定刪除所選的專案嗎？',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await deleteProjectsBatchAPI(list)
    ElMessage.success('專案刪除成功')
    const remainingProjects = projectStore.projectsList.filter((p) => {
      return !projectCheckList.value.includes(p.id)
    })
    projectStore.projectsList = remainingProjects
    projectCheckList.value = []
  } catch (error) {
    if (error === 'cancel') return
    console.log(error)
    ElMessage.error('刪除失敗，請稍候再試')
  }
}


watch(selectedStatus, (newVal) => {
  projectStore.statusFilter = newVal
})


onMounted(async () => {
  await projectStore.fetchProjects()
})
</script>

<template>
  <div class="search-form-box flex flex-col flex-wrap bg-white p-4 rounded min-w-96">
    <div class="flex flex-row gap-4">
      <div class="flex flex-1 flex-row gap-2 ">
        <el-input placeholder="搜尋項目" v-model="keyword" class="max-w-md"></el-input>
        <ProjectStatusSelect v-model="selectedStatus">
          <el-option label="全部" value="all"></el-option>
        </ProjectStatusSelect>
        <el-button @click="isTagFilterVisible = true" type="success" plain class="w-22">技術棧篩選</el-button>
      </div>
    </div>
  </div>

  <div class="tech-stack-tags flex gap-2 items-center m-2">
    <el-tag closable @close="handleTagClose(tag)" v-for="tag in projectStore.tagsFilter" :key="tag">{{ tag
    }}</el-tag>
  </div>
  <div class="main-box bg-white flex-1 rounded p-6 ">

    <el-row :gutter="20" v-if="projectStore.isLoading">
      <el-col>
        <el-skeleton animated>
          <template #template>
            <div class="flex justify-start gap-3 pb-3">
              <el-skeleton-item variant="button"></el-skeleton-item>
              <el-skeleton-item variant="button"></el-skeleton-item>
            </div>
          </template>
        </el-skeleton>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="i in 4" :key="i" class="mb-5">
        <el-skeleton animated>
          <template #template>
            <div class="border pt-7 pb-3 px-5 rounded-lg">
              <div class="flex flex-col gap-3 items-center">
                <el-skeleton-item variant="h2" style="width: 70%"></el-skeleton-item>
                <el-skeleton-item variant="image" style="width: 100% ; height: 200px" />
              </div>
              <div class="pt-1">
                <el-skeleton-item variant="text"></el-skeleton-item>
                <div class="flex justify-evenly py-3">
                  <el-skeleton-item variant="button"></el-skeleton-item>
                  <el-skeleton-item variant="button"></el-skeleton-item>
                </div>
                <el-skeleton-item variant="text" style="width: 60%;"></el-skeleton-item>
                <el-skeleton-item variant="text" class="mt-8"></el-skeleton-item>
              </div>
            </div>
          </template>
        </el-skeleton>
      </el-col>
    </el-row>

    <BaseErrorState v-else-if="projectStore.isError || projectStore.isEmpty" :is-error="projectStore.isError"
      :is-empty="projectStore.isEmpty" error-description="載入專案失敗，請重新整理" empty-description="專案目前沒有內容"
      @retry="projectStore.fetchProjects" class="h-full">
    </BaseErrorState>

    <div v-else>
      <el-row class="mb-5">
        <el-col :span="16">
          <BaseButton @click="openAddDrawer">
            <icon-ph:plus-circle />
            <span>新增</span>
          </BaseButton>
          <BaseButton @click="handleEditAction" type="info" :plain="isBatchEdit ? false : true">
            <icon-ic:round-cancel-presentation v-if="isBatchEdit" />
            <icon-ic:outline-edit-note v-else />
            <span>{{ isBatchEdit ? '取消' : '編輯' }}</span>
          </BaseButton>
        </el-col>
        <el-col :span="8" class="flex justify-end">
          <el-button type="danger" v-if="isBatchEdit" :disabled="projectCheckList.length === 0 ? true : false"
            @click="handleBatchDelete(projectCheckList)">
            <div class="flex items-center gap-1">
              <icon-ic:outline-edit-note />
              <span>刪除</span>
            </div>
          </el-button>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in projectStore.filteredProjects" :key="item.id"
          class="mb-5">
          <el-checkbox-group v-model="projectCheckList">
            <ProjectsCard :data="item" :is-batch-edit="isBatchEdit" :is-project-edit="isProjectEdit"
              @edit="openEditDrawer">
            </ProjectsCard>
          </el-checkbox-group>
        </el-col>
      </el-row>
    </div>
  </div>
  <ProjectTagDialog v-model="isTagFilterVisible" :initial-tags="selectedTags" @confirm="handleTagsFilter">
  </ProjectTagDialog>
  <ProjectEditDrawer v-model:visible="isDrawerVisible" v-model:edit-mode="isProjectEdit"
    v-model:card-data="editCardData" @project-added="handleAddProject" @project-updated="handleUpdateProject">
  </ProjectEditDrawer>
</template>

<style scoped>
.main-box :deep(.el-card) {
  border-radius: 0.5rem;
}
</style>
