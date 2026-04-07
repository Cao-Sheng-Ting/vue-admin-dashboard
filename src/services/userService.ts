import type {
  APIResponse,
  LoginParams,
  LoginResponse,
  UserInfo,
  RegisterParams,
  UserItem,
} from '@/types/user'
import { db, auth } from '@/firebase'
import { ref as dbRef, serverTimestamp, set } from 'firebase/database'
import { createUserWithEmailAndPassword } from 'firebase/auth'

export const userLoginAPI = (loginParams: LoginParams) => {
  return request.post<LoginResponse>('/login', loginParams)
}

// export const registerAPI = async (registerParams: RegisterParams) => {
//   const userListRef = dbRef(db, 'users')
//   const newUserRef = push(userListRef)

//   const userData: UserItem = {
//     id: newUserRef.key!,
//     ...registerParams,
//     createdAt: new Date().toISOString(),
//   }

//   const res = await set(newUserRef, userData)
//   console.log(res)
// }

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

    await set(dbRef(db, `users/${uid}`), userData)
    return userData
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('當前 Email 已註冊過！')
      }
    }
    throw new Error('註冊失敗，請稍後再試')
  }
}
