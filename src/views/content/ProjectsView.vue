<script setup lang="ts">
import { ref } from 'vue';
import ProjectsCard from './components/ProjectsCard.vue';
import { useDebounceSearch } from '@/composables/useDebounce';
import { useProjectStore } from '@/stores/projectStore';
import { STATUS_MAP, TECH_STACK_CONFIG } from '@/constants/project';

const projectStore = useProjectStore()
const keyword = useDebounceSearch()

const isTagFilterVisible = ref<boolean>(false)
const checkedTags = ref<string[]>([])

const isEditMode = ref<boolean>(false)
const projectCheckList = ref<number[]>([])

const handleEditAction = () => {
  isEditMode.value = !isEditMode.value
}
// const hanleBatchDelete = () => {

// }


const toggleTag = (tag: string) => {
  const index = checkedTags.value.indexOf(tag)
  if (index > -1) {
    checkedTags.value.splice(index, 1)
  } else {
    checkedTags.value.push(tag)
  }
}

const handleTagClose = (tag: string) => {
  projectStore.tagsFilter = projectStore.tagsFilter.filter(t => t !== tag)
}

const handelDialogOpen = () => {
  checkedTags.value = [...projectStore.tagsFilter]
  isTagFilterVisible.value = true
}

const handelDialogClose = (isConfirm: boolean) => {
  if (isConfirm) {
    projectStore.tagsFilter = [...checkedTags.value]
    isTagFilterVisible.value = false
  } else {
    isTagFilterVisible.value = false
  }
  console.log(projectStore.tagsFilter)
}

</script>

<template>
  <div class="search-form-box flex flex-col flex-wrap bg-white p-4 rounded min-w-96">
    <div class="flex flex-row gap-4">
      <div class="flex flex-1 flex-row gap-2 ">
        <el-input placeholder="搜尋項目" v-model="keyword" class="max-w-md"></el-input>
        <el-select v-model="projectStore.statusFilter" class="w-40">
          <template #prefix>
            <span>狀態:</span>
          </template>
          <el-option label="全部" value="all"></el-option>
          <el-option v-for="(config, key) in STATUS_MAP" :key="key" :label="config.name" :value="key"></el-option>
        </el-select>
        <el-button @click="handelDialogOpen" type="success" plain class="w-22">技術棧篩選</el-button>
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
        <el-button type="primary" plain>
          <div class="flex items-center gap-1">
            <icon-ph:plus-circle />
            <span>新增</span>
          </div>
        </el-button>
        <el-button @click="handleEditAction" type="info" :plain="isEditMode ? false : true">
          <div class="flex items-center gap-1">
            <icon-ph:key-return-fill v-if="isEditMode" />
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
  <el-dialog v-model="isTagFilterVisible" title="技術棧篩選" width="500">
    <el-space direction="vertical" fill>
      <el-card v-for="item in TECH_STACK_CONFIG" :key="item.label">
        <div class="flex">
          <div class="tech-stack-label w-20 shrink-0 flex items-center whitespace-nowrap "><span>{{ item.label }}</span>
          </div>
          <div class="tech-tags flex flex-wrap gap-3">
            <el-check-tag v-for="(tag, index) in item.tags" :key="index" :checked="checkedTags.includes(tag)"
              @change="() => toggleTag(tag)">{{ tag
              }}</el-check-tag>
          </div>
        </div>
      </el-card>
    </el-space>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handelDialogClose(false)">取消</el-button>
        <el-button @click="handelDialogClose(true)">確定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.main-box :deep(.el-card) {
  border-radius: 0.5rem;
}
</style>
