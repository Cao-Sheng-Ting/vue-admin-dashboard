import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginAPI, registerAPI, logoutAPI } from '@/services/userService'
import type { LoginParams, RegisterParams, UserInfo } from '@/types/user'
import { useSkillStore } from './skillStore'
import { getAllUsersAPI } from '@/services/userService'

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref<UserInfo | null>(null)
    const userList = ref<UserInfo[]>([])

    const userRegister = async (data: RegisterParams) => {
      const res = await registerAPI(data)
      userInfo.value = res
    }

    const userLogin = async (loginParams: LoginParams) => {
      const res = await loginAPI(loginParams)
      userInfo.value = res
      const skillStore = useSkillStore()
      await skillStore.fetchSkills(res.uid)
    }

    const userLogout = async () => {
      await logoutAPI()
      userInfo.value = null
    }

    const fetchAllUsers = async () => {
      userList.value = await getAllUsersAPI()
    }
    return {
      userInfo,
      userList,
      userRegister,
      userLogin,
      userLogout,
      fetchAllUsers,
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
