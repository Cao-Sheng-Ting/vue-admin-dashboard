import 'vue-router'
import type { UserRole } from '@/types/user'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    hidden?: boolean
    requiresAuth?: boolean
    requiredRole?: UserRole
  }
}
