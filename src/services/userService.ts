import type {
  APIResponse,
  LoginParams,
  LoginResponse,
  UserInfo,
  RegisterParams,
  UserItem,
} from '@/types/user'
import { db } from '@/firebase'
import { ref as dbRef, push, set } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { createUserWithEmailAndPassword } from 'firebase/auth'

export const userLoginAPI = (loginParams: LoginParams) => {
  return request.post<LoginResponse>('/login', loginParams)
}

export const getUserInfoAPI = () => {
  return request.get<APIResponse<UserInfo>, UserInfo>('/userInfo')
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
  await createUserWithEmailAndPassword()
}
