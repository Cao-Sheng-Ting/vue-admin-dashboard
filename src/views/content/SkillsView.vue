<script setup lang="ts">
import { useSkillStore } from '@/stores/skillStore'
import { useUserStore } from '@/stores'
import { onMounted } from 'vue'
import type { MergedGroup } from '@/types/skill'
import BaseButton from '@/components/BaseButton.vue'
import { editUserSkillsAPI } from '@/services/skillService'
import BaseErrorState from '@/components/BaseErrorState.vue'

const skillStore = useSkillStore()
const userStore = useUserStore()

// UI 狀態控制
const isDialogVisible = ref<boolean>(false)
const isEditMode = ref<boolean>(false)

// 存放當前操作的分類資料，用於新增標籤時對 store 的資料操作
const currentGroupKey = ref<string>('')
const currentGroup = ref<MergedGroup | null>(null)
const newTagName = ref<string>('')

const openAddDialog = (group: MergedGroup, key: string) => {
  isDialogVisible.value = true
  currentGroupKey.value = key
  currentGroup.value = group
}

const closeAddDialog = () => {
  isDialogVisible.value = false
  currentGroupKey.value = ''
  currentGroup.value = null
  newTagName.value = ''
}

const handleAddTag = () => {
  const trimmedName = newTagName.value.trim()
  if (!trimmedName) return

  if (!currentGroup.value) {
    ElMessage.error('系統狀態暫時異常，請稍後再試')
    return
  }

  if (!skillStore.userSkills) {
    skillStore.userSkills = {}
  }

  const key = currentGroupKey.value

  // 防禦性檢查：忽略大小寫，確保同分類下沒有名稱重複的標籤
  const isExists = skillStore.mergedSkillGroups[key]?.tags.some(tag => tag.name.toLowerCase() === trimmedName.toLowerCase())
  if (isExists) {
    ElMessage.warning('該分類已有相同的標籤！')
    return
  }

  // 惰性建立分類：userSkills 只存放有實際內容的標籤的分類，避免寫入空分類佔用資料庫空間
  if (!skillStore.userSkills[key]) {
    skillStore.userSkills[key] = {
      label: currentGroup.value.label,
      tags: [trimmedName]
    }
    closeAddDialog()
  } else {
    skillStore.userSkills[key].tags.push(trimmedName)
    closeAddDialog()
  }
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

// 資料源不存在或沒有內容時編輯鍵禁用
const isEditDisabled = computed(() => {
  const userSkills = skillStore.userSkills
  return !userSkills || Object.keys(userSkills).length === 0
})

const handleTagClose = (key: string, name: string) => {
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

const handleSubmit = async () => {
  if (!userStore.userInfo) {
    ElMessage.error('登入狀態已失效，請重新登入')
    return
  }
  if (!skillStore.userSkills) {
    ElMessage.error('目前無法儲存，請重新整理頁面後再試')
    return
  }
  try {
    await editUserSkillsAPI(skillStore.userSkills, userStore.userInfo.uid)
    ElMessage.success('儲存成功！')
  } catch {
    ElMessage.error('發生預期外的錯誤，請重新整理頁面')
  }
}

onMounted(async () => {
  await skillStore.fetchSkills(userStore.userInfo?.uid)
})
</script>
<template>

  <div class="main-box bg-white flex-1 rounded p-6 flex flex-col">

    <div v-if="skillStore.isLoading">
      <el-skeleton animated>
        <template #template>
          <div class="flex justify-between pb-3 px-1">
            <el-skeleton-item variant="button"></el-skeleton-item>
            <el-skeleton-item variant="button"></el-skeleton-item>
          </div>
          <el-space direction="vertical" fill class="w-full ">
            <el-card v-for="i in 3" :key="i">
              <div class="flex gap-3 items-center py-1">
                <el-skeleton-item variant="h4" style="width: 15%"></el-skeleton-item>
                <el-skeleton-item variant="text"></el-skeleton-item>
              </div>
            </el-card>
          </el-space>
        </template>
      </el-skeleton>
    </div>

    <BaseErrorState v-else-if="skillStore.isError" :is-error="skillStore.isError" error-description="載入標籤庫失敗，請重新整理"
      @retry="skillStore.fetchSkills(userStore.userInfo?.uid)" class="h-full">
    </BaseErrorState>

    <div v-else>

      <div class="action-bar flex justify-between pb-3 px-1">
        <BaseButton @click="toggleEditMode" type="info" :plain="isEditMode ? false : true" :disabled="isEditDisabled">
          <icon-ic:round-cancel-presentation v-if="isEditMode" />
          <icon-ic:outline-edit-note v-else />
          <span>{{ isEditMode ? '取消' : '編輯' }}</span>
        </BaseButton>
        <el-button type="primary" @click="handleSubmit">儲存</el-button>
      </div>

      <el-space direction="vertical" fill class="w-full">
        <el-card v-for="(group, key) in skillStore.mergedSkillGroups" :key="key">
          <div class="flex gap-3">
            <div class="tech-stack-label w-20 shrink-0 flex items-center whitespace-nowrap "><span>{{ group.label
                }}</span>
            </div>
            <div class="tech-tags flex flex-wrap gap-3 items-center">
              <el-tag v-for="(tag, index) in group.tags" :key="index" :closable="isEditMode && tag.removable"
                @close="handleTagClose(key, tag.name)">{{ tag.name
                }}</el-tag>
              <icon-ph:plus-circle v-if="!isEditMode" @click="openAddDialog(group, key)" class="cursor-pointer" />
            </div>
          </div>
        </el-card>
      </el-space>

    </div>

  </div>

  <el-dialog v-model="isDialogVisible" title="新增技術標籤" top="30vh" :before-close="closeAddDialog">
    <el-input v-model="newTagName" placeholder="技術名稱"></el-input>
    <template #footer>
      <el-button @click="closeAddDialog">取消</el-button>
      <el-button type="primary" @click="handleAddTag" :disabled="!newTagName.trim()">確定</el-button>
    </template>
  </el-dialog>

</template>
