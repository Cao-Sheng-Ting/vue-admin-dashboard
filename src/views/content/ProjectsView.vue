<script setup lang="ts">
import { ref } from 'vue';
import ProjectsCard from './components/ProjectsCard.vue';
import ProjectEditDrawer from './components/ProjectEditDrawer.vue';
import ProjectTagDialog from './components/ProjectTagDialog.vue';
import { useDebounceSearch } from '@/composables/useDebounce';
import { useProjectStore } from '@/stores/projectStore';
import ProjectStatusSelect from './components/ProjectStatusSelect.vue';

const projectStore = useProjectStore()
const keyword = useDebounceSearch()

const isTagFilterVisible = ref<boolean>(false)

const isEditMode = ref<boolean>(false)
const projectCheckList = ref<number[]>([])

const isDrawerVisible = ref<boolean>(false)

const selectedTags = ref<string[]>([])

const handleEditAction = () => {
  isEditMode.value = !isEditMode.value
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
</script>

<template>
  <div class="search-form-box flex flex-col flex-wrap bg-white p-4 rounded min-w-96">
    <div class="flex flex-row gap-4">
      <div class="flex flex-1 flex-row gap-2 ">
        <el-input placeholder="搜尋項目" v-model="keyword" class="max-w-md"></el-input>
        <ProjectStatusSelect></ProjectStatusSelect>
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
        <el-button @click="isDrawerVisible = !isDrawerVisible" type="primary" plain>
          <div class="flex items-center gap-1">
            <icon-ph:plus-circle />
            <span>新增</span>
          </div>
        </el-button>
        <el-button @click="handleEditAction" type="info" :plain="isEditMode ? false : true">
          <div class="flex items-center gap-1">
            <icon-ic:round-cancel-presentation v-if="isEditMode" />
            <icon-ic:outline-edit-note v-else />
            <span>{{ isEditMode ? '取消' : '編輯' }}</span>
          </div>
        </el-button>
      </el-col>
      <el-col :span="8" class="flex justify-end">
        <el-button type="danger" v-if="isEditMode" :disabled="projectCheckList.length === 0 ? true : false">
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
          <ProjectsCard :data="item" :is-edit-mode="isEditMode"></ProjectsCard>
        </el-checkbox-group>
      </el-col>
    </el-row>
  </div>
  <ProjectTagDialog v-model="isTagFilterVisible" :initial-tags="selectedTags" @confirm="handleTagsFilter">
  </ProjectTagDialog>
  <ProjectEditDrawer v-model="isDrawerVisible"></ProjectEditDrawer>
</template>

<style scoped>
.main-box :deep(.el-card) {
  border-radius: 0.5rem;
}
</style>
