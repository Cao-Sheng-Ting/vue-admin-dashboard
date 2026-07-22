import { db } from '@/firebase'
import type { Experience, AddExperienceData } from '@/types/experience'
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  addDoc,
} from 'firebase/firestore'

export const getExperiencesAPI = async (): Promise<Experience[]> => {
  try {
    const experienceQuery = query(collection(db, 'experiences'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(experienceQuery)

    const experiencesList: Experience[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Experience, 'id'>),
    }))
    return experiencesList
  } catch (error) {
    throw error
  }
}

export const editExperienceAPI = async (experienceData: Experience): Promise<Experience> => {
  try {
    const { id, createdAt: _createdAt, ...data } = experienceData
    const experiencePayload = { ...data, updatedAt: serverTimestamp() }

    const experienceRef = doc(db, 'experiences', id)
    await updateDoc(experienceRef, experiencePayload)

    return { ...experienceData, updatedAt: Timestamp.now() }
  } catch (error) {
    console.error('經歷內容更新失敗：', error)
    throw error
  }
}

export const addExperienceAPI = async (experienceData: AddExperienceData): Promise<Experience> => {
  try {
    const experiencePayload = {
      ...experienceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const experienceRef = collection(db, 'experiences')
    const newExperienceRef = await addDoc(experienceRef, experiencePayload)

    if (!newExperienceRef.id) {
      throw new Error('無法取得 Firebase ID')
    }
    return {
      id: newExperienceRef.id,
      ...experienceData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
  } catch (error) {
    console.error('新增經歷失敗：', error)
    throw error
  }
}
