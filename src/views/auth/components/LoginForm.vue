<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'
import { showErrorMessage } from '@/utils/error'
import { getSafeRedirect } from '@/utils/redirect'
import type { FormInstance } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const ruleFormRef = ref<FormInstance>()
const ruleForm = ref({
  email: '',
  password: '',
})

const rules = reactive({
  email: [
    { required: true, message: '請輸入email', trigger: 'blur' },
    { type: 'email', message: 'email格式錯誤', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    {
      pattern: /^[A-Z][a-zA-Z\d]{7,11}$/,
      message: '密碼格式錯誤,需以大寫字母開頭且長度為 8~12 字元',
      trigger: 'blur',
    },
  ],
})

const login = async () => {
  if (!ruleFormRef.value) return

  const isValid = await ruleFormRef.value.validate().catch(() => false)
  if (!isValid) return

  try {
    await userStore.userLogin(ruleForm.value)
    const targetPath = route.query.redirect
    ElMessage.success('登入成功')
    router.push(getSafeRedirect(targetPath))
  } catch (error) {
    showErrorMessage(error)
  }
}

const demoAccount = async () => {
  ruleForm.value = {
    email: 'admin@example.com',
    password: 'AAA12345',
  }
  // 等待 200ms，讓使用者看到帳密被填入後再送出
  await new Promise((resolve) =>
    setTimeout(resolve, 200)
  )
  await login()
}

const viewerMode = () => {
  router.push('/')
}

</script>

<template>
  <div class="login-logo">
    <h2 class="text-3xl font-bold text-blue-900 mb-11">Admin Dashboard
      <br>
      後台管理系統
    </h2>
  </div>
  <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules">
    <el-form-item prop="email">
      <el-input size="large" placeholder="email" v-model="ruleForm.email" clearable>
        <template #prefix>
          <icon-ph:user-circle />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input type="password" show-password size="large" placeholder="密碼" v-model="ruleForm.password" clearable>
        <template #prefix>
          <icon-ph:lock-key />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item>
      <div class="login-button w-full flex justify-between">
        <el-button round size="large" type="primary" :loading="userStore.isLoading.login" class="w-36"
          @click="login">登入</el-button>
        <el-button round size="large" class="w-36" @click="router.push({ name: 'register' })">註冊</el-button>
      </div>
    </el-form-item>
    <div class="flex flex-col items-end gap-3">
      <div class="flex flex-col">
        <el-button type="success" @click="demoAccount">Demo Account</el-button>
        <div class="text-sky-900">一鍵解鎖管理員權限</div>
      </div>
      <div class="flex flex-col">
        <el-button type="info" @click="viewerMode">訪客模式</el-button>
        <div class="text-xs text-gray-500">未登入狀態瀏覽</div>
      </div>
    </div>
  </el-form>
</template>

<style scoped></style>
