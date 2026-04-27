<script setup lang="ts">
import { ref } from 'vue';
import ProjectsCard from './components/ProjectsCard.vue';
import { useDebounceSearch } from '@/composables/useDebounce';
import { useProjectStore } from '@/stores/projectStore';
import { STATUS_MAP, TECH_STACK_CONFIG } from '@/constants/project';

const projectStore = useProjectStore()
const keyword = useDebounceSearch()

const isTagFilterVisible = ref<boolean>(false)
const checkedTags = ref<string[]>([])

const toggleTag = (tag: string) => {
  const index = checkedTags.value.indexOf(tag)
  if (index > -1) {
    checkedTags.value.splice(index, 1)
  } else {
    checkedTags.value.push(tag)
  }
}

const handelDialogOpen = () => {
  checkedTags.value = [...projectStore.tagsFilter]
  isTagFilterVisible.value = true
}

const handelDialogClose = (isConfirm: boolean) => {
  if (isConfirm) {
    projectStore.tagsFilter = [...checkedTags.value]
    isTagFilterVisible.value = false
  } else {
    isTagFilterVisible.value = false
  }
  console.log(projectStore.tagsFilter)
}

</script>

<template>
  <div class="search-form-box bg-white p-4 mb-3 rounded">
    <el-row justify="space-between" align="middle">
      <el-col :span="12">
        <el-input placeholder="搜尋項目" v-model="keyword"></el-input>
        <el-select v-model="projectStore.statusFilter">
          <el-option v-for="(config, key) in STATUS_MAP" :key="key" :label="config.name" :value="key"></el-option>
          <el-option label="全部" value="all"></el-option>
        </el-select>
        <el-button @click="handelDialogOpen">技術棧篩選</el-button>
      </el-col>
      <el-col :span="6" class="flex justify-end">
        <el-button>新增</el-button>
        <el-button>編輯</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-tag closable v-for="tag in projectStore.tagsFilter" :key="tag">{{ tag }}</el-tag>
      </el-col>
    </el-row>
  </div>
  <div class="main-box bg-white flex-1 rounded p-6 ">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in projectStore.filteredProjects" :key="item.id"
        class="mb-5">
        <ProjectsCard :data="item"></ProjectsCard>
      </el-col>
    </el-row>
  </div>
  <el-dialog v-model="isTagFilterVisible" title="技術棧篩選" width="500">
    <el-space direction="vertical" fill>
      <el-card v-for="item in TECH_STACK_CONFIG" :key="item.label">
        <div class="flex">
          <div class="tech-stack-label w-20 shrink-0 flex items-center whitespace-nowrap "><span>{{ item.label }}</span>
          </div>
          <div class="tech-tags flex flex-wrap gap-3">
            <el-check-tag v-for="(tag, index) in item.tags" :key="index" :checked="checkedTags.includes(tag)"
              @change="() => toggleTag(tag)">{{ tag
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

<style scoped>
.main-box :deep(.el-card) {
  border-radius: 0.5rem;
}
</style>
