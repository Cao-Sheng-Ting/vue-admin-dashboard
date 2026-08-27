import type { MergedGroup } from '@/types/skill'

export const countSkillTags = (skillGroups: Record<string, MergedGroup>): number => {
  if (!skillGroups) return 0
  return Object.values(skillGroups).reduce((sum, group) => {
    return sum + group.tags.length
  }, 0)
}
