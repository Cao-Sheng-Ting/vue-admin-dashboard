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
  createdAt?: string | Date | null
  detailContent?: string
}

export type AddProjectForm = Omit<ProjectItem, 'id'>
