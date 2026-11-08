import { db } from '@/firebase'
import type { TimelineItem, Experience } from '@/types/experience'
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { AppError, isFirestorePermissionError, PermissionDeniedError } from '@/utils/error'
import { isOffline } from '@/utils/fetchHelpers'

export const getExperiencesAPI = async (): Promise<Experience[]> => {
  if (isOffline()) {
    throw new AppError('網路連線中斷，請檢查網路狀態')
  }

  try {
    const experienceQuery = query(collection(db, 'experiences'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(experienceQuery)

    const experiencesList: Experience[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Experience, 'id'>),
    }))
    return experiencesList
  } catch (error) {
    console.error('獲取經歷資料失敗：', error)
    throw new AppError('獲取經歷資料失敗，請稍後再試')
  }
}

export const updateExperienceAPI = async (
  experienceId: Experience['id'],
  timelineItems: TimelineItem[],
): Promise<{ items: TimelineItem[]; updatedAt: Timestamp }> => {
  if (isOffline()) {
    throw new AppError('網路連線中斷，請檢查網路狀態')
  }

  try {
    const experiencePayload = { items: timelineItems, updatedAt: serverTimestamp() }

    const experienceRef = doc(db, 'experiences', experienceId)
    await updateDoc(experienceRef, experiencePayload)

    return {
      items: timelineItems,
      updatedAt: Timestamp.now(),
    }
  } catch (error) {
    console.error('更新時間線失敗：', error)
    if (isFirestorePermissionError(error)) throw new PermissionDeniedError()

    throw new AppError('更新時間線失敗，請稍後再試')
  }
}

// 功能：未來可以新增新的時間線
// export const addExperienceAPI = async (experienceData: AddExperienceData): Promise<Experience> => {
//   try {
//     const experiencePayload = {
//       ...experienceData,
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     }

//     const experienceRef = collection(db, 'experiences')
//     const newExperienceRef = await addDoc(experienceRef, experiencePayload)

//     if (!newExperienceRef.id) {
//       throw new Error('無法取得 Firebase ID')
//     }
//     return {
//       id: newExperienceRef.id,
//       ...experienceData,
//       createdAt: Timestamp.now(),
//       updatedAt: Timestamp.now(),
//     }
//   } catch (error) {
//     console.error('新增經歷失敗：', error)
//     throw error
//   }
// }
