import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios'
import { useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'
import router from '@/router'
import type { APIResponse } from '@/types/user'

const baseURL = import.meta.env.VITE_APP_API_BASE_URL

const service: AxiosInstance = axios.create({
  baseURL,
  timeout: 50000,
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    if (userStore.token) {
      // 採用 Bearer Token 規範，符合 RFC 6750 通訊要求，便於未來與真實後端 API 的銜接
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (err) => {
    return Promise.reject(err)
  },
)

service.interceptors.response.use(
  (res) => {
    return res.data
  },
  (err: AxiosError<APIResponse<unknown>>) => {
    if (err.response?.status === 401) {
      router.push('/login')
    }
    ElMessage({
      message: err.response?.data?.message || '服務異常',
    })
    return Promise.reject(err)
  },
)

export default service
export { baseURL }
