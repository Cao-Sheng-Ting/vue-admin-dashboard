<script setup lang="ts">
import { useUserStore } from '@/stores'
import { sortByRoleOrder } from '@/utils/sort'
import { USER_SORT_ORDER } from '@/constants/auth'
import { formatDateDisplay } from '@/utils/date'
import type { UserRole, UserInfo } from '@/types/user'
import { ROLE_OPTIONS } from '@/constants/auth'
import { changeUserRoleAPI } from '@/services/userService'
import BaseErrorState from '@/components/BaseErrorState.vue'
import { ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const sortedUserList = computed(() => {
  return sortByRoleOrder(userStore.userList, USER_SORT_ORDER)
})

const handleRoleChange = async (row: UserInfo, newRole: UserRole) => {
  if (newRole === row.role) return
  try {
    await ElMessageBox.confirm('確定更改此用戶權限嗎？', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await changeUserRoleAPI(row.uid, newRole)

    const user = userStore.userList.find(user => user.uid === row.uid)
    if (user) user.role = newRole

    ElMessage.success('更新權限成功')
  } catch (error) {
    if (error === 'cancel') return
    ElMessage.error((error as Error).message)
  }
}

onMounted(async () => {
  await userStore.fetchAllUsers()
})
</script>

<template>
  <div class="main-box bg-white flex-1 rounded p-6 flex flex-col gap-8">

    <div v-if="userStore.isLoading.userList">
      <div class="p-5">
        <el-skeleton :rows="8" animated></el-skeleton>
      </div>
    </div>

    <BaseErrorState v-else-if="userStore.isUserListError" :is-error="userStore.isUserListError"
      :error-description="userStore.userListErrorMessage" @retry="userStore.fetchAllUsers">
    </BaseErrorState>

    <div v-else>
      <el-table :data="sortedUserList">
        <el-table-column prop="nickname" label="用戶"></el-table-column>
        <el-table-column label="權限">
          <template #default="{ row }">
            <el-select v-if="userStore.userInfo?.role === 'admin'" :disabled="userStore.userInfo?.uid === row.uid"
              :model-value="row.role" @change="(newRole: UserRole) => handleRoleChange(row, newRole)">
              <el-option v-for="option in ROLE_OPTIONS" :key="option.role" :value="option.role"
                :label="option.label"></el-option>
            </el-select>
            <span v-else>{{ row.role }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="email"></el-table-column>
        <el-table-column label="註冊時間">
          <template #default="{ row }">
            {{ formatDateDisplay(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

  </div>
</template>

<style scoped>
:deep(.el-table__cell) {
  padding: 20px 0;
}
</style>
