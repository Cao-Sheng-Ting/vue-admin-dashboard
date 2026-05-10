export type ProjectStatus = 'completed' | 'developing' | 'testing' | 'maintenance' | 'planning'

export interface ProjectItem {
  id: string
  title: string
  description: string
  imageUrl: string
  tags: string[]
  status: ProjectStatus
  progress: number
  githubUrl: string
  demoUrl: string
  createdAt: string
  detailContent: string
}

export type ProjectForm = omit<
  ProjectItem,
  'id' | 'imageUrl' | 'githubUrl' | 'demoUrl' | 'createdAt' | 'detailContent'
> &
  Partial<pick<ProjectItem, 'imageUrl' | 'githubUrl' | 'demoUrl' | 'demoUrl' | 'detailContent'>>
