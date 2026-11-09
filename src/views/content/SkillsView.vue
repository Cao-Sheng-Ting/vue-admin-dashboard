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
      <h3 class="text-lg font-bold">個人技能庫</h3>
      <p class="text-sm text-gray-500">公共標籤由管理員維護，所有人共用；登入後可新增屬於自己的個人標籤</p>
    </div>
    <SkillTagGroupEditor :skill-group-type="'personal'" :skill-groups="skillStore.mergedSkillGroups">
    </SkillTagGroupEditor>
  </div>
</template>
