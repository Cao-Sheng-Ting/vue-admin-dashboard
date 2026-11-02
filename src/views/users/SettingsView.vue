<script setup lang="ts">
import SkillTagGroupEditor from '../content/components/SkillTagGroupEditor.vue'
import { useSkillStore } from '@/stores/skillStore'

const skillStore = useSkillStore()

onMounted(async () => {
  await skillStore.fetchSkills()
})
</script>

<template>
  <div class="main-box bg-white flex-1 rounded p-6 flex flex-col">
    <SkillTagGroupEditor :skill-group-type="'public'" :skill-groups="skillStore.publicSkillGroups">
    </SkillTagGroupEditor>
  </div>
</template>
