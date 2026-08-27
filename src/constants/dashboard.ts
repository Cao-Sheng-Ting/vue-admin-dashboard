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

export const DASHBOARD_CHART_CONFIG = []
