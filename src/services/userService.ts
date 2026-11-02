import type { LoginParams, RegisterParams, UserInfo, UserRole } from '@/types/user'
import type { SkillsGroupMap } from '@/types/skill'
import { db, auth } from '@/firebase'
import { collection, getDocs, Timestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { doc, getDoc, serverTimestamp, type DocumentData } from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import {
  AppError,
  isFirestorePermissionError,
  PermissionDeniedError,
  mapAuthError,
} from '@/utils/error'
import { isUserRole } from '@/utils/role'
import { isOffline } from '@/utils/fetchHelpers'

// DocumentData 欄位都是any， 編譯器不會檢查
// 這裡確認欄位齊全、型別正確，以免壞資料流入 store
const transformUser = (data: DocumentData): UserInfo => {
  const { uid, email, nickname, role, createdAt } = data

  if (
    !uid ||
    typeof uid !== 'string' ||
    !email ||
    typeof email !== 'string' ||
    !nickname ||
    typeof nickname !== 'string' ||
    !isUserRole(role) ||
    !(createdAt instanceof Timestamp)
  ) {
    throw new AppError('用戶資料錯誤：缺少必要欄位或格式錯誤')
  }

  return {
    uid,
    email,
    nickname,
    role,
    createdAt,
  }
}

export const loginAPI = async (loginParams: LoginParams): Promise<UserInfo> => {
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
      throw new AppError('此帳號登入成功，但無法找到對應的用戶資料，請聯絡管理員')
    }
    return transformUser(userSnap.data())
  } catch (error) {
    console.error('登入發生錯誤：', error)

    // firebase 登入成功但獲取文件失敗，必須登出以免「已登入但 store 沒資料」
    // 登出失敗的話因為使用者無法處理，所以 console 就好
    await signOut(auth).catch((e) => console.error('登入失敗後清除登入狀態失敗：', e))
    throw mapAuthError(error, '登入時發生錯誤，請稍後再試')
  }
}

export const registerAPI = async (
  registerParams: RegisterParams,
  authCode?: string,
): Promise<UserInfo> => {
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
      skills: {} as SkillsGroupMap,
    }

    const userDocRef = doc(db, 'users', uid)
    const authRequestDocRef = doc(db, 'authRequests', uid)

    try {
      // 同批次寫入才能讓 Firestore 規則的 getAfter 讀到 authRequests，且保證兩筆資料一起成功或失敗
      const batch = writeBatch(db)
      batch.set(userDocRef, userData)

      if (registerParams.role !== 'user') {
        // Firestore 不接收 undefined，缺碼給空字串，交由規則拒絕
        batch.set(authRequestDocRef, { code: authCode ?? '' })
      }

      await batch.commit()
    } catch (error) {
      // 收回帳號，以免創建帳號成功但資料寫入失敗，導致幽靈帳號
      // 收回失敗，使用者無法處理，所以只 console
      await userCredential.user.delete().catch((e) => console.error('回收帳號失敗：', e))

      if (isFirestorePermissionError(error)) {
        console.error(error)
        throw new AppError('授權碼錯誤或沒有權限')
      }

      // 寫入失敗，交給下面 mapAuthError 判斷原因
      throw error
    }

    const userSnap = await getDoc(userDocRef)
    if (!userSnap.exists()) {
      // 帳號與文件已建立，firebase 維持登入
      // 下一次導航guard 會補載 userInfo，不需登出
      throw new AppError('註冊寫入後讀取失敗，請稍後再試')
    }

    const data = userSnap.data()
    return transformUser(data)
  } catch (error) {
    console.error('註冊發生錯誤：', error)
    throw mapAuthError(error, '註冊發生錯誤，請稍後再試')
  }
}

export const logoutAPI = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('登出發生錯誤：', error)
    throw new AppError('登出發生錯誤，請稍後再試')
  }
}

/**
 * 每次導航都會產生新的監聽，所以監聽一次即停止，以免無限增加
 * 用於全局路由守衛，確保頁面跳轉前獲取當前登入狀態
 */
// TODO: 註解與功能都已完成，但要再回來了解閉包和非同步的執行
export const getCurrentUser = () => {
  // 不能直接讀取 auth.currentUser：因為頁面載入當下 firebase 尚未還原狀態，它此時還是 null
  // null 無法判別是「尚未還原完」或「真的沒登入」，已登入狀態也會被導到登入頁
  // 用 Promise 包裝，等待 firebase 狀態還原
  return new Promise<User | null>((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      auth,
      (user) => {
        removeListener() //呼叫 onAuthStateChanged 回傳的取消監聽函式
        resolve(user)
      },
      (error) => {
        removeListener()
        reject(error)
      },
    )
  })
}

export const getAllUsersAPI = async (): Promise<UserInfo[]> => {
  if (isOffline()) throw new AppError('網路連線中斷，請檢查網路狀態')

  try {
    const usersCollectionRef = collection(db, 'users')
    const snap = await getDocs(usersCollectionRef)

    return snap.docs.flatMap((userDoc) => {
      try {
        return [transformUser(userDoc.data())]
      } catch (error) {
        // 選擇略過錯誤資料而不是整批失敗，不讓整份名單都無法用，MVP 先只 console.warn
        // TODO 之後設計如何處理壞資料
        console.warn(`略過格式錯誤的使用者文件${userDoc.id}:`, error)
        return []
      }
    })
  } catch (error) {
    console.error('取得使用者名單發生錯誤:', error)

    if (isFirestorePermissionError(error)) {
      throw new PermissionDeniedError('無法讀取資料，請登出後重新登入，或聯絡管理員')
    }

    throw new AppError('取得使用者名單發生錯誤，請稍後再試')
  }
}

export const changeUserRoleAPI = async (uid: UserInfo['uid'], newRole: UserRole): Promise<void> => {
  if (isOffline()) {
    throw new AppError('網路連線中斷，請檢查網路狀態')
  }

  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, { role: newRole })
  } catch (error) {
    console.error('更新權限失敗：', error)

    if (isFirestorePermissionError(error)) {
      throw new AppError('沒有權限進行此操作')
    }
    throw new AppError('更新權限失敗，請稍後再試')
  }
}

export const updateUserNicknameAPI = async (
  uid: UserInfo['uid'],
  newName: UserInfo['nickname'],
) => {
  if (isOffline()) {
    throw new AppError('網路連線中斷，請檢查網路狀態')
  }

  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, { nickname: newName })
  } catch (error) {
    console.error('更新用戶名稱失敗：', error)

    if (isFirestorePermissionError(error)) {
      throw new AppError('沒有權限進行此操作')
    }

    throw new AppError('更新名稱失敗，請稍後再試')
  }
}

export const fetchUserInfoAPI = async (uid: UserInfo['uid']): Promise<UserInfo> => {
  const userRef = doc(db, 'users', uid)

  const snap = await getDoc(userRef).catch((error) => {
    if (isFirestorePermissionError(error)) {
      throw new PermissionDeniedError('讀取使用者資料異常，請聯絡管理員')
    }
    // 其餘錯誤（斷網等）原樣拋出：guard 靠是不是 AppError 判斷是否登出
    throw error
  })

  if (!snap.exists()) {
    throw new AppError('帳號資料異常，請重新登入或聯絡管理員')
  }

  const data = snap.data()

  if (!isUserRole(data.role)) {
    throw new AppError('帳號角色資料異常，請重新登入或聯絡管理員')
  }

  return transformUser(data)
}
