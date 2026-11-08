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
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import type { ProjectStatus, ProjectItem, AddProjectData, EditProjectData } from '@/types/project'
import { PROJECT_STATUSES } from '@/constants/project'
import { isOffline } from '@/utils/fetchHelpers'
import { AppError, isFirestorePermissionError, PermissionDeniedError } from '@/utils/error'

const transformProject = (data: DocumentData): ProjectItem => {
  const {
    id,
    title,
    description,
    imageUrl,
    skillTags,
    status,
    progress,
    githubUrl,
    demoUrl,
    buildDate,
    createdAt,
    updatedAt,
    detailContent,
  } = data

  const isNonEmptyString = (val: unknown): boolean => {
    return typeof val === 'string' && val.trim().length > 0
  }

  const isOptionalString = (val: unknown): boolean => {
    return val === undefined || typeof val === 'string'
  }

  const isStringArray = (val: unknown): boolean => {
    return Array.isArray(val) && val.every((item) => typeof item === 'string')
  }

  const isValidProjectStatus = (val: unknown): val is ProjectStatus => {
    return PROJECT_STATUSES.includes(val as ProjectStatus)
  }

  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(title) ||
    !isNonEmptyString(description) ||
    !isOptionalString(imageUrl) ||
    !isStringArray(skillTags) ||
    !isValidProjectStatus(status) ||
    typeof progress !== 'number' ||
    !isOptionalString(githubUrl) ||
    !isOptionalString(demoUrl) ||
    !(buildDate === null || buildDate === undefined || buildDate instanceof Timestamp) ||
    !(createdAt instanceof Timestamp) ||
    !(updatedAt instanceof Timestamp) ||
    !isOptionalString(detailContent)
  ) {
    throw new AppError('專案資料錯誤：缺少必要欄位或格式錯誤')
  }

  return {
    id,
    title,
    description,
    imageUrl: imageUrl ?? '',
    skillTags,
    status,
    progress,
    githubUrl: githubUrl ?? '',
    demoUrl: demoUrl ?? '',
    // 舊資料可能沒有此欄位，統一轉 null，讀取邊界一次轉成 Date
    buildDate: buildDate ? buildDate.toDate() : null,
    createdAt,
    updatedAt,
    detailContent: detailContent ?? '',
  }
}

export const getProjectsAPI = async (): Promise<ProjectItem[]> => {
  if (isOffline()) {
    throw new AppError('網路連線中斷，請檢查網路狀態')
  }

  try {
    const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(projectsQuery)

    const projectsList: ProjectItem[] = snapshot.docs.flatMap((projectDoc) => {
      try {
        return [transformProject({ ...projectDoc.data(), id: projectDoc.id })]
      } catch (error) {
        // 略過壞資料，避免單筆格式錯誤讓整份列表失效；MVP 先只 console.warn
        // TODO 之後設計如何處理壞資料
        console.warn(`略過格式錯誤的專案文件${projectDoc.id}`, error)
        return []
      }
    })
    return projectsList
  } catch (error) {
    console.error('獲取專案資料失敗', error)
    throw new AppError('獲取專案資料失敗，請稍後再試')
  }
}

export const addProjectAPI = async (projectData: AddProjectData): Promise<ProjectItem> => {
  if (isOffline()) {
    throw new AppError('網路連線中斷，請檢查網路狀態')
  }

  try {
    const projectPayload = {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const projectRef = collection(db, 'projects')
    const newProjectRef = await addDoc(projectRef, projectPayload)

    return {
      id: newProjectRef.id,
      ...projectData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
  } catch (error) {
    console.error('新增專案失敗：', error)

    if (isFirestorePermissionError(error)) {
      throw new PermissionDeniedError()
    }

    throw new AppError('新增專案失敗，請稍後再試')
  }
}

export const editProjectAPI = async (projectData: EditProjectData): Promise<Timestamp> => {
  if (isOffline()) {
    throw new AppError('網路連線中斷，請檢查網路狀態')
  }

  try {
    const { id, ...dataToUpdate } = projectData
    const projectPayload = { ...dataToUpdate, updatedAt: serverTimestamp() }
    const projectRef = doc(db, 'projects', id)
    await updateDoc(projectRef, projectPayload)
    // 回傳本機時間供 store 更新畫面，實際值以伺服器時間為準，重新整理後同步
    return Timestamp.now()
  } catch (error) {
    console.error('專案內容更新失敗', error)

    if (isFirestorePermissionError(error)) {
      throw new PermissionDeniedError()
    }

    throw new AppError('專案內容更新失敗，請稍後再試')
  }
}

export const deleteProjectAPI = async (projectId: string): Promise<void> => {
  if (isOffline()) {
    throw new AppError('網路連線中斷，請檢查網路狀態')
  }

  try {
    const projectRef = doc(db, 'projects', projectId)
    await deleteDoc(projectRef)
  } catch (error) {
    console.error('專案刪除失敗', error)

    if (isFirestorePermissionError(error)) {
      throw new PermissionDeniedError()
    }

    throw new AppError('專案刪除失敗，請稍後再試')
  }
}

export const deleteProjectsBatchAPI = async (projectIds: string[]): Promise<void> => {
  if (isOffline()) {
    throw new AppError('網路連線中斷，請檢查網路狀態')
  }

  // Firestore 單次 batch 上限 500 筆
  if (projectIds.length > 500) {
    throw new AppError('一次最多只能刪除 500 個專案')
  }

  const batch = writeBatch(db)

  projectIds.forEach((id) => {
    const projectRef = doc(db, 'projects', id)
    batch.delete(projectRef)
  })
  try {
    await batch.commit()
  } catch (error) {
    console.error('專案批量刪除失敗', error)

    if (isFirestorePermissionError(error)) {
      throw new PermissionDeniedError()
    }

    throw new AppError('專案批量刪除失敗，請稍後再試')
  }
}
