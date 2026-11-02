import { FirebaseError } from 'firebase/app'
import { AUTH_ERROR_MESSAGES } from '@/constants/error'

export class AppError extends Error {}

export class PermissionDeniedError extends AppError {
  constructor(message: string = '權限不足無法操作') {
    super(message)
    this.name = 'PermissionDeniedError'
  }
}

export const isFirestorePermissionError = (error: unknown): boolean =>
  error instanceof FirebaseError && error.code === 'permission-denied'

export const getErrorMessage = (error: unknown) =>
  error instanceof AppError ? error.message : '操作失敗，請稍後再試'

export const showErrorMessage = (error: unknown) => {
  ElMessage.error(getErrorMessage(error))
}

export const mapAuthError = (
  error: unknown,
  fallback: string = '操作發生錯誤，請稍後再試',
): AppError => {
  // 已是 AppError 直接放行， 避免訊息被 fallback 覆蓋
  if (error instanceof AppError) return error

  if (error instanceof FirebaseError) {
    const message = AUTH_ERROR_MESSAGES[error.code]
    if (message) return new AppError(message)
  }

  return new AppError(fallback)
}
