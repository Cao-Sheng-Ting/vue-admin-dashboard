<script setup lang="ts">
import { useUserStore } from '@/stores'
import { formatDate, formatDateDisplay } from '@/utils/date'
import { showErrorMessage } from '@/utils/error'
import type { FormInstance } from 'element-plus'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const form = reactive({
  nickname: userInfo.value?.nickname.trim() ?? ''
})

const createdAt = computed(() => {
  return formatDateDisplay(formatDate(userInfo.value?.createdAt))
})

const ruleFormRef = ref<FormInstance>()

const rules = {
  nickname: [
    { required: true, whitespace: true, message: '請輸入用戶名稱', trigger: 'blur' }
  ]
}

const isSubmitting = ref<boolean>(false)
const handleSubmit = async () => {
  if (!ruleFormRef.value || isSubmitting.value) return

  // validate 失敗是 rejection，轉 false 才能用 if 判斷，不與 API 錯誤一起混進同一個 catch
  const isValid = await ruleFormRef.value.validate().catch(() => false)
  if (!isValid) return

  isSubmitting.value = true

  try {
    await userStore.userUpdateUserNickname(form.nickname.trim())
    ElMessage.success('更新用戶名稱成功')
  } catch (error) {
    showErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="main-box bg-white flex-1 rounded p-6 flex flex-col">
    <div class="flex flex-col max-w-xl mx-auto w-full pt-8 border-black">
      <h2 class="text-2xl font-bold mb-6">個人資料</h2>
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
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">儲存</el-button>
      </div>
    </div>
  </div>
</template>
