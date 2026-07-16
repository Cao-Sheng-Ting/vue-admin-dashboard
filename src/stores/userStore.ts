import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginAPI, registerAPI, logoutAPI } from '@/services/userService'
import type { LoginParams, RegisterParams, UserInfo } from '@/types/user'

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref<UserInfo | null>(null)

    const userRegister = async (data: RegisterParams) => {
      const res = await registerAPI(data)
      userInfo.value = res
    }

    const userLogin = async (loginParams: LoginParams) => {
      const res = await loginAPI(loginParams)
      userInfo.value = res
    }

    const userLogout = async () => {
      await logoutAPI()
      userInfo.value = null
    }
    return {
      userInfo,
      userRegister,
      userLogin,
      userLogout,
    }
  },
  {
    persist: {
      key: 'vue-admin-user-info',
      storage: localStorage,
      pick: ['userInfo'],
    },
  },
)
