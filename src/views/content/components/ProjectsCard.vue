<script setup lang="ts">
import { STATUS_MAP } from '@/constants/project'
import type { ProjectItem } from '@/types/project'
import { deleteProjectAPI } from '@/services/projectService'
import { useProjectStore } from '@/stores/projectStore';
import { ElMessage, ElMessageBox } from 'element-plus'


defineProps<{
  data: ProjectItem,
  isBatchEdit: boolean
  isProjectEdit: boolean
}>()

const projectStore = useProjectStore()

const isHovering = ref<boolean>(false)
const isMenuOpen = ref<boolean>(false)

// 使用 computed 依賴屬性自動計算顯示狀態，避免手動操作狀態產生不一致
const shouldShowMenu = computed(() => isHovering.value || isMenuOpen.value)

const handleMenuVisible = (visible: boolean) => {
  isMenuOpen.value = visible
}

const openLink = (url: string) => {
  if (url) window.open(url, '_blank')
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除這個專案嗎？',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    await deleteProjectAPI(id)
    const index = projectStore.projectsList.findIndex(p => p.id === id)
    if (index !== -1) {
      projectStore.projectsList.splice(index, 1)
    }
    ElMessage.success('專案刪除成功')
  } catch (error) {
    if (error === 'cancel') return
    console.error(error)
    ElMessage.error('刪除失敗，請稍候再試')
  }
}
</script>

<template>
  <div @mouseenter="isHovering = true" @mouseleave="isHovering = false" class="relative group cursor-pointer"
    @click="$emit('edit', data)">
    <el-checkbox v-show="isBatchEdit" size="large" :value="data.id" @click.stop
      class="project-checkbox absolute left-3 z-10"></el-checkbox>
    <el-tag class="absolute top-2 right-2 z-10" :type="STATUS_MAP[data.status].type">{{
      STATUS_MAP[data.status].name }}</el-tag>
    <el-dropdown trigger="click" @visible-change="handleMenuVisible"
      class="absolute top-8 right-3 z-10 text-2xl transition-opacity duration-200"
      :class="{ 'opacity-100': shouldShowMenu, ' opacity-0': !shouldShowMenu }">
      <span @click.stop>
        <icon-ic:baseline-more-horiz />
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="handleDelete(data.id)">
            <icon-material-symbols:delete class="text-lg" />
            <span>刪除專案</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-card shadow="hover" class="flex flex-col">
      <template #header>
        <div class="card-header w-full relative flex justify-center items-center min-h-[3.5rem] mt-4 ">
          <span class="text-xl font-bold text-center break-words">{{ data.title }}</span>
        </div>
      </template>
      <div class="card-img aspect-video w-full overflow-hidden mb-2 ">
        <el-image :src="data.imageUrl" :alt="data.title"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
          <template #error>
            <div class="image-slot flex justify-center items-center w-full h-full text-slate-300">
              <icon-mdi:picture-360-outline class="text-5xl" />
            </div>
          </template>
        </el-image>
      </div>
      <div class="card-content">
        <p class="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem] mb-6">{{ data.description }}</p>
      </div>
      <div class="flex flex-row justify-center">
        <el-button type="primary" @click.stop="openLink(data.demoUrl)">線上預覽</el-button>
        <el-button plain @click.stop="openLink(data.githubUrl)">查看原始碼</el-button>
      </div>
      <template #footer>
        <div class="flex flex-col">
          <div class="tags flex flex-wrap gap-2 mb-5 min-h-16">
            <el-tag v-for="item in data.skillTags" :key="item">{{ item }}</el-tag>
          </div>
          <div class="progress text-center font-semibold text-gray-500">
            <div>開發進度</div>
            <el-progress :percentage="data.progress" :status="data.progress === 100 ? 'success' : ''"
              :text-inside="true" :stroke-width="20"></el-progress>
          </div>
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped>
.project-checkbox {
  transform: scale(1.5);
}
</style>
