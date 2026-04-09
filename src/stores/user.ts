import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userLoginAPI, registerAPI } from '@/services/userService'
import type { LoginParams, RegisterParams, UserInfo } from '@/types/user'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const userInfo = ref<UserInfo | null>(null)

    const userRegister = async (data: RegisterParams) => {
      const res = await registerAPI(data)
      userInfo.value = res
    }

    const userLogin = async (loginParams: LoginParams) => {
      const res = await userLoginAPI(loginParams)
      token.value = res.data.accessToken
    }

    return {
      token,
      userInfo,
      userRegister,
      userLogin,
    }
  },
  {
    persist: true,
  },
)
