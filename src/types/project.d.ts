import { Timestamp } from 'firebase/firestore'
import { PROJECT_STATUSES } from '@/constants/project'

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

// app內的專案： buildDate 在讀取邊界已由  transformProject 轉成 Date
export interface ProjectItem {
  id: string
  title: string
  description: string
  imageUrl?: string
  skillTags: string[]
  status: ProjectStatus
  progress: number
  githubUrl?: string
  demoUrl?: string
  buildDate: Date | null
  createdAt: Timestamp
  updatedAt: Timestamp
  detailContent?: string
}

// Add/Edit 是表單要送出的資料
export type AddProjectData = Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>

export type EditProjectData = AddProjectData & Pick<ProjectItem, 'id'>
