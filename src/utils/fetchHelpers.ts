import { getErrorMessage } from './error'

// 在離線狀態下，getDocs 不報錯、返回本機快取（可能是空的）： UI誤判無資料，故請求前需擋
export const isOffline = (): boolean => !navigator.onLine

// fetch 失敗交由 store 存狀態和訊息，頁面不 catch，交給 BaseErrorState 顯示
export const handleFetchFailure = (
  options: { isError: Ref<boolean>; isLoading: Ref<boolean>; errorMessage: Ref<string> },
  error: unknown,
): void => {
  options.isError.value = true
  options.isLoading.value = false
  options.errorMessage.value = getErrorMessage(error)
}
