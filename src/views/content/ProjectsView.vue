<script setup lang="ts">
import { ref } from 'vue';
import ProjectsCard from './components/ProjectsCard.vue';
import ProjectEditDrawer from './components/ProjectEditDrawer.vue';
import ProjectTagDialog from './components/ProjectTagDialog.vue';
import { useDebounceSearch } from '@/composables/useDebounce';
import { useProjectStore } from '@/stores/projectStore';
import ProjectStatusSelect from './components/ProjectStatusSelect.vue';
import type { ProjectStatus, ProjectItem } from '@/types/project';

const projectStore = useProjectStore()

//  --- 搜尋與篩選 ---
const keyword = useDebounceSearch()
const isTagFilterVisible = ref<boolean>(false)
const selectedTags = ref<string[]>([])
const selectedStatus = ref<ProjectStatus | 'all'>('all')

//  --- 批量操作 ---
const isBatchEdit = ref<boolean>(false)
const projectCheckList = ref<number[]>([])

// --- 專案編輯 (Drawer) ---
const isDrawerVisible = ref<boolean>(false)
const isProjectEdit = ref<boolean>(false)
const editCardData = ref<ProjectItem | null>(null)

const handleAddProject = () => {
  isProjectEdit.value = false
  editCardData.value = null
  isDrawerVisible.value = true
}

const handleProjectEdit = (card: ProjectItem) => {
  isProjectEdit.value = true
  editCardData.value = card
  isDrawerVisible.value = true
}


const handleEditAction = () => {
  isBatchEdit.value = !isBatchEdit.value
}
// const handleBatchDelete = () => {

// }
const handleTagClose = (tag: string) => {
  projectStore.tagsFilter = projectStore.tagsFilter.filter(t => t !== tag)
}

const handleTagsFilter = (tags: string[]) => {
  selectedTags.value = tags
  projectStore.tagsFilter = tags
}

watch(selectedStatus, (newVal) => {
  projectStore.statusFilter = newVal
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
    <el-row class="mb-5">
      <el-col :span="16">
        <el-button @click="handleAddProject" type="primary" plain>
          <div class="flex items-center gap-1">
            <icon-ph:plus-circle />
            <span>新增</span>
          </div>
        </el-button>
        <el-button @click="handleEditAction" type="info" :plain="isBatchEdit ? false : true">
          <div class="flex items-center gap-1">
            <icon-ic:round-cancel-presentation v-if="isBatchEdit" />
            <icon-ic:outline-edit-note v-else />
            <span>{{ isBatchEdit ? '取消' : '編輯' }}</span>
          </div>
        </el-button>
      </el-col>
      <el-col :span="8" class="flex justify-end">
        <el-button type="danger" v-if="isBatchEdit" :disabled="projectCheckList.length === 0 ? true : false">
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
            @edit="handleProjectEdit"></ProjectsCard>
        </el-checkbox-group>
      </el-col>
    </el-row>
  </div>
  <ProjectTagDialog v-model="isTagFilterVisible" :initial-tags="selectedTags" @confirm="handleTagsFilter">
  </ProjectTagDialog>
  <ProjectEditDrawer v-model:visible="isDrawerVisible" v-model:edit-mode="isProjectEdit"
    v-model:card-data="editCardData">
  </ProjectEditDrawer>
</template>

<style scoped>
.main-box :deep(.el-card) {
  border-radius: 0.5rem;
}
</style>
