export type ProjectStatus = 'completed' | 'developing' | 'maintenance' | 'planning'

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

export const projectsList: ProjectItem[] = [
  {
    id: '1',
    title: 'Vue 3 Admin Dashboard',
    description: '基於 Vue 3 + TS + Element Plus 的後台管理系統，包含動態路由與權限控制。',
    imageUrl: 'https://picsum.photos/seed/project1/600/400',
    tags: ['Vue 3', 'TypeScript', 'Pinia'],
    status: 'developing',
    progress: 85,
    githubUrl: 'https://github.com/',
    demoUrl: 'https://demo.com/',
    createdAt: '2026-03-01',
    detailContent: '這是我目前的主力作品，深度研究了封裝思維與組件通訊邏輯。',
  },
  {
    id: '2',
    title: 'JavaScript 記憶力挑戰',
    description: '使用原生 JS 開發的翻牌記憶遊戲，訓練邏輯判斷與 DOM 操作。',
    imageUrl: 'https://picsum.photos/seed/project2/600/400',
    tags: ['JavaScript', 'CSS3', 'Logic'],
    status: 'completed',
    progress: 100,
    githubUrl: 'https://github.com/',
    demoUrl: 'https://demo.com/',
    createdAt: '2025-11-20',
    detailContent: '這是轉職初期用來打穩 JS 基礎的小作品。',
  },
  {
    id: '3',
    title: 'Gym Tracker 健身追蹤器',
    description: '專為重量訓練設計的 Web App，記錄三項成績（深蹲、臥推、硬舉）。',
    imageUrl: 'https://picsum.photos/seed/gym/600/400',
    tags: ['Vue 3', 'Tailwind', 'Firebase'],
    status: 'developing',
    progress: 40,
    githubUrl: 'https://github.com/',
    demoUrl: 'https://demo.com/',
    createdAt: '2026-04-05',
    detailContent: '結合自身健身習慣開發，目前正在實作 ECharts 圖表分析。',
  },
  {
    id: '4',
    title: 'Guitar Theory Helper',
    description: '互動式吉他指板與樂理學習工具，協助練習金屬樂速彈音階。',
    imageUrl: 'https://picsum.photos/seed/music/600/400',
    tags: ['Vue 3', 'Canvas', 'Music'],
    status: 'planning',
    progress: 10,
    githubUrl: '#',
    demoUrl: '#',
    createdAt: '2026-04-10',
    detailContent: '計畫將樂理邏輯程式化，方便練習不同調性的轉位。',
  },
  {
    id: '5',
    title: 'Web3 虛擬幣行情看板',
    description: '串接加密貨幣 API，即時顯示比特幣與以太幣的價格走勢。',
    imageUrl: 'https://picsum.photos/seed/crypto/600/400',
    tags: ['API', 'Axios', 'Charts'],
    status: 'completed',
    progress: 100,
    githubUrl: 'https://github.com/',
    demoUrl: 'https://demo.com/',
    createdAt: '2026-02-15',
    detailContent: '練習如何優雅地處理 API 請求與錯誤攔截。',
  },
  {
    id: '6',
    title: '100LS 英語學習助手',
    description: '配合 Netflix 影集練習英語聽寫的工具，紀錄重複練習次數。',
    imageUrl: 'https://picsum.photos/seed/english/600/400',
    tags: ['Local Storage', 'Auth'],
    status: 'developing',
    progress: 60,
    githubUrl: '#',
    demoUrl: '#',
    createdAt: '2026-01-20',
    detailContent: '實作紀錄功能，確保能符合 100LS 的練習週期。',
  },
  {
    id: '7',
    title: '個人食譜資料庫',
    description: '收錄精確科學烹飪法的食譜，包含雞肉低溫烹調與魚湯秘訣。',
    imageUrl: 'https://picsum.photos/seed/food/600/400',
    tags: ['Firestore', 'CRUD'],
    status: 'completed',
    progress: 100,
    githubUrl: '#',
    demoUrl: '#',
    createdAt: '2025-12-10',
    detailContent: '練習圖片上傳與 Firebase 資料結構設計。',
  },
  {
    id: '8',
    title: 'AI 寫程式助手整合',
    description: '探索 Cursor 與 OpenClaw 的工作流優化，提升前端開發效率。',
    imageUrl: 'https://picsum.photos/seed/ai/600/400',
    tags: ['AI Tooling', 'Workflow'],
    status: 'completed',
    progress: 100,
    githubUrl: '#',
    demoUrl: '#',
    createdAt: '2026-03-25',
    detailContent: '紀錄如何利用 AI 輔助重構代碼。',
  },
]
