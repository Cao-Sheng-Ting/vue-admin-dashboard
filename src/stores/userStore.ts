import { defineStore } from 'pinia'
import {
  loginAPI,
  registerAPI,
  logoutAPI,
  updateUserNicknameAPI,
  fetchUserInfoAPI,
  getAllUsersAPI,
  changeUserRoleAPI,
} from '@/services/userService'
import type { LoginParams, RegisterParams, UserInfo, UserRole } from '@/types/user'
import { AppError, getErrorMessage } from '@/utils/error'

export const useUserStore = defineStore('user', () => {
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

  const userLogin = async (loginParams: LoginParams) => {
    isLoading.login = true
    try {
      const res = await loginAPI(loginParams)
      userInfo.value = res
    } finally {
      isLoading.login = false
    }
  }

  const userRegister = async (data: RegisterParams, authCode?: string) => {
    isLoading.register = true
    try {
      const res = await registerAPI(data, authCode)
      userInfo.value = res
    } finally {
      isLoading.register = false
    }
  }

  const userLogout = async () => {
    if (isLoading.logout) return
    isLoading.logout = true
    try {
      await logoutAPI()
      userInfo.value = null
      userList.value = []
      isUserListError.value = false
      userListErrorMessage.value = ''
    } finally {
      isLoading.logout = false
    }
  }

  const fetchAllUsers = async () => {
    isLoading.userList = true
    isUserListError.value = false

    //TODO： 這裡用 reactive 管理 Loading 狀態，與 handleFetchFailure 接收參數不符，需再做調整
    try {
      userList.value = await getAllUsersAPI()
    } catch (error) {
      // catch 後切換狀態和存放 message 供頁面渲染並持續顯示，
      // 不像登入只需 toast 一次，因此不需再把 error 往上拋
      isUserListError.value = true
      userListErrorMessage.value = getErrorMessage(error)
    } finally {
      isLoading.userList = false
    }
  }

  const userRoleChange = async (uid: UserInfo['uid'], newRole: UserRole) => {
    await changeUserRoleAPI(uid, newRole)
    const user = userList.value.find((user) => user.uid === uid)
    if (user) user.role = newRole
  }

  const userUpdateUserNickname = async (newName: UserInfo['nickname']) => {
    if (!userInfo.value?.uid) {
      throw new AppError('登入狀態已失效，請重新登入')
    }
    await updateUserNicknameAPI(userInfo.value.uid, newName)
    userInfo.value.nickname = newName
  }

  const fetchUserInfo = async (uid: UserInfo['uid']) => {
    userInfo.value = await fetchUserInfoAPI(uid)
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
    userRoleChange,
    userUpdateUserNickname,
    fetchUserInfo,
  }
})
