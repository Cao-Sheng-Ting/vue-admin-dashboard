<script setup lang="ts">
import { useExperienceStore } from '@/stores/experienceStore'
import { useSkillStore } from '@/stores/skillStore.ts'
import type { Experience, TimelineItem, AddTimelineItemData } from '@/types/experience'
import SkillTagField from './components/SkillTagField.vue'
import { ElMessageBox } from 'element-plus'
import BaseErrorState from '@/components/BaseErrorState.vue'
import { usePermission } from '@/composables/usePermission.ts'
import { showErrorMessage } from '@/utils/error.ts'
import type { FormInstance } from 'element-plus'

const experienceStore = useExperienceStore()
const skillStore = useSkillStore()
const { guard, denyClass } = usePermission()

const currentTimeline = ref<Experience | null>(null)
const currentTimelineItem = ref<TimelineItem | null>(null)

const popoverVisibleMap = reactive<Record<string, boolean>>({})

const isTimelineDialogVisible = ref<boolean>(false)
const isEditMode = ref<boolean>(false)

// 用於防禦連續點擊提交按鈕導致重複提交
const isSubmitting = ref<boolean>(false)

const getThemeClass = (type: Experience['type']) => {
  return type === 'portfolio' ?
    {
      bg: 'bg-sky-700',
      border: 'border-sky-700',
      hoverBg: 'hover:bg-sky-700'
    } : {
      bg: 'bg-teal-700',
      border: 'border-teal-700',
      hoverBg: 'hover:bg-teal-700'
    }
}

const formatDuration = (years: TimelineItem['durationYears'], months: TimelineItem['durationMonths']) => {
  const parts: string[] = []

  if (years) parts.push(`${years}年`)
  if (months) parts.push(`${months}個月`)

  return parts.join(' ')
}

const getInitialTimelineItem = (): AddTimelineItemData => ({
  title: '',
  organization: '',
  durationYears: null,
  durationMonths: null,
  highlights: [''],
  skillTags: [],
  // members: []
})

const localForm = ref<AddTimelineItemData>(getInitialTimelineItem())

const ruleFormRef = ref<FormInstance>()

