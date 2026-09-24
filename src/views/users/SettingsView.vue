<script setup lang="ts">
import SkillTagGroupEditor from '../content/components/SkillTagGroupEditor.vue'
import { useSkillStore } from '@/stores/skillStore'
import { useUserStore } from '@/stores/userStore.ts'


const skillStore = useSkillStore()
const userStore = useUserStore()

onMounted(async () => {
  await skillStore.fetchSkills(userStore.userInfo?.uid)
})
</script>

<template>
  <div class="main-box bg-white flex-1 rounded p-6 flex flex-col">
    <SkillTagGroupEditor :skill-group-type="'public'" :skill-groups="skillStore.publicSkillGroups">
    </SkillTagGroupEditor>
  </div>
</template>
