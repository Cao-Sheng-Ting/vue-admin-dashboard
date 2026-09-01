export const DASHBOARD_CARDS_CONFIG = [
  {
    group: 'projects',
    groupLabel: '專案',
    items: [
      { key: 'totalProjects', label: '專案數量' },
      { key: 'completedProjects', label: '已完成' },
      { key: 'developingProjects', label: '開發中' },
    ],
  },
  {
    group: 'skills',
    groupLabel: '技能',
    items: [
      { key: 'totalSkills', label: '技能數量' },
      { key: 'frontendSkills', label: '前端' },
      { key: 'backendSkills', label: '後端' },
    ],
  },
  {
    group: 'experiences',
    groupLabel: '經歷',
    items: [{ key: 'careerDuration', label: '工作年資' }],
  },
] as const

export const DASHBOARD_CHART_CONFIG = {
  projectStates: {
    label: '專案狀態',
    items: {
      developing: { label: '開發中', color: 'sky-600' },
      completed: { label: '已完成', color: 'green-600' },
      planning: { label: '規劃中', color: 'yellow-600' },
    },
  },
  projectSkills: {
    label: '專案技術',
    colors: ['orange-600', 'yellow-600', 'green-600', 'sky-600', 'violet-600'],
  },
} as const
