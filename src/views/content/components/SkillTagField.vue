<script setup lang="ts">
import SkillTagDialog from './SkillTagDialog.vue'
import AddButton from '@/components/AddButton.vue'

defineProps<{
  buttonText?: string
}>()

const modelValue = defineModel<string[]>({ default: [] })

const isTagDialogVisible = ref<boolean>(false)

const handleTagClose = (tag: string) => {
  modelValue.value = modelValue.value.filter((t: string) => t !== tag)
}

const handleTagsSelect = (tags: string[]) => {
  modelValue.value = tags
}

</script>

<template>
  <div class="flex flex-col gap-4 items-start">
    <AddButton @click="isTagDialogVisible = true" :button-text="buttonText"></AddButton>
    <div class="flex flex-row flex-wrap gap-2 min-h-6">
      <el-tag v-for="(tag, index) in modelValue" :key="index" closable @close="handleTagClose(tag)">{{
        tag
        }}</el-tag>
    </div>

    <SkillTagDialog v-model="isTagDialogVisible" :initial-tags="modelValue" @confirm="handleTagsSelect">
    </SkillTagDialog>
  </div>
</template>
