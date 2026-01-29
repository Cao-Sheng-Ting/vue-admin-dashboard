import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userLoginAPI, getUserInfoAPI } from '@/services/userService'
import type { UserLoginParams, UserInfo } from '@/types/user'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')

    const userLogin = async (loginParams: UserLoginParams) => {
      const res = await userLoginAPI(loginParams)
      token.value = res
    }

    const userInfo = ref<UserInfo | null>(null)

    const getUserInfo = async () => {
      const res = await getUserInfoAPI()
      userInfo.value = res
    }

    return {
      token,
      userInfo,
      userLogin,
      getUserInfo,
    }
  },
  {
    persist: true,
  },
)
