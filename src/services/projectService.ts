import { db } from '@/firebase'
import {
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  writeBatch,
} from 'firebase/firestore'
import type { ProjectItem, AddProjectForm } from '@/types/project'

export const getProjectsAPI = async (): Promise<ProjectItem[]> => {
  try {
    const projectRef = collection(db, 'projects')
    const snapshot = await getDocs(projectRef)

    const projectsList: ProjectItem[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ProjectItem, 'id'>),
    }))
    return projectsList
  } catch (error) {
    console.error('獲取專案資料失敗', error)
    throw error
  }
}

export const addProjectAPI = async (projectData: AddProjectForm): Promise<ProjectItem> => {
  try {
    const projectRef = collection(db, 'projects')
    const newProjectRef = await addDoc(projectRef, projectData)

    if (!newProjectRef.id) {
      throw new Error('無法取得 Firebase ID')
    }
    return {
      id: newProjectRef.id,
      ...projectData,
    }
  } catch (error) {
    console.error('新增專案失敗:', error)
    throw error
  }
}

export const editProjectAPI = async (projectData: ProjectItem): Promise<ProjectItem> => {
  try {
    const { id, ...dataToUpdate } = projectData
    const projectRef = doc(db, 'projects', id)
    await updateDoc(projectRef, dataToUpdate)
    return projectData
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
