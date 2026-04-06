import { createRouter, createWebHistory, type RouteRecordRaw, RouterView } from 'vue-router'
import AuthLayout from '@/views/auth/AuthLayout.vue'
import LoginForm from '@/views/auth/components/LoginForm.vue'
import RegisterForm from '@/views/auth/components/RegisterForm.vue'
import Layout from '@/layouts/index.vue'

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
      requiresAuth: true,
      keepAlive: true,
    },
  },
  {
    path: 'experiences',
    name: 'experiences',
    component: () => import('@/views/content/ExperiencesView.vue'),
    meta: {
      title: 'Experiences',
      icon: 'tabler:timeline-event-text',
      requiresAuth: true,
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
      requiresAuth: true,
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
      roles: ['admin'],
    },
  },
  {
    path: 'roles',
    name: 'roles',
    component: () => import('@/views/users/RolesView.vue'),
    meta: {
      title: 'Roles',
      icon: 'tabler:key-filled',
      requiresAuth: true,
      roles: ['admin'],
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
      requiresAuth: true,
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
          requiresAuth: true,
        },
      },
      {
        path: 'content',
        name: 'content',
        component: RouterView,
        meta: {
          title: 'Content',
          icon: 'tabler:folders',
          requiresAuth: true,
          keepAlive: true,
        },
        children: [...contentChildren],
      },
      {
        path: 'users',
        name: 'users',
        component: RouterView,
        meta: {
          title: 'Users',
          icon: 'tabler:user',
          requiresAuth: true,
          roles: ['admin'],
          keepAlive: true,
        },
        children: [...usersChildren],
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: {
          title: 'Settings',
          icon: 'tabler:settings',
          requiresAuth: true,
          roles: ['admin'],
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

// router.beforeEach((to) => {
//   const userStore = useUserStore()
//   // 如果沒有 Token 且目標不是登入頁的話，強制跳轉到登入頁
//   if (!userStore.token && to.path !== '/login') {
//     return '/login'
//   }
// })

export default router
