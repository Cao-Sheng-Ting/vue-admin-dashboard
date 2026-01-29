export interface APIResponse<T> {
  code: number
  message: string
  data: T
}

export interface UserLoginParams {
  username: string
  password: string
}

export interface UserInfo {
  id: number
  role: 'admin' | 'editor' | 'user'
  username: string
  nickname: string
  email: string
  avatar: string
}
