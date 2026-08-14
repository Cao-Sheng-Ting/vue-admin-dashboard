<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import type { ProjectItem, AddProjectData, ProjectStatus, EditProjectData } from '@/types/project'
import SkillTagField from './SkillTagField.vue'
import ProjectStatusSelect from './ProjectStatusSelect.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { addProjectAPI, editProjectAPI } from '@/services/projectService.ts'
import { formatDate } from '@/utils/date.ts'

// ============================================================================
// Models (組件通訊區)
// ============================================================================
const cardData = defineModel<ProjectItem | null>('card-data', { required: true })
const isDrawerVisible = defineModel<boolean>('visible', { default: false })
const isProjectEdit = defineModel<boolean>('edit-mode', { default: false })

// ============================================================================
// Form Validation Rules (表單驗證規則配置)
// ============================================================================
const ruleFormRef = ref()
const rules = reactive({
  title: [
    { required: true, message: '請輸入標題', trigger: 'blur' },
    { min: 3, max: 100, message: '標題長度須介於 3 到 100 字之間', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '請輸入專案描述', trigger: 'blur' },
    { max: 100, message: '專案描述須在 100 字以內', trigger: 'blur' }
  ],
  imageUrl: [{ type: 'url', message: '請輸入有效的網址 (需包含 http:// 或 https://)', trigger: 'blur' }],
  skillTags: [
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
  detailContent: [{ max: 3000, message: '專案詳情內容過長，須在 3000 字以內', trigger: 'blur' }]
})

// ============================================================================
// Local State (內部響應式狀態)
// ============================================================================

// 專案表單初始化狀態，status 暫時允許 string 以處理 UI 的空值狀態
type InitialProject = Omit<AddProjectData, 'status'> & { status: string }

const getInitialProject = (): InitialProject => ({
  title: '',
  description: '',
  imageUrl: '',
  skillTags: [],
  status: '',
  progress: 0,
  githubUrl: '',
  demoUrl: '',
  buildDate: null, // 日期組件清空時的 null 型態，避免髒檢查誤判
  detailContent: ''
})

// 表單的響應式狀態，合併了初始化狀態與增加編輯所需的 ID
type ProjectFormState = InitialProject & Partial<Pick<ProjectItem, 'id'>>

const localForm = ref<ProjectFormState>(getInitialProject())

// 狀態連動的歷史進度暫存變數
const lastProgress = ref<number>(localForm.value.progress)

// 用於強制重新渲染表單的唯一識別 Key
const formKey = ref<number>(0)

// ============================================================================
// Watchers (資料流監聽與防禦)
// ============================================================================

//監聽外部傳入的專案資料在編輯模式下以進行同步
watch(cardData, (newVal) => {
  if (newVal && isProjectEdit.value) {

    const rawData = toRaw(newVal)
    const { createdAt: _createdAt, updatedAt: _updatedAt, ...restData } = rawData

    localForm.value = {
      ...restData,
      buildDate: newVal.buildDate ? formatDate(newVal.buildDate) : null,
      skillTags: newVal.skillTags ? [...rawData.skillTags] : []
    }
    //將進度暫存與資料同步綁在同一微任務節點，防禦連續點擊不同卡片時，isDrawerVisible 監聽器觸發順序不確定導致的時序競態
    lastProgress.value = localForm.value.progress
  }
}, {
  immediate: true,
  deep: true
})

//監聽 Drawer 打開時的預防性狀態重置
watch(isDrawerVisible, async (newVal) => {
  if (newVal) {
    if (!isProjectEdit.value) lastProgress.value = 0 // 確保新增模式下， Drawer 打開時不殘留上次操作的暫存數值
    await nextTick()
    ruleFormRef.value?.clearValidate() // 確保 DOM 渲染完後確實清除歷史驗證紅字
  }
})

// ============================================================================
// Methods / Event Handlers (事件處理函式)
// ============================================================================

// 業務連動：收動切換狀態時觸發進度調整
const handleStatusChange = (newStatus: ProjectStatus) => {
  if (newStatus === 'completed') {
    localForm.value.progress = 100
  } else { localForm.value.progress = lastProgress.value }
}

const handleProgressChange = (val: number) => {
  lastProgress.value = val
}

const handleReset = () => {
  ElMessageBox.confirm(
    '確定要重置表單嗎？',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      if (!isProjectEdit.value) {
        localForm.value = getInitialProject()
      } else {
        if (cardData.value) {
          localForm.value = structuredClone(toRaw(cardData.value))
        } else {
          console.warn('編輯模式下找不到原始資料，使用初始化資料替代')
          localForm.value = getInitialProject()
        }
      }
      // 強制觸發 舊表單 Unmount / 新表單 Mount
      // 達到零副作用重置 UI 臨時狀態(驗證紅字)
      formKey.value++
      ElMessage.success('重置成功')
    } catch (error) {
      console.error('重置表單發生錯誤:', error)
      ElMessage.error('重置失敗，請稍後再試')
    }
  }
  )
}

// --- 表單操作 ---
const getEditableData = (data: ProjectItem | ProjectFormState | null): InitialProject => {
  if (!data) return getInitialProject()
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = ('createdAt' in data ? data : { ...data, createdAt: undefined, updatedAt: undefined })
  return {
    ...rest,
    buildDate: formatDate(data.buildDate)
  }
}

