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

type TechCategory = 'frontend' | 'backend' | 'others'

interface TechGroup {
  label: string
  tags: string[]
}

export const TECH_STACK_CONFIG: Record<TechCategory, TechGroup> = {
  frontend: {
    label: '前端技術',
    tags: ['Vue 3', 'TypeScript', 'Element Plus', 'Tailwind CSS', 'Pinia'],
  },
  backend: {
    label: '後端與部署',
    tags: ['Node.js', 'Firebase', 'GitHub Copilot', 'Git', 'Docker'],
  },
  others: {
    label: '其他',
    tags: ['FL Studio', '100LS', 'English'],
  },
}
