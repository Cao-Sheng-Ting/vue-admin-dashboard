import { ref } from 'vue'
import type { UserRole } from '@/types/user'

/** * Auth 模組專用的型別定義與靜態配置
 * 包含：角色選項、快速授權配置、權限對照表
 */
export type RoleOption = {
  role: UserRole
  label: string
  disabled: boolean
}

export const roleOptions = ref<RoleOption[]>([
  {
    role: 'user',
    label: '一般使用者',
    disabled: false,
  },
  {
    role: 'editor',
    label: '編輯者',
    disabled: true,
  },
  {
    role: 'admin',
    label: '管理員',
    disabled: true,
  },
])

export type AuthConfigItem = {
  role: UserRole
  code: string
  allowed: UserRole[]
}

export const QUICK_AUTH_CONFIG: Partial<Record<UserRole, AuthConfigItem>> = {
  admin: {
    role: 'admin',
    code: 'ADMIN-2026',
    allowed: ['admin', 'editor', 'user'],
  },
  editor: {
    role: 'editor',
    code: 'EDITOR-2026',
    allowed: ['editor', 'user'],
  },
}

export type AgreementType = 'service' | 'privacy'
