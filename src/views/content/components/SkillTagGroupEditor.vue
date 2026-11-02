<script setup lang="ts">
import type { DisplayGroup, Tag } from '@/types/skill'
import BaseButton from '@/components/BaseButton.vue'
import { useUserStore } from '@/stores'
import { useSkillStore } from '@/stores/skillStore'
import { ElMessageBox } from 'element-plus'
import BaseErrorState from '@/components/BaseErrorState.vue'
import { usePermission } from '@/composables/usePermission'
import { showErrorMessage } from '@/utils/error'
import type { UserRole } from '@/types/user'

const userStore = useUserStore()
const skillStore = useSkillStore()
const { guard, denyClass } = usePermission()


const props = defineProps<{
  skillGroupType: Tag['type']
  skillGroups: Record<string, DisplayGroup>
}>()

// 對齊 Firestore rules：公共庫僅 admin 可改，個人庫登入即可以改自己的
const requiredRole = computed<UserRole>(() => (props.skillGroupType === 'public' ? 'admin' : 'user'))

// UI 狀態控制
const isAddTagDialogVisible = ref<boolean>(false)
const isEditMode = ref<boolean>(false)
const isGroupDialogVisible = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)

// 存放當前操作的分類資料，用於新增標籤時對 store 的資料操作
const currentGroupKey = ref<string>('')
const newTagName = ref<string>('')
const groupFormModel = reactive({
  name: '',
  label: ''
})

const ruleFormRef = ref()
const rules = reactive({
  name: [
    { required: true, message: '請輸入技術代號', trigger: 'blur' }
  ],
  label: [
    { required: true, message: '請輸入技術名稱', trigger: 'blur' }
  ]
})



const openAddTagDialog = async (key: string) => {
  if (!await (guard(requiredRole.value, isBlocked.value))) return
  isAddTagDialogVisible.value = true
  currentGroupKey.value = key
}

const closeAddTagDialog = () => {
  isAddTagDialogVisible.value = false
  currentGroupKey.value = ''
  newTagName.value = ''
}

const openGroupDialog = (group?: DisplayGroup, key?: string) => {
  if (isEditMode.value && group && key) {
    groupFormModel.label = group.label
    groupFormModel.name = group.name
    currentGroupKey.value = key
  } else {
    currentGroupKey.value = crypto.randomUUID()
  }

  isGroupDialogVisible.value = true
}

const closeGroupDialog = () => {
  isGroupDialogVisible.value = false
  groupFormModel.label = ''
  groupFormModel.name = ''
  currentGroupKey.value = ''
  ruleFormRef.value?.clearValidate()
}


const handleAddTag = () => {
  const trimmedName = newTagName.value.trim()

  const success = props.skillGroupType === 'public' ?
    handlePublicAddTag(trimmedName)
    : handlePersonalAddTag(trimmedName)

  if (success) closeAddTagDialog()
}


const handlePublicAddTag = (trimmedName: string) => {
  if (!skillStore.defaultSkills) {
    ElMessage.error('資料狀態暫時異常，請重新整理頁面')
    return false
  }


  // 防禦性檢查：忽略大小寫，確保同分類下沒有名稱重複的標籤
  const isExists = skillStore.publicSkillGroups[currentGroupKey.value]?.tags.some(tag => tag.name.toLowerCase() === trimmedName.toLowerCase())
  if (isExists) {
    ElMessage.warning('該分類已有相同的標籤！')
    return false
  }

  const group = skillStore.defaultSkills[currentGroupKey.value]
  if (!group) {
    ElMessage.warning('分類不存在！')
    return false
  }

  group.tags.push(trimmedName)
  return true
}

const handlePersonalAddTag = (trimmedName: string) => {
  if (!skillStore.userSkills) {
    skillStore.userSkills = {}
  }

  // 防禦性檢查：忽略大小寫，確保同分類下沒有名稱重複的標籤
  const isExists = skillStore.mergedSkillGroups[currentGroupKey.value]?.tags.some(tag => tag.name.toLowerCase() === trimmedName.toLowerCase())
  if (isExists) {
    ElMessage.warning('該分類已有相同的標籤！')
    return false
  }

  if (!skillStore.defaultSkills) {
    ElMessage.error('資料狀態暫時異常，請重新整理頁面')
    return false
  }

  const defaultGroup = skillStore.defaultSkills[currentGroupKey.value]

  if (!defaultGroup) {
    ElMessage.error('資料狀態暫時異常，請重新整理頁面')
    return false
  }

  // 惰性建立分類：userSkills 只存放有實際內容的標籤的分類，避免寫入空分類佔用資料庫空間
  const userGroup = skillStore.userSkills[currentGroupKey.value]
  if (!userGroup) {
    skillStore.userSkills[currentGroupKey.value] = {
      name: defaultGroup.name,
      label: defaultGroup.label,
      tags: [trimmedName]
    }
  } else userGroup.tags.push(trimmedName)

  return true
}

