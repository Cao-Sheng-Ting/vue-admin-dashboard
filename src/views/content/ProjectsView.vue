<script setup lang="ts">
import ProjectsCard from './components/ProjectsCard.vue'
import ProjectEditDrawer from './components/ProjectEditDrawer.vue'
import SkillTagDialog from './components/SkillTagDialog.vue'
import { useDebounceSearch } from '@/composables/useDebounce'
import { useProjectStore } from '@/stores/projectStore'
import { useSkillStore } from '@/stores/skillStore.ts'
import ProjectStatusSelect from './components/ProjectStatusSelect.vue'
import type { ProjectStatus, ProjectItem } from '@/types/project'
import { ElMessageBox } from 'element-plus'
import BaseButton from '@/components/BaseButton.vue'
import BaseErrorState from '@/components/BaseErrorState.vue'
import { usePermission } from '@/composables/usePermission.ts'
import { showErrorMessage } from '@/utils/error.ts'

const projectStore = useProjectStore()
const skillStore = useSkillStore()
const { guard, denyClass } = usePermission()

// --- 搜尋與篩選 ---
const keyword = useDebounceSearch()
const isTagFilterVisible = ref<boolean>(false)
const selectedTags = ref<string[]>([])
const selectedStatus = ref<ProjectStatus | 'all'>('all')

// TODO：改由在 projectStore 內操作
const handleTagClose = (tag: string) => {
  projectStore.tagsFilter = projectStore.tagsFilter.filter(t => t !== tag)
  selectedTags.value = projectStore.tagsFilter
}

const handleTagsFilter = (tags: string[]) => {
  selectedTags.value = tags
  projectStore.tagsFilter = tags
}

// --- 批量操作 ---
const isBatchEdit = ref<boolean>(false)
const projectCheckList = ref<string[]>([])

// --- 專案 Drawer 彈出 ---
const isDrawerVisible = ref<boolean>(false)
const isProjectEdit = ref<boolean>(false)
const editCardData = ref<ProjectItem | null>(null)

const openAddDrawer = async () => {
  if (!await (guard('editor'))) return
  isProjectEdit.value = false
  editCardData.value = null
  isDrawerVisible.value = true
}

const openEditDrawer = async (card: ProjectItem) => {
  if (!await (guard('editor'))) return

  isProjectEdit.value = true
  editCardData.value = card
  isDrawerVisible.value = true
}

// --- 專案刪除 ---
const handleEditAction = async () => {
  if (!await (guard('editor'))) return
  isBatchEdit.value = !isBatchEdit.value
  if (!isBatchEdit.value) projectCheckList.value = []
}

const handleBatchDelete = async (list: string[]) => {
  if (!await (guard('editor')) || list.length === 0) return

  try {
    await ElMessageBox.confirm('確定刪除所選的專案嗎？',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await projectStore.deleteProjectsBatch(list)
    ElMessage.success('專案刪除成功')
    projectCheckList.value = []
    isBatchEdit.value = false
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    showErrorMessage(error)
  }
}

watch(selectedStatus, (newVal) => {
  projectStore.statusFilter = newVal
})


onMounted(async () => {
  await Promise.all([
    projectStore.fetchProjects(),
    // TODO：技能庫載入失敗時，專案頁面跳 message
    skillStore.fetchSkills()
  ])
  selectedTags.value = projectStore.tagsFilter
  selectedStatus.value = projectStore.statusFilter
})
</script>

<template>
  <div class="search-form-box flex flex-col flex-wrap bg-white p-4 rounded min-w-96">
    <div class="flex flex-row gap-4 justify-between">
      <div class="flex flex-1 flex-row gap-2 ">
        <el-input placeholder="搜尋項目" v-model="keyword" class="max-w-md"></el-input>
        <ProjectStatusSelect v-model="selectedStatus">
          <el-option label="全部" value="all"></el-option>
        </ProjectStatusSelect>
      </div>
      <div>
        <el-button @click="isTagFilterVisible = true" type="success" plain class="w-22">技術棧篩選</el-button>
      </div>
    </div>
  </div>

  <div class="tech-stack-tags flex gap-2 items-center m-2">
    <el-tag closable @close="handleTagClose(tag)" v-for="tag in projectStore.tagsFilter" :key="tag">{{ tag
      }}</el-tag>
  </div>
  <div class="main-box bg-white flex-1 rounded p-6">

    <el-row v-if="!projectStore.isLoading && !projectStore.isError" class="mb-5">
      <el-col :span="16">
        <BaseButton @click="openAddDrawer" :class="denyClass('editor', 'button')">
          <icon-ph:plus-circle />
          <span>新增</span>
        </BaseButton>
        <BaseButton v-if="!projectStore.isEmpty" @click="handleEditAction" type="info"
          :plain="isBatchEdit ? false : true" :class="denyClass('editor', 'button')">
          <icon-ic:round-cancel-presentation v-if="isBatchEdit" />
          <icon-ic:outline-edit-note v-else />
          <span>{{ isBatchEdit ? '取消' : '編輯' }}</span>
        </BaseButton>
      </el-col>
      <el-col :span="8" class="flex justify-end">
        <el-button type="danger" v-if="isBatchEdit" :disabled="projectCheckList.length === 0"
          @click="handleBatchDelete(projectCheckList)">
          <div class="flex items-center gap-1">
            <icon-material-symbols:delete />
            <span>刪除</span>
          </div>
        </el-button>
      </el-col>
    </el-row>

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
                <el-skeleton-item variant="h3" style="width: 70%"></el-skeleton-item>
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
      :is-empty="projectStore.isEmpty" :error-description="projectStore.errorMessage" empty-description="專案目前沒有內容"
      @retry="projectStore.fetchProjects" class="h-full">
    </BaseErrorState>

    <el-row v-else :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in projectStore.pagedProjects" :key="item.id" class="mb-5">
        <el-checkbox-group v-model="projectCheckList">
          <ProjectsCard :data="item" :is-batch-edit="isBatchEdit" @edit="openEditDrawer">
          </ProjectsCard>
        </el-checkbox-group>
      </el-col>
    </el-row>

    <el-pagination v-if="!projectStore.isEmpty && !projectStore.isError && !projectStore.isLoading"
      v-model:current-page="projectStore.currentPage" v-model:page-size="projectStore.pageSize" background
      layout="prev, pager, next, jumper" :total="projectStore.total"></el-pagination>

  </div>

  <SkillTagDialog v-model="isTagFilterVisible" :initial-tags="selectedTags" @confirm="handleTagsFilter">
  </SkillTagDialog>
  <ProjectEditDrawer v-model:visible="isDrawerVisible" v-model:edit-mode="isProjectEdit"
    v-model:card-data="editCardData">
  </ProjectEditDrawer>
</template>

<style scoped>
.main-box :deep(.el-card) {
  border-radius: 0.5rem;
}
</style>
