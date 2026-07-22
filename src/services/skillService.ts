import { db } from '@/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import type { SkillsData, SkillsGroup } from '@/types/skill'

/**
 * 取得共用標籤庫（所有使用者共享的預設分類和標籤）
 * 找不到文件視為資料異常，拋出錯誤讓上層（store）統一處理
 */
export const getDefaultSkillsAPI = async (): Promise<SkillsData> => {
  try {
    const skillsRef = doc(db, 'skills', 'default')
    const defaultSkills = await getDoc(skillsRef)

    if (!defaultSkills.exists()) {
      throw new Error('找不到共用標籤庫')
    }
    return defaultSkills.data() as SkillsData
  } catch (error) {
    console.error('獲取共用標籤庫失敗', error)
    throw error
  }
}

/**
 * 取得使用者個人標籤庫
 * 回傳 null 代表「使用者存在但尚未新增任何個人化標籤」，屬於正常情況非錯誤
 */
export const getUserSkillsAPI = async (uid: string): Promise<SkillsGroup | null> => {
  try {
    const usersRef = doc(db, 'users', uid)
    const user = await getDoc(usersRef)

    if (!user.exists()) return null

    const userData = user.data()
    if (userData && userData.skills) {
      return userData.skills as SkillsGroup
    }

    return null
  } catch (error) {
    console.error('獲取個人標籤庫失敗', error)
    throw error
  }
}

export const editUserSkillsAPI = async (data: SkillsGroup, uid: string): Promise<SkillsGroup> => {
  try {
    const skillRef = doc(db, 'users', uid)
    await updateDoc(skillRef, {
      skills: data,
    })
    return data
  } catch (error) {
    console.error('更新技能標籤失敗', error)
    throw error
  }
}

export const editDefaultSkillsAPI = async (data: SkillsData): Promise<SkillsData> => {
  try {
    const skillRef = doc(db, 'skills', 'default')
    await setDoc(skillRef, data)
    return data
  } catch (error) {
    console.error('更新技能標籤失敗', error)
    throw error
  }
}