const handleGroupDialogSubmit = async () => {
  if (!ruleFormRef.value) return
  const isValid = await ruleFormRef.value.validate().catch(() => false)
  if (!isValid) {
    console.warn('表單尚未完成')
    return
  }

  const success = isEditMode.value ? handleEditGroup() : handleAddGroup()

  if (success) closeGroupDialog()
}


const handleAddGroup = () => {
  if (!skillStore.defaultSkills) {
    ElMessage.error('系統狀態暫時異常，請重新整理頁面')
    return false
  }

  const isNameExists = Object.values(skillStore.defaultSkills).some(group => group.name.toLowerCase() === groupFormModel.name.toLowerCase())
  if (isNameExists) {
    ElMessage.warning('該分類代號已存在！')
    return false
  }

  const isLabelExists = Object.values(skillStore.defaultSkills).some(group => group.label.toLowerCase() === groupFormModel.label.toLowerCase())
  if (isLabelExists) {
    ElMessage.warning('該分類名稱已存在！')
    return false
  }

  skillStore.defaultSkills[currentGroupKey.value] = {
    name: groupFormModel.name.trim(),
    label: groupFormModel.label.trim(),
    tags: []
  }

  if (!skillStore.skillOrder) {
    ElMessage.error('資料加載異常，請重新整理頁面')
    return false
  }

  skillStore.skillOrder.push(currentGroupKey.value)
  return true
}

const handleEditGroup = () => {
  if (!skillStore.defaultSkills) {
    ElMessage.error('系統狀態暫時異常，請重新整理頁面')
    return false
  }

  const defaultGroup = skillStore.defaultSkills[currentGroupKey.value]

  if (!defaultGroup) {
    ElMessage.error('系統狀態暫時異常，請重新整理頁面')
    return false
  }

  defaultGroup.name = groupFormModel.name
  defaultGroup.label = groupFormModel.label
  return true
}

const toggleEditMode = async () => {
  if (!await (guard(requiredRole.value, isBlocked.value))) return
  isEditMode.value = !isEditMode.value
}

// 已登入且資料載入成功卻沒有內容時才禁用，
// 未登入和個人技能庫讀取失敗時要能點擊才能跳出 guard 提示
const isEditDisabled = computed(() => {
  if (props.skillGroupType === 'personal') {
    return !!userStore.userInfo &&
      !isBlocked.value &&
      Object.keys(skillStore.userSkills ?? {}).length === 0
  } else {
    return !!userStore.userInfo &&
      Object.keys(skillStore.defaultSkills ?? {}).length === 0
  }
})

// 在 personal 模式時，個人技能庫讀取失敗時，點擊編輯鍵或區域要跳出警告訊息
// public 模式時，個人技能庫的錯誤不受影響
const isBlocked = computed(() => props.skillGroupType === 'personal' && skillStore.isUserSkillsError)

const handleTagClose = async (key: string, name: string) => {
  if (!await (guard(requiredRole.value, isBlocked.value))) return
  if (props.skillGroupType === 'public') handlePublicTagClose(key, name)
  else handlePersonalTagClose(key, name)
}

const handlePublicTagClose = (key: string, name: string) => {
  if (!skillStore.defaultSkills || !skillStore.defaultSkills[key]) {
    ElMessage.error('資料異常，請重新整理頁面後再試')
    return
  }

  const index = skillStore.defaultSkills[key].tags.findIndex(t => t === name)
  if (index === -1) {
    ElMessage.warning('資料可能已過期，建議重新整理頁面')
    return
  }
  skillStore.defaultSkills[key].tags.splice(index, 1)
}

const handlePersonalTagClose = (key: string, name: string) => {
  if (!skillStore.userSkills || !skillStore.userSkills[key]) {
    ElMessage.error('資料異常，請重新整理頁面後再試')
    return
  }

  const index = skillStore.userSkills[key].tags.findIndex(t => t === name)
  if (index === -1) {
    ElMessage.warning('資料可能已過期，建議重新整理頁面')
    return
  }
  skillStore.userSkills[key].tags.splice(index, 1)

  // 若該分類已無內容則刪除該分類，避免後端儲存空的資料結構
  if (skillStore.userSkills[key].tags.length === 0) {
    delete skillStore.userSkills[key]
    if (Object.keys(skillStore.userSkills).length === 0) {
      isEditMode.value = false
    }
  }
}

const handleGroupDelete = async (key: string) => {
  if (!await (guard(requiredRole.value, isBlocked.value))) return

  try {
    await ElMessageBox.confirm('確定刪除整個分類嗎？',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await skillStore.skillGroupDelete(key)
    ElMessage.success('分類刪除成功')
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    showErrorMessage(error)
  }
}

//TODO： 增刪改分類或標籤 submit 前要髒檢查
const handleSubmit = async () => {
  if (!await (guard(requiredRole.value, isBlocked.value))) return

  if (props.skillGroupType === 'public') await handlePublicSubmit()
  else await handlePersonalSubmit()
}

const handlePublicSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    await skillStore.defaultSkillsSubmit()
    ElMessage.success('儲存成功！')
  } catch (error) {
    showErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}

const handlePersonalSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    await skillStore.editUserSkills()
    ElMessage.success('儲存成功！')
  } catch (error) {
    showErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}

</script>

<template>

  <div v-if="skillStore.isLoading">
    <div>
      <el-skeleton animated>
        <template #template>
          <div class="flex justify-between pb-3 px-1">
            <el-skeleton-item variant="button" v-for="item in 2" :key="item"
              style="width: 80px; height: 30px"></el-skeleton-item>
          </div>
        </template>
      </el-skeleton>
    </div>
    <el-space direction="vertical" fill class="w-full">
      <el-card v-for="item in 4" :key="item" class="h-">
        <el-skeleton animated>
          <template #template>
            <div class="flex flex-row items-center">
              <el-skeleton-item variant="h3" style="width: 65px"></el-skeleton-item>
              <div class="flex items-center gap-3 pl-8">
                <el-skeleton-item variant="text" style="width: 55px" v-for="item in 4" :key="item"></el-skeleton-item>
                <el-skeleton-item variant="circle" style="width: 20px; height: 20px"></el-skeleton-item>
              </div>
            </div>
          </template>
        </el-skeleton>
      </el-card>
    </el-space>
  </div>

  <BaseErrorState v-else-if="skillStore.isError" :is-error="true" :error-description="skillStore.errorMessage"
    @retry="skillStore.fetchSkills()">
  </BaseErrorState>


  <div v-else>
    <div class="action-bar flex justify-between pb-3 px-1">
      <BaseButton @click="toggleEditMode" type="info" :plain="isEditMode ? false : true" :disabled="isEditDisabled"
        :class="denyClass(requiredRole, 'button', isBlocked)">
        <icon-ic:round-cancel-presentation v-if="isEditMode" />
        <icon-ic:outline-edit-note v-else />
        <span>{{ isEditMode ? '取消' : '編輯' }}</span>
      </BaseButton>
      <el-button type="primary" @click="handleSubmit" :loading="isSubmitting"
        :class="denyClass(requiredRole, 'button', isBlocked)">儲存</el-button>
    </div>
    <el-space direction="vertical" fill class="w-full">
      <el-card v-for="(group, key) in props.skillGroups" :key="key">
        <div class="flex flex-row justify-between items-center">
          <div class="flex gap-3">
            <div class="tech-stack-label w-24 shrink-0 flex items-center whitespace-nowrap ">
              <span class="font-bold text-sky-800">{{ group.label }}</span>
              <!-- TODO： icon 加上 hover 後放大的效果 -->
              <span v-if="props.skillGroupType === 'public' && isEditMode" @click="openGroupDialog(group, key)"
                class="text-sm cursor-pointer"><icon-charm:pencil /></span>
            </div>
            <div class="tech-tags flex flex-wrap gap-3 items-center">
              <el-tag v-for="(tag, index) in group.tags" :key="index"
                :closable="isEditMode && tag.type === skillGroupType" @close="handleTagClose(key, tag.name)">{{ tag.name
                }}</el-tag>
              <icon-ph:plus-circle v-if="!isEditMode" @click="openAddTagDialog(key)"
                :class="denyClass(requiredRole, 'area', isBlocked)" />
            </div>
          </div>
          <!-- TODO： 點擊後 icon 變色 -->
          <div v-if="props.skillGroupType === 'public' && isEditMode" @click="handleGroupDelete(key)"
            class=" cursor-pointer"><icon-material-symbols:delete />
          </div>
        </div>
      </el-card>
      <el-button v-if="props.skillGroupType === 'public'" @click="openGroupDialog" class="text-xl p-5 mt-3">
        <icon-ph:plus-circle />
      </el-button>
    </el-space>
  </div>

  <el-dialog v-model="isAddTagDialogVisible" title="新增技術標籤 " top="30vh" :before-close="closeAddTagDialog">
    <el-input v-model="newTagName" placeholder="技術名稱"></el-input>
    <template #footer>
      <el-button @click="closeAddTagDialog">取消</el-button>
      <el-button type="primary" @click="handleAddTag" :disabled="!newTagName.trim()">確定</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="isGroupDialogVisible" :title="isEditMode ? '編輯技術分類' : '新增技術分類'" top="30vh"
    :before-close="closeGroupDialog">
    <div class="flex flex-col gap-2">
      <el-form ref="ruleFormRef" :model="groupFormModel" :rules="rules">
        <el-form-item prop="name">
          <el-input v-model="groupFormModel.name" placeholder="分類代號(如：frontend)"></el-input>
        </el-form-item>
        <el-form-item prop="label">
          <el-input v-model="groupFormModel.label" placeholder="分類名稱(如：前端技術)"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="closeGroupDialog">取消</el-button>
      <el-button type="primary" @click="handleGroupDialogSubmit">確定</el-button>
    </template>
  </el-dialog>

</template>
