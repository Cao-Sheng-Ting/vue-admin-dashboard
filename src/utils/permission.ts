import { ROLE_LEVEL } from '@/constants/permission'
import type { UserRole } from '@/types/user'

export const hasPermission = (requiredRole: UserRole, userRole: UserRole | undefined): boolean => {
  // 未登入（userRole 為 undefined）時，任何有權限要求的操作一律拒絕
  if (!userRole) return false

  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole]
}
