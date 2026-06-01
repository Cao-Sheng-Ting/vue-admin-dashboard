import type { LoginParams, RegisterParams } from '@/types/user'
import { db, auth } from '@/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from 'firebase/auth'

export const loginAPI = async (loginParams: LoginParams) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginParams.email,
      loginParams.password,
    )

    const uid = userCredential.user.uid

    const userDocRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userDocRef)

    if (!userSnap.exists()) {
      throw new Error('此帳號驗證成功，但無法找到對應的用戶資料，請聯絡管理員')
    }
    return userSnap.data()
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
          throw new Error('帳號或密碼輸入錯誤')

        case 'auth/too-many-requests':
          throw new Error('嘗試次數過多，請稍後再試')

        default:
          throw new Error('登入時發生意外錯誤，請稍後再試')
      }
    }
  }
}

export const registerAPI = async (registerParams: RegisterParams) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      registerParams.email,
      registerParams.password,
    )

    const uid = userCredential.user.uid
    const userData = {
      uid,
      email: registerParams.email,
      nickname: registerParams.nickname,
      role: registerParams.role,
      createdAt: serverTimestamp(),
    }

    const userDocRef = doc(db, 'users', uid)
    await setDoc(userDocRef, userData)
    return { ...userData }
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('當前 Email 已註冊過！')
      }
    }
    throw new Error('註冊失敗，請稍後再試')
  }
}

/**
 * 獲取當前登入的使用者狀態 （監聽一次即停止，提高效能）
 * 用於全局路由守衛，確保頁面跳轉前獲取當前登入狀態
 */
export const getCurrentUser = () => {
  return new Promise<User | null>((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      auth,
      (user) => {
        removeListener() //呼叫自身執行回傳的 Unsubscribe 函式，停止監聽
        resolve(user)
      },
      reject,
    )
  })
}