//髒檢查邏輯
const isDirty = computed(() => {
  const currentData = getEditableData(localForm.value)
  const baseData = getEditableData(cardData.value)

  if (!isProjectEdit.value) {
    return JSON.stringify(currentData) !== JSON.stringify(getInitialProject())
  } else {
    console.log('表單內容', JSON.stringify(currentData))
    console.log('原始內容', JSON.stringify(baseData))
    return JSON.stringify(currentData) !== JSON.stringify(baseData)
  }
})


const handleDrawerClose = () => {

  //封裝重複的關閉重置邏輯
  const closeDrawerAndReset = () => {
    localForm.value = getInitialProject()
    cardData.value = null
    isDrawerVisible.value = false
  }

  if (isDirty.value) {
    ElMessageBox.confirm(
      '確定要捨棄目前修改的內容嗎？',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(() => { closeDrawerAndReset() }).catch(() => { })
  } else {
    closeDrawerAndReset()
  }
}

const toAddAPIPayload = (form: ProjectFormState): AddProjectData => {
  return {
    ...form,
    status: form.status as ProjectStatus
  }
}

const toEditAPIPayload = (form: ProjectFormState): EditProjectData => {
  return {
    ...form,
    id: form.id!,
    status: form.status as ProjectStatus,
  }
}

const emit = defineEmits(['project-added', 'project-updated'])

const handleAddProject = async (form: AddProjectData) => {
  const project = await addProjectAPI(form)
  emit('project-added', project)
  ElMessage.success('專案新增成功')
}

const handleEditProject = async (form: EditProjectData) => {
  const project = await editProjectAPI(form)
  emit('project-updated', project)
  ElMessage.success('專案更新成功')
}

const handleSubmit = async () => {
  if (!ruleFormRef.value) return

  const isValid = await ruleFormRef.value.validate().catch(() => false)
  if (!isValid) {
    console.warn('表單驗證未通過')
    return
  }
  try {
    if (!isProjectEdit.value) {
      await handleAddProject(toAddAPIPayload(localForm.value))
    } else {
      await handleEditProject(toEditAPIPayload(localForm.value))
    }
    isDrawerVisible.value = false
    localForm.value = getInitialProject()
    cardData.value = null
  } catch (error) {
    console.error(isProjectEdit.value ? '更新專案錯誤' : '新增專案錯誤', error)
    ElMessage.error(isProjectEdit.value ? '更新專案發生錯誤，請稍後再試' : '新增專案發生錯誤，請稍後再試')
  }
}

// ============================================================================
// Computed Properties (自適應 Drawer 寬度計算)
// ============================================================================

const { width } = useWindowSize();

const responsiveSize = computed(() => {
  if (width.value < 640) return '100%' //Mobile
  if (width.value < 1024) return '65%' //Tablet
  return '700px' //Desktop
})

</script>

<template>
  <el-drawer :before-close="handleDrawerClose" v-model="isDrawerVisible" :show-close="true" :size="responsiveSize"
    style="--el-drawer-bg-color: var(--el-fill-color-light);">

    <template #header>
      <h2 class="text-3xl text-slate-700 border-b-2 border-gray-100 pt-2 pb-4">{{ isProjectEdit ? '編輯專案' : '新增專案' }}
      </h2>
    </template>

    <!-- 專案基本資訊欄位 -->
    <el-form ref="ruleFormRef" :model="localForm" :rules="rules" :key="formKey">
      <el-form-item prop="title">
        <el-input placeholder="標題" v-model="localForm.title" class="rounded-lg"></el-input>
      </el-form-item>

      <el-form-item prop="description">
        <el-input placeholder="專案描述" v-model="localForm.description" type="textarea"></el-input>
      </el-form-item>

      <!-- 技術標籤選擇與展示區 -->
      <el-form-item prop="skillTags">
        <SkillTagField v-model="localForm.skillTags"></SkillTagField>
      </el-form-item>

      <!-- 狀態與進度連動區 -->
      <el-form-item prop="status">
        <ProjectStatusSelect v-model="localForm.status" @change="handleStatusChange"></ProjectStatusSelect>
      </el-form-item>

      <el-form-item prop="progress">
        <div class="flex flex-col gap-1 w-full">
          <span class="text-gray-500 pl-2">專案完成進度(%):</span>
          <el-slider show-input class="pl-3" v-model="localForm.progress" @change="handleProgressChange"></el-slider>
        </div>
      </el-form-item>

      <!-- 連結與日期欄位 -->
      <el-form-item prop="imageUrl">
        <el-input placeholder="圖片連結" v-model="localForm.imageUrl"></el-input>
      </el-form-item>
      <el-form-item prop="githubUrl">
        <el-input placeholder="GitHub 連結" v-model="localForm.githubUrl"></el-input>
      </el-form-item>

      <el-form-item prop="demoUrl">
        <el-input placeholder="Demo 連結" v-model="localForm.demoUrl"></el-input>
      </el-form-item>

      <el-form-item prop="buildDate">
        <el-date-picker placeholder="創建日期" v-model="localForm.buildDate"></el-date-picker>
      </el-form-item>

      <el-form-item prop="detailContent">
        <el-input placeholder="專案詳情" v-model="localForm.detailContent" type="textarea"></el-input>
      </el-form-item>
    </el-form>

    <!-- 底部操作按鍵 -->
    <template #footer>
      <div class="flex w-full justify-end gap-4">
        <el-button size="large" @click="handleReset">重置</el-button>
        <el-button :disabled="!isDirty" type="primary" size="large" @click="handleSubmit">儲存</el-button>
      </div>
    </template>
  </el-drawer>

</template>

<style scoped>
/* 在 scoped 限制下使用 :deep() 穿透才能覆寫樣式 */
:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-select__wrapper) {
  border-radius: 0.5rem;
}
</style>
