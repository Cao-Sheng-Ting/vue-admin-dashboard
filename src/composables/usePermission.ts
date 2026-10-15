import { useUserStore } from '@/stores'
import type { UserRole } from '@/types/user'
import { useRoute, useRouter } from 'vue-router'
import { hasPermission } from '@/utils/permission'
import { ElMessageBox } from 'element-plus'
import { ROLE_LABEL } from '@/constants/permission'

export const usePermission = () => {
  const userStore = useUserStore()
  const route = useRoute()
  const router = useRouter()

  const can = (requiredRole: UserRole) => hasPermission(requiredRole, userStore.userInfo?.role)

  const denyClass = (requiredRole: UserRole, variant: 'button' | 'block' = 'block') => {
    if (can(requiredRole)) return variant === 'button' ? '' : 'cursor-pointer'
    return variant === 'button' ? 'cursor-not-allowed opacity-60' : 'cursor-not-allowed'
  }

  const guard = async (requiredRole: UserRole): Promise<boolean> => {
    if (!userStore.userInfo) {
      const message =
        requiredRole === 'user'
          ? '此功能需要登入後才能使用'
          : `此功能需要${ROLE_LABEL[requiredRole]}權限，請先登入`
      try {
        await ElMessageBox.confirm(message, {
          confirmButtonText: '登入',
          cancelButtonText: '取消',
        })
        router.push({ path: '/auth/login', query: { redirect: route.fullPath } })
      } catch {
        // 使用者按取消，不處理
      }
      return false
    }

    if (!can(requiredRole)) {
      ElMessage.warning(`此功能需要${ROLE_LABEL[requiredRole]}權限`)
      return false
    }
    return true
  }

  return { can, guard, denyClass }
}
