import { createRouter, createWebHistory, type RouteRecordRaw, RouterView } from 'vue-router'
import AuthLayout from '@/views/auth/AuthLayout.vue'
import LoginForm from '@/views/auth/components/LoginForm.vue'
import RegisterForm from '@/views/auth/components/RegisterForm.vue'
import Layout from '@/layouts/index.vue'
import { getCurrentUser } from '@/services/userService'
import { useUserStore } from '@/stores'
import type { User } from 'firebase/auth'
import { hasPermission } from '@/utils/permission'
import { AppError, showErrorMessage } from '@/utils/error'

const auth: RouteRecordRaw[] = [
  {
    path: '/auth',
    name: 'auth',
    component: AuthLayout,
    redirect: '/auth/login',
    meta: {
      title: 'Auth',
      hidden: true,
      requiresAuth: false,
    },
    children: [
      {
        path: 'login',
        name: 'login',
        component: LoginForm,
        meta: {
          title: 'Login',
          hidden: true,
          requiresAuth: false,
        },
      },
      {
        path: 'register',
        name: 'register',
        component: RegisterForm,
        meta: {
          title: 'Register',
          hidden: true,
          requiresAuth: false,
        },
      },
    ],
  },

  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/auth/ForgotPasswordView.vue'),
    meta: {
      title: 'ForgotPassword',
      hidden: true,
      requiresAuth: false,
    },
  },
]

const contentChildren: RouteRecordRaw[] = [
  {
    path: 'projects',
    name: 'projects',
    component: () => import('@/views/content/ProjectsView.vue'),
    meta: {
      title: 'Projects',
      icon: 'tabler:git-fork',
      requiresAuth: false,
      keepAlive: true, //尚未使用到 keepAlive，後續優化可加入
    },
  },
  {
    path: 'experiences',
    name: 'experiences',
    component: () => import('@/views/content/ExperiencesView.vue'),
    meta: {
      title: 'Experiences',
      icon: 'tabler:timeline-event-text',
      requiresAuth: false,
      keepAlive: true,
    },
  },
  {
    path: 'skills',
    name: 'skills',
    component: () => import('@/views/content/SkillsView.vue'),
    meta: {
      title: 'Skills',
      icon: 'tabler:tools',
      requiresAuth: false,
      keepAlive: true,
    },
  },
]

const usersChildren: RouteRecordRaw[] = [
  {
    path: 'users-list',
    name: 'users-list',
    component: () => import('@/views/users/UserListView.vue'),
    meta: {
      title: 'User List',
      icon: 'tabler:users',
      requiresAuth: true,
      keepAlive: true,
    },
  },
  {
    path: 'settings',
    name: 'settings',
    component: () => import('@/views/users/SettingsView.vue'),
    meta: {
      title: 'Settings',
      icon: 'ic:outline-settings',
      requiresAuth: true,
      requiredRole: 'admin',
    },
  },
]

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Layout,
    redirect: '/dashboard',
    meta: {
      title: 'Home',
      hidden: true,
      requiresAuth: false,
      keepAlive: true,
    },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: {
          title: 'Dashboard',
          icon: 'tabler:chart-arrows-vertical',
          requiresAuth: false,
        },
      },
      {
        path: 'content',
        name: 'content',
        component: RouterView,
        redirect: 'content/projects',
        meta: {
          title: 'Content',
          icon: 'tabler:folders',
          requiresAuth: false,
          keepAlive: true,
          isGroup: true,
        },
        children: [...contentChildren],
      },
      {
        path: 'users',
        name: 'users',
        component: RouterView,
        redirect: 'users/users-list',
        meta: {
          title: 'Users',
          icon: 'tabler:user',
          requiresAuth: true,
          keepAlive: true,
          isGroup: true,
        },
        children: [...usersChildren],
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: {
          title: 'Profile',
          requiresAuth: true,
          hidden: true,
        },
      },
    ],
  },
  ...auth,
]

const router = createRouter({
  // 使用 HTML5 History 模式，需注意部署時要配置 try_files
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

/**
 * 全局前置守衛：處理頁面訪問權限
 * @param to 導航目標
 */

router.beforeEach(async (to, from) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  const requiredRole = to.meta.requiredRole

  const userStore = useUserStore()

  let currentUser: User | null = null

  try {
    currentUser = await getCurrentUser()
  } catch (error) {
    console.error('路由守衛檢查登入狀態失敗：', error)
  }

  if (!currentUser) {
    // persist 會從 localStorage 還原 userInfo，但 Firebase 的登入可能已經失效。
    // 不清掉的話，不需要登入的頁面會用舊資料顯示成已登入
    userStore.userInfo = null

    if (requiresAuth) {
      return {
        path: '/auth/login',
        query: { redirect: to.fullPath },
      }
    }
  } else {
    if (to.name === 'login' || to.name === 'register') return '/'

    const needsUserInfo = !userStore.userInfo || userStore.userInfo.uid !== currentUser.uid

    if (needsUserInfo) {
      try {
        await userStore.fetchUserInfo(currentUser.uid)
      } catch (error) {
        console.error('載入使用者資料失敗:', error)
        userStore.userInfo = null // 補載失敗，不要留著可能屬於別人的資料

        // AppError： 帳號本身資料有問題（權限被拒、文件不存在、角色不合法等等），重試也不會好，所以登出
        // 其他錯誤（斷網等）是暫時性的可重試，不登出
        if (error instanceof AppError) {
          showErrorMessage(error)
          try {
            await userStore.userLogout()
          } catch {
            // 登出失敗 Firebase還是登入狀態，跳轉到登入頁會被踢到'/'，
            // '/'會再補載、再丟 AppError、再登出，所以留在原地以免無限重導
            return false
          }
          return '/auth/login'
        }

        // 補載失敗且非帳號問題，一般頁面直接放行，
        // 下面退路 '/'也是一般頁面，如果也擋，'/'又會觸發補載失敗，形成循環
        if (!requiredRole) return true

        showErrorMessage(error)
        // from.matched 長度為 0 代表第一次載入網站，return false 會白屏，
        // 所以改成導向 '/'
        return from.matched.length ? false : '/'
      }
    }

    if (requiredRole) {
      const userRole = userStore.userInfo?.role
      if (!userRole || !hasPermission(requiredRole, userRole)) {
        ElMessage.error('您沒有權限存取此頁面')
        return from.matched.length ? false : '/'
      }
    }
  }

  return true
})

export default router
