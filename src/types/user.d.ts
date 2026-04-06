export interface APIResponse<T> {
  code: number
  message: string
  data: T
}

export interface LoginParams {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: {
    email: string
    id: number
  }
}

export interface UserInfo {
  id: number
  role: UserRole
  username: string
  nickname: string
  email: string
  avatar: string
}

export type UserRole = 'admin' | 'editor' | 'user'

export interface RegisterParams {
  email: string
  password: string
  nickname: string
  role: UserRole
}

export interface RegisterForm extends RegisterParams {
  confirmPassword: string
  authCode: string
}

export interface UserItem extends RegisterParams {
  id: string
  createdAt: string
}
