import { db } from '@/firebase'
import {
  doc,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  writeBatch,
} from 'firebase/firestore'
import type { ProjectItem, AddProjectData } from '@/types/project'
import { serverTimestamp, Timestamp } from 'firebase/firestore'

export const getProjectsAPI = async (): Promise<ProjectItem[]> => {
  try {
    const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(projectsQuery)

    const projectsList: ProjectItem[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ProjectItem, 'id'>),
    }))
    return projectsList
  } catch (error) {
    throw error
  }
}

export const addProjectAPI = async (projectData: AddProjectData): Promise<ProjectItem> => {
  try {
    const projectPayload = {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const projectRef = collection(db, 'projects')
    const newProjectRef = await addDoc(projectRef, projectPayload)

    if (!newProjectRef.id) {
      throw new Error('無法取得 Firebase ID')
    }
    return {
      id: newProjectRef.id,
      ...projectData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
  } catch (error) {
    console.error('新增專案失敗：', error)
    throw error
  }
}

export const editProjectAPI = async (projectData: ProjectItem): Promise<ProjectItem> => {
  try {
    const { id, createdAt: _createdAt, ...dataToUpdate } = projectData
    const projectPayload = { ...dataToUpdate, updatedAt: serverTimestamp() }
    const projectRef = doc(db, 'projects', id)
    await updateDoc(projectRef, projectPayload)
    return { ...projectData, updatedAt: Timestamp.now() }
  } catch (error) {
    console.error('專案內容更新失敗', error)
    throw error
  }
}

export const deleteProjectAPI = async (projectId: string): Promise<string> => {
  try {
    const projectRef = doc(db, 'projects', projectId)
    await deleteDoc(projectRef)
    return projectId
  } catch (error) {
    console.error('專案刪除失敗', error)
    throw error
  }
}

export const deleteProjectsBatchAPI = async (projectIds: string[]): Promise<string[]> => {
  if (projectIds.length > 500) {
    throw new Error('一次最多只能刪除 500 個專案')
  }
  const batch = writeBatch(db)

  projectIds.forEach((id) => {
    const projectRef = doc(db, 'projects', id)
    batch.delete(projectRef)
  })
  try {
    await batch.commit()
    return projectIds
  } catch (error) {
    console.error('專案批量刪除失敗', error)
    throw error
  }
}

export const addAll = async (data: AddProjectData[]) => {
  const all = writeBatch(db)

  data.forEach((d) => {
    const collRef = collection(db, 'projects')
    const docRef = doc(collRef)
    const projectWithId = {
      id: docRef.id,
      ...d,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    all.set(docRef, projectWithId)
  })
  try {
    await all.commit()
    console.log('匯入成功')
  } catch (error) {
    console.log(error)
  }
}
