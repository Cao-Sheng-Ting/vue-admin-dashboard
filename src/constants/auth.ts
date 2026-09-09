import type { RoleOption, AuthConfigItem } from '@/views/auth/types'
import type { UserRole } from '@/types/user'

export const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'user',
    label: '一般使用者',
  },
  {
    role: 'editor',
    label: '編輯者',
  },
  {
    role: 'admin',
    label: '管理員',
  },
]

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
