<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useUserStore } from './stores'
import { useSkillStore } from './stores/skillStore';
import { onMounted } from 'vue';

const userStore = useUserStore()
const skillStore = useSkillStore()

onMounted(async () => {
  if (userStore.userInfo?.uid) {
    await skillStore.fetchSkills(userStore.userInfo.uid)
  }
})
</script>

<template>
  <RouterView />
</template>

<style></style>
