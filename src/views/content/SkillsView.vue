<script setup lang="ts">
import { useSkillsStore } from '@/stores/skillStore'
import { useUserStore } from '@/stores'
import { onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import type { MergedGroup } from '@/types/skill'






const skillStore = useSkillsStore()
const userStore = useUserStore()

const isDialogVisible = ref<boolean>(false)
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
  console.log(skillStore.userSkills)

  const key = currentGroupKey.value
  if (!skillStore.userSkills[key]) {
    console.log('沒值')
    skillStore.userSkills[key] = {
      label: currentGroup.value.label,
      tags: [newTagName.value]
    }
    closeAddDialog()
  } else {
    skillStore.userSkills[key].tags.push(newTagName.value)
    closeAddDialog()
  }
}




onMounted(async () => {
  try {
    const uid = userStore.userInfo?.uid
    if (uid) {
      await skillStore.fetchSkills(uid)
    }
  } catch (error) {
    console.log(error)
  }
})
</script>
<template>
  <div class="main-box bg-white flex-1 rounded p-6 ">
    <el-space direction="vertical" fill class="w-full">
      <el-card v-for="(group, key) in skillStore.mergedSkillGroups" :key="key">
        <div class="flex gap-3">
          <div class="tech-stack-label w-20 shrink-0 flex items-center whitespace-nowrap "><span>{{ group.label
              }}</span>
          </div>
          <div class="tech-tags flex flex-wrap gap-3 items-center">
            <el-tag v-for="(tag, index) in group.tags" :key="index">{{ tag.name
              }}</el-tag>
            <icon-ph:plus-circle @click="openAddDialog(group, key)" class="cursor-pointer" />
          </div>
        </div>
      </el-card>
    </el-space>
  </div>
  <el-dialog v-model="isDialogVisible" title="新增技術標籤" top="30vh" :before-close="closeAddDialog">
    <el-input v-model="newTagName" placeholder="技術名稱"></el-input>
    <template #footer>
      <el-button @click="closeAddDialog">取消</el-button>
      <el-button type="primary" @click="handleAddTag" :disabled="!newTagName.trim()">確定</el-button>
    </template>
  </el-dialog>
</template>
