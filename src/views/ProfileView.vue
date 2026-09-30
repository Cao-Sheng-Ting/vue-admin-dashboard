<script setup lang="ts">
import { useUserStore } from '@/stores'
import { formatDate, formatDateDisplay } from '@/utils/date'
import { updateUserNicknameAPI } from '@/services/userService'

const userInfo = useUserStore().userInfo

const form = reactive({
  nickname: userInfo?.nickname ?? ''
})

const createdAt = computed(() => {
  return formatDateDisplay(formatDate(userInfo?.createdAt))
})

const ruleFormRef = ref()

const rules = {
  nickname: [
    { required: true, message: '請輸入用戶名稱', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!userInfo?.uid) {
    ElMessage.error('登入狀態已失效，請重新登入')
    return
  }

  if (!ruleFormRef.value) return
  const isValid = await ruleFormRef.value.validate().catch(() => false)
  if (!isValid) {
    console.warn('用戶名稱不可為空')
    return
  }
  try {
    await updateUserNicknameAPI(userInfo.uid, form.nickname)
    userInfo.nickname = form.nickname
    ElMessage.success('更新用戶名稱成功')
  } catch {
    ElMessage.error('更新用戶名稱失敗，請稍後再試')
  }
}
</script>

<template>
  <div class="main-box bg-white flex-1 rounded p-6 flex flex-col">
    <div class="flex flex-col max-w-xl mx-auto w-full pt-8 border-black">
      <h2 class="text-2xl font-bold mb-6 ">個人資料</h2>
      <el-form ref="ruleFormRef" :model="form" :rules="rules" hide-required-asterisk label-position="top">
        <el-form-item label="名稱：" prop="nickname">
          <el-input v-model="form.nickname" clearable></el-input>
        </el-form-item>
        <el-form-item label="信箱：">
          <div>{{ userInfo?.email }}</div>
        </el-form-item>
        <el-form-item label="權限：">
          <div>{{ userInfo?.role }}</div>
        </el-form-item>
        <el-form-item label="創建日期：">
          <div>{{ createdAt }}</div>
        </el-form-item>
      </el-form>
      <div class="flex w-full pb-3 justify-end">
        <el-button type="primary" @click="handleSubmit">儲存</el-button>
      </div>
    </div>
  </div>
</template>
