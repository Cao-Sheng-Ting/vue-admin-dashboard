import { db } from '@/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import type { SkillsData, SkillsGroup } from '@/types/skill'

export const getDefaultSkillsAPI = async (): Promise<SkillsData> => {
  try {
    const skillsRef = doc(db, 'skills', 'default')
    const defaultSkills = await getDoc(skillsRef)

    if (!defaultSkills.exists()) {
      throw new Error('找不到共用標籤庫')
    }
    return defaultSkills.data() as SkillsData
  } catch (error) {
    console.log('獲取共用標籤庫失敗', error)
    throw error
  }
}

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
    console.log('獲取個人標籤庫失敗', error)
    throw error
  }
}

export const editUserSkillsAPI = async (data: SkillsGroup, uid: string) => {
  try {
    const skillRef = doc(db, 'users', uid)
    await updateDoc(skillRef, {
      skills: data,
    })
    return data
  } catch (error) {
    console.log('更新技能標籤失敗', error)
    throw error
  }
}

export const editDefaultSkillsAPI = async (data: SkillsData) => {
  try {
    const skillRef = doc(db, 'skills', 'default')
    await setDoc(skillRef, data)
    return data
  } catch (error) {
    console.log('更新技能標籤失敗', error)
    throw error
  }
}
