<script setup lang="ts">
import SkillTagGroupEditor from '../content/components/SkillTagGroupEditor.vue'
import { useSkillStore } from '@/stores/skillStore'

const skillStore = useSkillStore()

onMounted(async () => {
  await skillStore.fetchSkills()
})
</script>

<template>
  <div class="main-box bg-white flex-1 rounded p-6 flex flex-col gap-3">
    <div>
      <h3 class="text-lg font-bold">公共技能庫</h3>
      <p class="text-sm text-gray-500">所有使用者共用的技能標籤，僅管理員可編輯</p>
    </div>
    <SkillTagGroupEditor :skill-group-type="'public'" :skill-groups="skillStore.publicSkillGroups">
    </SkillTagGroupEditor>
  </div>
</template>
