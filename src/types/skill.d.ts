export interface TechGroup {
  label: string
  tags: string[]
}

export type SkillsGroup = Record<string, TechGroup>

export interface SkillsData {
  skills: SkillsGroup
  order: string[]
}

export interface Tag {
  name: string
  removable: boolean
}

export interface MergedGroup extends Omit<TechGroup, 'tags'> {
  tags: Tag[]
}
