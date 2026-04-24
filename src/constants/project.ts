import type { ProjectStatus } from '@/views/content/data'

export interface StatusConfig {
  name: string
  type: 'success' | 'primary' | 'warning' | 'info'
}

export const STATUS_MAP: Record<ProjectStatus, StatusConfig> = {
  completed: { name: '已完成', type: 'success' },
  developing: { name: '開發中', type: 'primary' },
  maintenance: { name: '維護中', type: 'warning' },
  planning: { name: '規劃中', type: 'info' },
}