// 只驗證 career 類型
const validateDuration = (rule: unknown, value: number, callback: (error?: Error) => void) => {
  if (currentTimeline.value?.type === 'career') {
    if (!localForm.value.durationYears && !localForm.value.durationMonths) {
      callback(new Error('請至少填寫「年」或「月」其中一項'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

const validateHighlight = (rule: unknown, value: string[], callback: (error?: Error) => void) => {
  if (!value || value.length === 0) {
    callback(new Error('至少輸入一個核心亮點'))
    return
  }
  for (let i = 0; i < value.length; i++) {
    const item = value[i]?.trim() || ''
    if (item.length === 0) {
      callback(new Error(`第${i + 1}項亮點不能為空`))
      return
    }
    if (item.length < 2 || item.length > 50) {
      callback(new Error('核心亮點須介於 2-50 字之間'))
      return
    }
  }

  callback()
}

const rules = reactive({
  title: [
    { required: true, whitespace: true, message: '請輸入時間段標題', trigger: 'blur' },
    { min: 1, max: 20, message: '標題長度須在 20 字以內', trigger: 'blur' }
  ],
  organization: [
    { max: 30, message: '名稱長度須在 30 字以內', trigger: 'blur' }
  ],
  durationYears: [
    { validator: validateDuration, trigger: 'change' }
  ],
  durationMonths: [
    { validator: validateDuration, trigger: 'change' }
  ],
  highlights: [
    { validator: validateHighlight, trigger: 'blur' }
  ],
  skillTags: [
    { type: 'array', required: true, message: '至少選擇一個專案使用的技術', trigger: 'change' },
    { type: 'array', max: 20, message: '選擇使用技術上限為 20 個', trigger: 'change' }
  ]
})

// 功能：未來可以新增新的時間線
// const addExperience = async () => {
//   try {
//     if (!userStore.userInfo) return
//     const createdBy = {
//       uid: userStore.userInfo?.uid,
//       nickname: userStore.userInfo?.nickname
//     }
//     const data: AddExperienceData = {
//       type: 'portfolio',
//       timelineName: "技術棧",
//       createdBy,
//       items: []
//     }
//     await addExperienceAPI(data)
//   } catch (error) {
//     console.error(error)
//   }
// }

const openAddDialog = async (timeline: Experience) => {
  if (!await (guard('editor'))) return

  localForm.value = getInitialTimelineItem()

  isEditMode.value = false
  isTimelineDialogVisible.value = true

  currentTimeline.value = timeline
  currentTimelineItem.value = null

  ruleFormRef.value?.clearValidate()
}

const openEditDialog = async (timeline: Experience, item: TimelineItem) => {
  if (!await (guard('editor'))) return

  // item 是 Proxy，structuredClone 無法複製，改用 JSON 深拷貝
  localForm.value = JSON.parse(JSON.stringify(item))

  // 開啟 dialog 前先關閉 popover
  popoverVisibleMap[item.id] = false
  isEditMode.value = true
  isTimelineDialogVisible.value = true

  currentTimeline.value = timeline
  currentTimelineItem.value = item


  ruleFormRef.value?.clearValidate()
}

const durationYearOptions = [
  ...Array.from({ length: 10 }, (_, index) => ({
    value: index + 1,
    label: `${index + 1}年`
  })),
  {
    value: 11,
    label: '10年以上'
  }
]

const durationMonthOptions = Array.from({ length: 11 }, (_, index) => ({
  value: index + 1,
  label: `${index + 1}個月`
}))


const addHighlight = () => {
  if (localForm.value.highlights.length < 5) {
    localForm.value.highlights.push('')
  }
}

const removeHighlight = (index: number) => {
  // 第一欄必須保留
  if (index === 0) return
  localForm.value.highlights.splice(index, 1)
}

const handleTimelineItemDelete = async (timeline: Experience, id: TimelineItem['id']) => {
  if (!await (guard('editor'))) return

  try {
    await ElMessageBox.confirm('確定刪除當前項目嗎？',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      })
  } catch { return }

  if (!timeline.items.some(item => item.id === id)) {
    ElMessage.error('找不到要刪除的項目，請重新整理後再試')
    return
  }

  const nextItems = timeline.items.filter(item => item.id !== id)

  try {
    await experienceStore.updateTimeline(timeline.id, nextItems)

    ElMessage.success('刪除成功')
  }
  catch (error) {
    showErrorMessage(error)
  }
}


const handleReset = () => {
  currentTimeline.value = null
  currentTimelineItem.value = null
  localForm.value = getInitialTimelineItem()
  isEditMode.value = false
  isTimelineDialogVisible.value = false
}

const cleanForm = (form: AddTimelineItemData): AddTimelineItemData => ({
  ...form,
  title: form.title.trim(),
  organization: form.organization?.trim(),
  highlights: form.highlights.map(h => h.trim())
})

const handleSubmit = async () => {
  if (!ruleFormRef.value || isSubmitting.value || !(await guard('editor'))) return

  const isValid = await ruleFormRef.value.validate().catch(() => false)
  if (!isValid) return

  const formData = cleanForm(localForm.value)

  isSubmitting.value = true

  if (!currentTimeline.value) {
    showErrorMessage('資料異常，請重新整理後再試')
    isSubmitting.value = false
    return
  }

  const oldItems: TimelineItem[] = currentTimeline.value.items
  let nextItems: TimelineItem[]
  const currentTimelineId = currentTimeline.value.id

  if (isEditMode.value) {
    const editingId = currentTimelineItem.value?.id
    if (!editingId) {
      // 理論上不會發生，發生代表編輯流程有 bug
      showErrorMessage('系統異常，請重新整理頁面後再試')
      isSubmitting.value = false
      return
    }

    const exists = oldItems.some(item => item.id === editingId)
    if (!exists) {
      ElMessage.warning('找不到要編輯的項目，資料可能已更新，請重新整理頁面')
      isSubmitting.value = false
      return
    }

    nextItems = oldItems.map(item => item.id === editingId ? { ...formData, id: editingId, sortOrder: item.sortOrder } : item)

  } else {
    const newItem = {
      id: crypto.randomUUID(),
      ...formData,
      sortOrder: Math.max(0, ...oldItems.map(i => i.sortOrder)) + 1
    }
    nextItems = [...oldItems, newItem]
  }

  try {
    await experienceStore.updateTimeline(currentTimelineId, nextItems)
    isTimelineDialogVisible.value = false
    ElMessage.success(`${currentTimeline.value.timelineName}${isEditMode.value ? '編輯成功' : '新增成功'}`)
  }
  catch (error) {
    showErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }

}

onMounted(async () => {
  await Promise.all([
    experienceStore.fetchExperiences(),
    skillStore.fetchSkills()
  ])
})
</script>
<template>
  <div class="main-box bg-white flex-1 rounded p-6 flex flex-col">

    <div v-if="experienceStore.isLoading" class="flex flex-col gap-2">
      <el-card v-for="n in 2" :key="n">
        <el-skeleton animated>
          <template #template>
            <div class="flex flex-row flex-wrap gap-4">
              <div v-for="m in 3" :key="m" class="flex items-center">
                <el-skeleton-item variant="button" style="width:75px"></el-skeleton-item>
                <el-skeleton-item style="width: 60px; height: 6px;"></el-skeleton-item>
              </div>
            </div>
          </template>
        </el-skeleton>
      </el-card>
    </div>

    <BaseErrorState v-else-if="experienceStore.isError || experienceStore.isEmpty" :is-error="experienceStore.isError"
      :is-empty="experienceStore.isEmpty" :error-description="experienceStore.errorMessage" empty-description="經歷目前沒有內容"
      @retry="experienceStore.fetchExperiences" class="w-full">
    </BaseErrorState>


    <div v-else class="flex flex-col gap-2">
      <el-card v-for="timeline in experienceStore.timelines" :key="timeline.id">
        <div class="flex flex-row flex-wrap items-center gap-y-3">
          <div class="timeline-name text-lg p-3 rounded text-white font-bold" :class="getThemeClass(timeline.type).bg">
            {{ timeline.timelineName }}
          </div>
          <div v-for="item in timeline.items" :key="item.id" class="timeline-item flex items-center">
            <div class="h-1 w-14" :class="getThemeClass(timeline.type).bg"></div>
            <el-popover v-model:visible="popoverVisibleMap[item.id]" trigger="click" placement="top-start" :width="400">
              <template #reference>
                <div
                  class="p-3 rounded border-2 font-medium text-slate-600 hover:text-white hover:-translate-y-0.5 transition-colors duration-200 ease-out cursor-pointer"
                  :class="[getThemeClass(timeline.type).hoverBg, getThemeClass(timeline.type).border]">
                  {{ item.title }}
                </div>
              </template>
              <div class="flex flex-col gap-3">

                <div class="popover-top flex flex-row justify-between items-center pb-2">
                  <h4 class="text-xl">{{ item.title }}</h4>
                  <div>
                    <el-button @click="openEditDialog(timeline, item)" plain type="primary"
                      :class="denyClass('editor', 'button')">編輯</el-button>
                    <el-button @click="handleTimelineItemDelete(timeline, item.id)" type="danger" plain
                      :class="denyClass('editor', 'button')">刪除</el-button>
                  </div>
                </div>

                <p v-if="item.organization"><span class="font-semibold">服務單位：</span> <span>{{ item.organization
                    }}</span></p>
                <p><span class="font-semibold">使用技術：</span> <span>{{ item.skillTags.join(', ') }}</span></p>
                <p v-if="timeline.type === 'career'"><span class="font-semibold">經歷時長：</span> <span>{{
                  formatDuration(item.durationYears,
                    item.durationMonths) }}</span>
                </p>
                <p class="font-semibold">核心亮點：</p>
                <ul class="list-decimal list-inside">
                  <li v-for="(point, index) in item.highlights" :key="index">{{ point }}</li>
                </ul>
              </div>
            </el-popover>
          </div>
          <div class="h-1 w-14" :class="getThemeClass(timeline.type).bg"></div>
          <icon-ph:plus-circle class="text-xl text-slate-600 hover:scale-125 transition-all duration-200 ease-out"
            :class="denyClass('editor')" @click="openAddDialog(timeline)" />
        </div>
        <!-- 新增：時間線"創建時間"和"更新時間" -->
      </el-card>
    </div>

    <el-dialog v-model="isTimelineDialogVisible"
      :title="isEditMode ? `編輯${currentTimeline?.timelineName}` : `新增${currentTimeline?.timelineName}`"
      width="min(92%, 600px)">
      <el-form ref="ruleFormRef" :model="localForm" :rules="rules">
        <el-row>

          <el-col :span="12" class="pr-3">
            <el-form-item label="標題" prop="title">
              <el-input v-model="localForm.title" clearable></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="服務單位" prop="organization">
              <el-input v-model="localForm.organization" clearable></el-input>
            </el-form-item>
          </el-col>

        </el-row>

        <div v-if="currentTimeline?.type === 'career'" class="pb-1">
          <span class="text-red-400 pr-1">*</span>
          <span>經歷時長：</span>
        </div>
        <el-row v-if="currentTimeline?.type === 'career'">

          <el-col :span="12" class="pr-1">
            <el-form-item prop="durationYears">
              <el-select v-model="localForm.durationYears" placeholder="年">
                <el-option v-for="item in durationYearOptions" :key="item.value" :value="item.value"
                  :label="item.label"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12" class="pr-1">
            <el-form-item prop="durationMonths">
              <el-select v-model="localForm.durationMonths" placeholder="月">
                <el-option v-for="item in durationMonthOptions" :key="item.value" :value="item.value"
                  :label="item.label"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item prop="skillTags">
              <SkillTagField v-model="localForm.skillTags"></SkillTagField>
            </el-form-item>
          </el-col>
        </el-row>


        <div class="pb-1">
          <span class="text-red-400 pr-1">*</span>
          <span>核心亮點：</span>
        </div>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="highlights" class="highlights-item">
              <div class="grid grid-cols-2 gap-4 w-full pb-3">

                <div v-for="(item, index) in localForm.highlights" :key="index" class="flex items-center gap-2">
                  <el-input placeholder="經歷期間的『學習成果』與『具體成就』" v-model="localForm.highlights[index]" clearable
                    class="flex-1"></el-input>
                  <icon-ph:trash class="shrink-0 transition-all duration-200 hover:scale-125"
                    :class="index === 0 ? 'invisible' : 'cursor-pointer'" @click="removeHighlight(index)" />
                </div>

                <div v-if="localForm.highlights.length < 5" class="flex h-full items-center justify-start text-lg">
                  <icon-ph:plus-circle @click="addHighlight" />
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- <el-row>
          <el-col :span="24">
            <el-form-item prop="members"></el-form-item>
          </el-col>
        </el-row> -->
      </el-form>
      <template #footer>
        <el-button @click="handleReset">取消</el-button>
        <el-button @click="handleSubmit" type="primary" :loading="isSubmitting">儲存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.highlights-item :deep(.el-form-item__error) {
  position: static;
}
</style>
