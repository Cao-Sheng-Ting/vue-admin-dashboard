<script setup lang="ts">
import { useSkillsStore } from '@/stores/skillStore'
import { useUserStore } from '@/stores'
import { onMounted } from 'vue'
import type { MergedGroup } from '@/types/skill'
import BaseButton from '@/components/BaseButton.vue'
import { editUserSkillsAPI } from '@/services/skillService'
import BaseErrorState from '@/components/BaseErrorState.vue'

const skillStore = useSkillsStore()
const userStore = useUserStore()

const isDialogVisible = ref<boolean>(false)
const isEditMode = ref<boolean>(false)

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
  if (!newTagName.value.trim()) return


  if (!currentGroup.value) {
    ElMessage.error('系統狀態暫時異常，請稍後再試')
    return
  }

  if (!skillStore.userSkills) {
    skillStore.userSkills = {}
  }

  const key = currentGroupKey.value
  const isExists = skillStore.mergedSkillGroups[key]?.tags.some(tag => tag.name.toLowerCase() === newTagName.value.trim().toLowerCase())
  if (isExists) {
    ElMessage.warning('該分類已有相同的標籤！')
    return
  }

  if (!skillStore.userSkills[key]) {
    skillStore.userSkills[key] = {
      label: currentGroup.value.label,
      tags: [newTagName.value]
    }
    closeAddDialog()
  } else {
    skillStore.userSkills[key].tags.push(newTagName.value)
    closeAddDialog()
  }
  console.log(skillStore.userSkills)
}

const toggleEditMode = () => {
  if (!skillStore.userSkills || Object.keys(skillStore.userSkills).length === 0) {
    isEditMode.value = false
    return
  }
  isEditMode.value = !isEditMode.value
}

const isEditDisabled = computed(() => {
  const userSkills = skillStore.userSkills
  return !userSkills || Object.keys(userSkills).length === 0
})

const handleTagClose = (key: string, name: string) => {
  if (!skillStore.userSkills || !skillStore.userSkills[key]) {
    ElMessage.error('操作發生錯誤，請稍後再試')
    return
  }
  const index = skillStore.userSkills[key].tags.findIndex(t => t === name)
  skillStore.userSkills[key].tags.splice(index, 1)

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
  const uid = userStore.userInfo?.uid
  if (uid) {
    await skillStore.fetchSkills(uid)
    console.log('isError', skillStore.isError)
  } else {
    skillStore.isError = true
  }
})
</script>
<template>
  <div class="main-box bg-white flex-1 rounded p-6 flex flex-col">
    <div v-if="skillStore.isLoading">

    </div>

    <BaseErrorState v-else-if="skillStore.isError" :is-error="skillStore.isError" error-description="載入標籤庫失敗，請重新整理"
      class="h-full">
    </BaseErrorState>

    <div v-else>
      <div class="action-bar flex justify-between pb-3 px-1">
        <BaseButton @click="toggleEditMode" type="info" :plain="isEditMode ? false : true" :disabled="isEditDisabled">
          <icon-ic:round-cancel-presentation v-if="isEditMode" />
          <icon-ic:outline-edit-note v-else />
          <span>{{ isEditMode && skillStore.userSkills ? '取消' : '編輯' }}</span>
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
