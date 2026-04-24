<script setup lang="ts">
import { STATUS_MAP } from '@/constants/project';
import type { ProjectItem } from '../data';

defineProps<{ data: ProjectItem }>()


const openLink = (url: string) => {
  if (url) window.open(url, '_blank')
}
</script>

<template>
  <div class="relative">
    <el-tag class="absolute top-2 right-2 z-10" :type="STATUS_MAP[data.status].type">{{
      STATUS_MAP[data.status].name }}</el-tag>
    <el-card shadow="hover" class="group">
      <template #header>
        <div class="card-header flex justify-center items-center font-bold text-xl line-clamp-2 min-h-[3.5rem]">
          <span>{{ data.title }}</span>
        </div>
      </template>
      <div class="">
        <div class="card-img aspect-video w-full overflow-hidden mb-2 ">
          <img :src="data.imageUrl" :alt="data.title"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
        </div>
      </div>
      <div class="card-content">
        <p class="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem] mb-6">{{ data.description }}</p>
      </div>
      <el-button type="primary" @click="openLink(data.demoUrl)">線上預覽</el-button>
      <el-button plain @click="openLink(data.githubUrl)">查看原始碼</el-button>
      <template #footer>
        <div class="tags flex flex-wrap gap-2 mb-5">
          <el-tag v-for="item in data.tags" :key="item">{{ item }}</el-tag>
        </div>
        <div class="progress text-center font-semibold text-gray-500">
          <div>開發進度</div>
          <el-progress :percentage="data.progress" :status="data.status === 'completed' ? 'success' : ''"
            :text-inside="true" :stroke-width="20"></el-progress>
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped></style>
