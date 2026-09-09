import type { UserRole } from '@/types/user'

/** * Auth 模組專用的型別定義與靜態配置
 * 包含：角色選項、快速授權配置、權限對照表
 */
export type RoleOption = {
  role: UserRole
  label: string
}

export type AuthConfigItem = {
  role: UserRole
  code: string
  allowed: UserRole[]
}

export type AgreementType = 'service' | 'privacy'
