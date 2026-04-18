<script setup lang="ts">
import ProjectsCard from './components/ProjectsCard.vue';
import { projectList } from './data';

</script>

<template>
  <div class="search-form-box bg-white p-4 mb-3 rounded">
    <el-row justify="space-between" align="middle">
      <el-col :span="12">
        <el-input placeholder="搜尋項目"></el-input>
      </el-col>
      <el-col :span="6" class="flex justify-end">
        <el-button>新增</el-button>
        <el-button>編輯</el-button>
      </el-col>
    </el-row>
  </div>
  <div class="main-box bg-white flex-1 rounded p-6 ">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in projectList" :key="item.id" class="mb-5">
        <ProjectsCard :data="item"></ProjectsCard>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.main-box :deep(.el-card) {
  border-radius: 0.5rem;
}
</style>
