import type { APIResponse, UserLoginParams, UserInfo } from '@/types/user'
import request from '@/utils/request'

export const userLoginAPI = (loginParams: UserLoginParams) => {
  return request.post<APIResponse<string>, string>('/login', loginParams)
}

export const getUserInfoAPI = () => {
  return request.get<APIResponse<UserInfo>, UserInfo>('/userInfo')
}
