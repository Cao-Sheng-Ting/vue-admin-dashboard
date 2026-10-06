// Firestore 在離線狀態下，getDocs 不會拋出錯誤，而是回傳空結果（非 catch 可攔截的情境）
// 故離線時 UI 會誤判為「無資料」而非「錯誤」，因此需在請求前額外用 navigator.onLine 判斷網路狀態
export const isOffline = (): boolean => !navigator.onLine

export const handleFetchFailure = (
  options: { isError: Ref<boolean>; isLoading: Ref<boolean> },
  errorMessage: string = '網路連線中斷，請檢查網路狀態',
): void => {
  options.isError.value = true
  options.isLoading.value = false
  ElMessage.error(errorMessage)
}
