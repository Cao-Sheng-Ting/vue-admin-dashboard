<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const ruleFormRef = ref()
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
  await ruleFormRef.value.validate()
  try {
    await userStore.userLogin(ruleForm.value)
    const targetPath = route.query.redirect as string || '/'
    ElMessage.success('登入成功')
    router.push(targetPath)
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message || '登入時發生錯誤')
    }
  }
}

const demoAccount = async () => {
  ruleForm.value = {
    email: 'admin@example.com',
    password: 'AAA12345',
  }
  await new Promise((resolve) => setTimeout(resolve, 200))
  await login()
}
</script>

<template>
  <div class="login-logo">
    <h2 class="text-5xl mb-11">後台管理系統</h2>
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
        <el-button round size="large" color="#009688" class="w-36" @click="login">登入</el-button>
        <el-button round size="large" class="w-36" @click="router.push({ name: 'register' })">註冊</el-button>
      </div>
    </el-form-item>
    <div class="flex flex-col items-end mb-5 ">
      <el-button type="success" @click="demoAccount">Demo Account</el-button>
      <div class="text-s text-gray-500">點擊後快速登入</div>
    </div>
  </el-form>
</template>

<style scoped></style>
