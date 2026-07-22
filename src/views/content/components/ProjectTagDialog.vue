<script setup lang="ts">
import { useSkillStore } from '@/stores/skillStore';

const props = defineProps<{ 'initialTags': string[] }>()

const skillStore = useSkillStore()

const checkedTags = ref<string[]>([])
const isVisible = defineModel()
const emit = defineEmits<{ (e: 'confirm', tags: string[]): void }>()

const toggleTag = (tag: string) => {
  const index = checkedTags.value.indexOf(tag)
  if (index > -1) {
    checkedTags.value.splice(index, 1)
  } else {
    checkedTags.value.push(tag)
  }
}

const handelDialogOpen = () => {
  checkedTags.value = [...props.initialTags]
  isVisible.value = true
}

const handelDialogClose = (isConfirm: boolean) => {
  if (isConfirm) {
    emit('confirm', [...checkedTags.value])
    isVisible.value = false
  } else {
    isVisible.value = false
  }
}

watch(isVisible, (newVal) => {
  if (newVal) handelDialogOpen()
})
</script>
<template>
  <el-dialog v-model="isVisible" title="技術棧篩選" width="500">
    <el-space direction="vertical" fill>
      <el-card v-for="item in skillStore.mergedSkillGroups" :key="item.label">
        <div class="flex">
          <div class="tech-stack-label w-20 shrink-0 flex items-center whitespace-nowrap "><span>{{ item.label }}</span>
          </div>
          <div class="tech-tags flex flex-wrap gap-3">
            <el-check-tag v-for="(tag, index) in item.tags" :key="index" :checked="checkedTags.includes(tag.name)"
              @change="() => toggleTag(tag.name)">{{ tag.name
              }}</el-check-tag>
          </div>
        </div>
      </el-card>
    </el-space>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handelDialogClose(false)">取消</el-button>
        <el-button @click="handelDialogClose(true)">確定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
