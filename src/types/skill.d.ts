export interface TechGroup {
  label: string
  tags: string[]
}

// Firestore 存的原始結構：key 為分類名稱（如 frontend/backend）
export type SkillsGroupMap = Record<string, TechGroup>

export interface SkillsData {
  skills: SkillsGroupMap
  order: string[] // 分類顯示順序，因物件 key 順序不可靠，須額外指定
}

export interface Tag {
  name: string
  removable: boolean // 是否可被使用者刪除：defaults 標籤一律 false，個人標籤一律 true
}

// 頁面顯示的合併結構：tags 從 string[] 轉為帶有 removable 屬性的物件陣列
export interface MergedGroup extends Omit<TechGroup, 'tags'> {
  tags: Tag[]
}
