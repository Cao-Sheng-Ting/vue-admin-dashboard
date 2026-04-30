<script setup lang="ts">
import { ref } from 'vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import type { RouteRecordRaw } from 'vue-router'
import { Icon } from '@iconify/vue'

defineOptions({
  name: 'MainLayout',
})
const isCollapse = ref(true)

const route = useRoute()
const router = useRouter()

const hasPermission = (requiredRole?: string[]) => {
  const userRole = useUserStore().userInfo?.role || 'user'
  if (!requiredRole?.length) return true

  if (userRole === 'admin') return true

  return requiredRole.includes(userRole)
}

const filterByPermission = (items: RouteRecordRaw[]): RouteRecordRaw[] => {
  return items.filter((item) => {
    if (item.meta?.hidden) return false

    const roles = item.meta?.roles as string[] | undefined
    return hasPermission(roles)
  })
}

const menuList = computed(() => {
  const rootRoute = router.options.routes.find((route) => route.path === '/')
  const children = rootRoute?.children || []

  return filterByPermission(children).map((item) => {
    return {
      ...item,
      children: item.children ? filterByPermission(item.children) : undefined,
    }
  })
})

const breadcrumbs = computed(() => {
  return route.matched.filter(
    (item) => item.meta?.title && item.name !== 'home' && item.name !== 'dashboard',
  )
})
</script>

<template>
  <el-container class="h-full">
    <el-aside tag="nav" :width="isCollapse ? '64px' : '240px'"
      class="flex flex-col transition-[width] duration-300 ease-in-out overflow-hidden bg-blue-950 border-r border-gray-100">
      <div class="logo-container flex h-20 items-center justify-center bg-slate-700">
        <h1 v-if="!isCollapse" class="whitespace-nowrap text-2xl text-gray-100">後台管理系統</h1>
      </div>
      <el-menu router :collapse="isCollapse" :collapse-transition="false" background-color="#3341559" text-color="#fff">
        <template v-for="menu in menuList" :key="menu.name || menu.path">
          <el-sub-menu v-if="menu.children" :index="menu.name">
            <template #title>
              <el-icon v-if="menu.meta?.icon">
                <Icon :icon="menu.meta?.icon" />
              </el-icon>
              <span>{{ menu.meta?.title }}</span>
            </template>
            <el-menu-item v-for="item in menu.children" :key="item.path" :index="`/${menu.path}/${item.path}`"
              class="bg-slate-800">
              <el-icon v-if="item.meta?.icon">
                <Icon :icon="item.meta?.icon" />
              </el-icon>
              <span>{{ item.meta?.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="'/' + menu.path">
            <el-icon v-if="menu.meta?.icon">
              <Icon :icon="menu.meta?.icon" />
            </el-icon>
            <span>{{ menu.meta?.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header tag="header" height="55px" class="flex items-center justify-between pr-4 pl-0 bg-gray-100">
        <div class="header-left flex flex-row h-full items-center">
          <div @click="isCollapse = !isCollapse"
            class="h-full aspect-square flex items-center justify-center cursor-pointer hover:bg-black/10 transition-colors">
            <el-icon size="30" class="!text-zinc-700">
              <icon-tabler:layout-sidebar-left-expand v-if="isCollapse" />
              <icon-tabler:layout-sidebar-right-expand v-else />
            </el-icon>
          </div>
          <el-breadcrumb separator=">" class="flex items-center gap-0.5 h-full text-base">
            <el-icon size="30"><icon-mdi:home class="text-sky-800" /></el-icon>
            <el-breadcrumb-item :to="{ name: 'home' }">
              <span class="cursor-pointer">home</span>
            </el-breadcrumb-item>
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="{ path: item.path }">
              <span>{{ item.meta?.title }}</span>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right flex flex-row items-center justify-center gap-3">
          <el-input placeholder="請輸入關鍵字" class="w-60"></el-input>
          <el-avatar class="shrink-0">
            <el-icon>
              <icon-tabler:user-filled />
            </el-icon>
          </el-avatar>
          <el-dropdown placement="bottom-end">
            <div>
              <el-icon size="20">
                <icon-tabler:settings-filled />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>偏好設定</el-dropdown-item>
                <el-dropdown-item>登入</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <div class="tags-view-container h-10 bg-gray-100 border-y border-gray-200">
        <el-scrollbar>
          <el-tag>Tag 1</el-tag>
        </el-scrollbar>
      </div>
      <el-main tag="main" class="h-[calc(100vh-80px] bg-gray-200"><router-view></router-view></el-main>
      <el-footer>這是footer</el-footer>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
@import '@/styles/index.scss';

/* 移除 el-menu 預設的右邊框 */
.el-aside {
  &::-webkit-scrollbar {
    width: 0px !important;
  }
}

.el-menu {
  border-right: none !important;
}

:deep(.el-breadcrumb__item .el-breadcrumb__inner) {
  color: #303033;
  font-weight: normal;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #303033;
  font-weight: 700;
}
</style>
