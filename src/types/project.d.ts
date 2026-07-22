import { Timestamp } from 'firebase/firestore'

export type ProjectStatus = 'completed' | 'developing' | 'testing' | 'maintenance' | 'planning'

export interface ProjectItem {
  id: string
  title: string
  description: string
  imageUrl?: string
  tags: string[]
  status: ProjectStatus
  progress: number
  githubUrl?: string
  demoUrl?: string
  buildDate?: string | Date | null
  createdAt: Timestamp
  updatedAt: Timestamp
  detailContent?: string
}

export type AddProjectData = Omit<ProjectItem, 'id'>

export type EditProjectData = Omit<ProjectItem, 'createdAt'>
