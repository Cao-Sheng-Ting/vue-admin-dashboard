import { createRouter, createWebHistory, type RouteRecordRaw, RouterView } from 'vue-router'
import AuthLayout from '@/views/auth/AuthLayout.vue'
import LoginForm from '@/views/auth/components/LoginForm.vue'
import RegisterForm from '@/views/auth/components/RegisterForm.vue'
import Layout from '@/layouts/index.vue'
import { getCurrentUser } from '@/services/userService'
import { useUserStore } from '@/stores'

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
      requiredRole: ['admin'],
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

router.beforeEach(async (to, from, next) => {
  // 取得當前 firebase 的登入狀態
  const currentUser = await getCurrentUser()
  //檢查目標路徑中（包括父子層級）是否有任何需要身份驗證的
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  //檢查目標路徑是否需要權限
  const requiredRole = to.meta.requiredRole as string[] | undefined

  const userStore = useUserStore()

  // 未登入狀態且目標頁面需要登入
  if (!currentUser && requiresAuth) {
    return next({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }

  // 前往登入頁面但已是登入狀態
  if (to.path === '/auth/login' && currentUser) {
    return next('/')
  }

  //是否符合目標路徑要求權限
  if (requiredRole && requiredRole.length) {
    const role = userStore.userInfo?.role || 'viewer'
    const hasPermission = requiredRole.includes(role)

    if (!hasPermission) {
      return next('/')
    }
  }

  next()
})

export default router
