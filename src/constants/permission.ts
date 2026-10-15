import type { UserRole } from '@/types/user'

export const ROLE_LEVEL: Record<UserRole, number> = {
  user: 1,
  editor: 2,
  admin: 3,
}

export const ROLE_LABEL: Record<UserRole, string> = {
  user: '一般使用者',
  editor: '編輯者',
  admin: '管理員',
}
