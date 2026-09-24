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
    const isLoading = reactive({
      register: false,
      login: false,
      logout: false,
      userList: false,
    })
    const isUserListError = ref<boolean>(false)
    const userListErrorMessage = ref<string>('')

    const userRegister = async (data: RegisterParams) => {
      isLoading.register = true
      try {
        const res = await registerAPI(data)
        userInfo.value = res
      } finally {
        isLoading.register = false
      }
    }

    const userLogin = async (loginParams: LoginParams) => {
      isLoading.login = true
      try {
        const res = await loginAPI(loginParams)
        userInfo.value = res
        //優化： 不該講其他 store 的 fetch 寫在這裡，後續應該各個頁面所需要 fetch 的資料都寫在頁面的 onMounted 裡
        const skillStore = useSkillStore()
        await skillStore.fetchSkills(res.uid)
      } finally {
        isLoading.login = false
      }
    }

    const userLogout = async () => {
      isLoading.logout = true
      try {
        await logoutAPI()
        userInfo.value = null
      } finally {
        isLoading.logout = false
      }
    }

    const fetchAllUsers = async () => {
      isLoading.userList = true
      isUserListError.value = false

      try {
        userList.value = await getAllUsersAPI()
      } catch (error) {
        isUserListError.value = true
        userListErrorMessage.value =
          error instanceof Error && error.message ? error.message : '使用者名單載入失敗，請重新整理'
      } finally {
        isLoading.userList = false
      }
    }
    return {
      userInfo,
      userList,
      isLoading,
      isUserListError,
      userListErrorMessage,
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
