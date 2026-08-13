<script setup lang="ts">
import { useExperienceStore } from '@/stores/experienceStore'
import type { Experience, TimelineItem, AddTimelineItemData, AddExperienceData } from '@/types/experience.js'
import SkillTagField from './components/SkillTagField.vue'
import { addExperienceAPI, updateExperienceAPI } from '@/services/experienceService.ts'
import { sortOrders } from 'element-plus/es/components/table-v2/src/constants.mjs'
// import { useUserStore } from '@/stores/userStore.ts'

// const userStore = useUserStore(0)

const experienceStore = useExperienceStore()

const currentTimeline = ref<Experience | null>(null)
const currentTimelineItem = ref<TimelineItem | null>(null)

const popoverVisibleMap = reactive<Record<string, boolean>>({})

const isTimelineDialogVisible = ref<boolean>(false)
const isEditMode = ref<boolean>(false)

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

type TimelineItemFormState = AddTimelineItemData & Partial<Pick<TimelineItem, 'id' | 'sortOrder'>>
const localForm = ref<TimelineItemFormState>(getInitialTimelineItem())

const ruleFormRef = ref()

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
    if (item.length < 3 || item.length > 50) {
      callback(new Error('核心亮點須介於 3-50 字之間'))
      return
    }
  }

  callback()
}

const rules = reactive({
  title: [
    { required: true, message: '請輸入時間段標題', trigger: 'blur' },
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
//     console.log('新增成功')
//   } catch (error) {
//     console.error(error)
//   }
// }

const openAddDialog = (timeline: Experience) => {
  localForm.value = getInitialTimelineItem()

  isEditMode.value = false
  isTimelineDialogVisible.value = true

  currentTimeline.value = timeline
  currentTimelineItem.value = null

  ruleFormRef.value?.clearValidate()
}

const openEditDialog = (timeline: Experience, item: TimelineItem) => {
  localForm.value = structuredClone(toRaw(item))

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

const handleRest = () => {
  currentTimeline.value = null
  currentTimelineItem.value = null
  localForm.value = getInitialTimelineItem()
  isEditMode.value = false
  isTimelineDialogVisible.value = false
}

const handleSubmit = async () => {
  if (!ruleFormRef.value) return

  const isValid = await ruleFormRef.value.validate()
  if (!isValid) {
    console.warn('表單驗證未通過')
    return
  }

  try {
    if (currentTimeline.value) {
      const oldItems = currentTimeline.value?.items

      const newItem = {
        id: crypto.randomUUID(),
        ...localForm.value,
        sortOrder: (oldItems?.length ?? 0) + 1
      }

      const updatedItems = [
        ...(oldItems ?? []),
        newItem
      ]

      const currentId = currentTimeline.value.id
      const result = await updateExperienceAPI(currentId, updatedItems)

      const foundItem = experienceStore.timelineMap?.find(item => item.id === currentId)

      if (foundItem) {
        foundItem.items = result.items
      }

      ElMessage.success(`${currentTimeline.value.timelineName}新增成功`)
    }
  } catch (error) {
    console.error('經歷內容更新失敗：', error)
    ElMessage.error('新增失敗，請稍後再試')
  } finally {
    isTimelineDialogVisible.value = false
  }
}

onMounted(async () => {
  await experienceStore.fetchExperiences()
})
</script>
<template>
  <div class="main-box bg-white flex-1 rounded p-6 flex flex-col">
    <!-- <el-button @click="addExperience">新增</el-button> -->
    <div class="flex flex-col gap-2">
      <el-card v-for="timeline in experienceStore.timelineMap" :key="timeline.id">
        <div class="flex flex-row flex-wrap items-center gap-y-3">
          <div class="timeline-name text-l p-3 rounded  text-white font-bold" :class="getThemeClass(timeline.type).bg">
            {{ timeline.timelineName }}
          </div>
          <div v-for="item in timeline.items" :key="item.id" class="timeline-item flex items-center">
            <div class="h-1 w-14" :class="getThemeClass(timeline.type).bg"></div>
            <el-popover v-model:visible="popoverVisibleMap[item.id]" trigger="click" placement="top-start" :width="400">
              <template #reference>
                <div
                  class="p-3 rounded border-2  text--700 font-medium text-slate-600 hover:text-white hover:-translate-y-0.5 transition-colors duration-200 ease-out cursor-pointer"
                  :class="[getThemeClass(timeline.type).hoverBg, getThemeClass(timeline.type).border]">
                  {{ item.title }}
                </div>
              </template>
              <div class="flex flex-col gap-3">

                <div class="popover-top flex flex-row justify-between items-center pb-2">
                  <h4 class="text-xl">{{ item.title }}</h4>
                  <el-button @click="openEditDialog(timeline, item)" plain type="primary">編輯</el-button>
                </div>

                <p v-if="item.organization"><span class="font-semibold">服務單位：</span> <span>{{ item.organization
                }}</span></p>
                <p><span class="font-semibold">使用技術：</span> <span>{{ item.skillTags.join(', ') }}</span></p>
                <p v-if="timeline.type === 'career'"><span class="font-semibold">經歷時長：</span> <span>{{
                  formatDuration(item.durationYears,
                    item.durationMonths) }}</span>
                </p>
                <p class="font-semibold">核心亮點：</p>
                <!-- <p v-for="(point, index) in item.highlights" :key="index">{{ index + 1 }}. {{ point }}</p> -->
                <ul class="list-decimal list-inside">
                  <li v-for="(point, index) in item.highlights" :key="index">{{ point }}</li>
                </ul>
              </div>
            </el-popover>
          </div>
          <div class="h-1 w-14" :class="getThemeClass(timeline.type).bg"></div>
          <icon-ph:plus-circle
            class="text-xl text-slate-600 hover:text-2xl transition-all duration-200 ease-out cursor-pointer"
            @click="openAddDialog(timeline)" />
        </div>
      </el-card>
    </div>

    <el-dialog v-model="isTimelineDialogVisible" :title="`新增${currentTimeline?.timelineName}`" class="min-w-[600px]">
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
                <el-input v-for="(item, index) in localForm.highlights" :key="index" placeholder="經歷期間的『學習成果』與『具體成就』"
                  v-model="localForm.highlights[index]" clearable class="w-full"></el-input>

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
        <el-button @click="handleRest">取消</el-button>
        <el-button @click="handleSubmit" type="primary">儲存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.highlights-item :deep(.el-form-item__error) {
  position: static;
}
</style>
