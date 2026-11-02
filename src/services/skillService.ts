import { db } from '@/firebase'
import {
  arrayRemove,
  deleteField,
  doc,
  FieldPath,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import type { SkillsData, SkillsGroupMap } from '@/types/skill'
import { AppError, isFirestorePermissionError, PermissionDeniedError } from '@/utils/error'
import { isOffline } from '@/utils/fetchHelpers'

/**
 * 取得共用標籤庫（所有使用者共享的預設分類和標籤）
 * 文件不存在時回傳空庫，不當成錯誤
 */
export const getDefaultSkillsAPI = async (): Promise<SkillsData> => {
  if (isOffline()) {
    throw new AppError('網路連線中斷，請檢查網路狀態')
  }
  try {
    const skillsRef = doc(db, 'skills', 'default')
    const defaultSkills = await getDoc(skillsRef)

    if (!defaultSkills.exists()) {
      return {
        order: [],
        skills: {},
      }
    }

    const data = defaultSkills.data() as SkillsData
    return {
      order: data.order?.length ? data.order : Object.keys(data.skills ?? {}),
      skills: data.skills ?? {},
    }
  } catch (error) {
    console.error('獲取共用標籤庫失敗', error)
    throw new AppError('獲取共用標籤庫失敗，請稍後重試')
  }
}

/**
 * 取得使用者個人標籤庫
 * 回傳 null：使用者文件不存在或尚無個人標籤，皆非錯誤
 */
export const getUserSkillsAPI = async (uid: string): Promise<SkillsGroupMap | null> => {
  if (isOffline()) {
    throw new AppError('網路連線中斷，請檢查網路狀態')
  }

  try {
    const usersRef = doc(db, 'users', uid)
    const user = await getDoc(usersRef)

    if (!user.exists()) return null

    const userData = user.data()
    if (userData && userData.skills) {
      return userData.skills as SkillsGroupMap
    }

    return null
  } catch (error) {
    console.error('獲取個人標籤庫失敗', error)

    if (isFirestorePermissionError(error)) {
      throw new PermissionDeniedError('無法讀取個人標籤庫，請登出後重新登入，或聯絡管理員')
    }

    throw new AppError('獲取個人標籤庫失敗，請稍後重試')
  }
}

export const editUserSkillsAPI = async (data: SkillsGroupMap, uid: string): Promise<void> => {
  if (isOffline()) {
    throw new AppError('網路連線中斷，請檢查網路狀態')
  }

  try {
    const skillRef = doc(db, 'users', uid)
    await updateDoc(skillRef, {
      skills: data,
    })
  } catch (error) {
    console.error('更新個人技能庫失敗', error)
    if (isFirestorePermissionError(error)) {
      throw new PermissionDeniedError()
    }
    throw new AppError('更新技能標籤失敗，請稍後再試')
  }
}

export const deleteSkillGroupAPI = async (key: string): Promise<void> => {
  if (isOffline()) {
    throw new AppError('網路連線中斷，請檢查網路狀態')
  }

  try {
    const skillRef = doc(db, 'skills', 'default')
    // 只動該分類欄位，不用 setDoc 寫入編輯模式下未儲存的修改
    await updateDoc(
      skillRef,
      new FieldPath('skills', key),
      deleteField(),
      'order',
      arrayRemove(key),
    )
  } catch (error) {
    console.error('刪除技能分類失敗', error)
    if (isFirestorePermissionError(error)) {
      throw new PermissionDeniedError()
    }
    throw new AppError('刪除技能分類失敗，請稍後再試')
  }
}

export const editDefaultSkillsAPI = async (data: SkillsData): Promise<void> => {
  if (isOffline()) {
    throw new AppError('網路連線中斷，請檢查網路狀態')
  }

  try {
    const skillRef = doc(db, 'skills', 'default')
    await setDoc(skillRef, data)
  } catch (error) {
    console.error('更新技能標籤失敗', error)
    if (isFirestorePermissionError(error)) {
      throw new PermissionDeniedError()
    }
    throw new AppError('更新技能標籤失敗，請稍後再試')
  }
}
