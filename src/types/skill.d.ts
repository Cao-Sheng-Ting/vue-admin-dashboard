export interface TechGroup {
  name: string
  label: string
  tags: string[]
}

// Firestore 存的原始結構：key 為唯一 id（如 abc123），name 為英文代號，label 為顯示名稱
export type SkillsGroupMap = Record<string, TechGroup>

export interface SkillsData {
  skills: SkillsGroupMap
  order: string[] // 分類顯示順序，因物件 key 順序不可靠，存 id，對應 SkillsGroupMap 的 key
}

export interface Tag {
  name: string
  type: 'public' | 'personal'
}

// 頁面顯示的合併結構：tags 從 string[] 轉為帶有 removable 屬性的物件陣列
export interface DisplayGroup extends Omit<TechGroup, 'tags'> {
  tags: Tag[]
}
