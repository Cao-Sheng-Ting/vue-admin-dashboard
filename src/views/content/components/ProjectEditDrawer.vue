<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import type { ProjectStatus, ProjectForm } from '@/types/project'
import ProjectTagDialog from '@/views/content/components/ProjectTagDialog.vue'
import ProjectStatusSelect from './ProjectStatusSelect.vue'
import { ElMessageBox } from 'element-plus'

const isDrawerVisible = defineModel()

const isTagSelectVisible = ref<boolean>(false)
const selectedTags = ref<string[]>([])

const handleTagsSelect = (tags: string[]) => {
  selectedTags.value = tags
}

const handleTagClose = (tag: string) => {
  selectedTags.value = selectedTags.value.filter(t => t !== tag)
}

const ruleFormRef = ref()
const getInitialProject = (): ProjectForm => ({
  title: '',
  description: '',
  imageUrl: '',
  tags: [],
  status: '',
  progress: 0,
  githubUrl: '',
  demoUrl: '',
  createdAt: '',
  detailContent: ''
})
const ruleForm = ref<ProjectForm>(getInitialProject())

const rules = reactive({
  title: [
    { required: true, message: '請輸入標題', trigger: 'blur' },
    { min: 3, max: 20, message: '標題長度須介於 3 到 20 字之間', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '請輸入專案描述', trigger: 'blur' },
    { max: 100, message: '專案描述須在 100 字以內', trigger: 'blur' }
  ],
  imageUrl: [{ type: 'url', message: '請輸入有效的網址 (需包含 http:// 或 https://)', trigger: 'blur' }],
  tags: [
    { type: 'array', required: true, message: '至少選擇一個專案使用的技術', trigger: 'change' },
    { type: 'array', max: 20, message: '選擇使用技術上限為 20 個', trigger: 'change' }
  ],
  status: [{ required: true, message: '請選擇專案狀態', trigger: 'change' }],
  progress: [
    { required: true, message: '請設定專案進度', trigger: 'change' },
    { type: 'number', min: 0, max: 100, message: '進度必須介於 0% 到 100% 之間', trigger: 'change' }
  ],
  githubUrl: [{ type: 'url', message: '請輸入正確的 GitHub 連結(需包含 https://)', trigger: 'blur' }],
  demoUrl: [{ type: 'url', message: '請輸入正確的 demo 連結(需包含 https://)', trigger: 'blur' }],
  createdAt: [],
  detailContent: [{ max: 3000, message: '專案詳情內容過長，須在 3000 字以內', trigger: 'blur' }]
})

const lastProgress = ref<number>(ruleForm.value.progress)

const handleStatusLinkage = (val: number) => {
  lastProgress.value = val
}

watch(() => ruleForm.value.status, (newVal, oldVal) => {
  if (newVal === oldVal) return
  if (newVal === 'completed') ruleForm.value.progress = 100
  else if (oldVal === 'completed') ruleForm.value.progress = lastProgress.value
})

const handleReset = () => {
  ElMessageBox.confirm(
    '確定要重置表單嗎？',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      ruleForm.value = getInitialProject()
      ElMessage({
        type: 'success',
        message: '重置成功'
      })
    })
    .catch(() => { })
}

const handleSubmit = async () => {
  await ruleFormRef.value.validate()
}

const handleClose = () => {
  const currentData = JSON.stringify(ruleForm.value)
  const initialData = JSON.stringify(getInitialProject())

  if (currentData !== initialData) {
    ElMessageBox.confirm(
      '確定要捨棄目前的編輯內容嗎？',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(() => {
        ruleForm.value = getInitialProject()
        isDrawerVisible.value = false
      })
      .catch(() => { })
  } else isDrawerVisible.value = false
}

const data = {
  title: 'Vue 3 Admin Dashboard',
  description: '基於 Vue 3 + TS + Element Plus 的後台管理系統，包含動態路由與權限控制。',
  imageUrl: 'https://picsum.photos/seed/project1/600/400',
  tags: ['Vue 3', 'TypeScript', 'Pinia'],
  status: 'developing',
  progress: 85,
  githubUrl: 'https://github.com/',
  demoUrl: 'https://demo.com/',
  createdAt: '2026-03-01',
  detailContent: '這是我目前的主力作品，深度研究了封裝思維與組件通訊邏輯。',
}
const { width } = useWindowSize();

const responsiveSize = computed(() => {
  if (width.value < 640) return '100%'
  if (width.value < 1024) return '65%'
  return '700px'
})

</script>

<template>
  <el-drawer :before-close="handleClose" v-model="isDrawerVisible" :show-close="true" :size="responsiveSize"
    style="--el-drawer-bg-color: var(--el-fill-color-light);">
    <template #header>
      <h2 class="text-3xl text-slate-700 border-b-2 border-gray-100 pt-2 pb-4">新增專案</h2>
    </template>
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules">
      <el-form-item prop="title">
        <el-input placeholder="標題" v-model="ruleForm.title" class="rounded-lg"></el-input>
      </el-form-item>
      <el-form-item prop="description">
        <el-input placeholder="專案描述" v-model="ruleForm.description" type="textarea"></el-input>
      </el-form-item>
      <el-form-item prop="tags">
        <div class="flex flex-col gap-4 items-start">
          <el-button @click="isTagSelectVisible = true" type="primary" plain>
            <icon-ic:round-plus />
            <span>選擇使用技術</span>
          </el-button>
          <div class="flex flex-row flex-wrap gap-2">
            <el-tag v-for="(tag, index) in selectedTags" :key="index" closable @close="handleTagClose(tag)">{{ tag
              }}</el-tag>
          </div>
        </div>
      </el-form-item>
      <el-form-item prop="status">
        <ProjectStatusSelect v-model="ruleForm.status"></ProjectStatusSelect>
      </el-form-item>
      <el-form-item prop="progress">
        <div class="flex flex-col gap-1 w-full">
          <span class="text-gray-500 pl-2">專案完成進度(%):</span>
          <el-slider show-input class="pl-3" v-model="ruleForm.progress" @change="handleStatusLinkage"></el-slider>
        </div>
      </el-form-item>
      <el-form-item prop="imageUrl">
        <el-input placeholder="圖片連結" v-model="ruleForm.imageUrl"></el-input>
      </el-form-item>
      <el-form-item prop="githubUrl">
        <el-input placeholder="GitHub 連結" v-model="ruleForm.githubUrl"></el-input>
      </el-form-item>
      <el-form-item prop="demoUrl">
        <el-input placeholder="Demo 連結" v-model="ruleForm.demoUrl"></el-input>
      </el-form-item>
      <el-form-item prop="createdAt">
        <el-date-picker placeholder="創建日期" v-model="ruleForm.createdAt"></el-date-picker>
      </el-form-item>
      <el-form-item prop="detailContent">
        <el-input placeholder="專案詳情" v-model="ruleForm.detailContent" type="textarea"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex w-full justify-end gap-4">
        <el-button size="large" @click="handleReset">重置</el-button>
        <el-button type="primary" size="large" @click="handleSubmit">儲存</el-button>
      </div>
    </template>
  </el-drawer>
  <ProjectTagDialog v-model="isTagSelectVisible" :initial-tags="selectedTags" @confirm="handleTagsSelect">
  </ProjectTagDialog>
</template>

<style scoped>
:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-select__wrapper) {
  border-radius: 0.5rem;
}
</style>
