import type { DisplayGroup } from '@/types/skill'

export const countSkillTags = (skillGroups: Record<string, DisplayGroup>): number => {
  if (!skillGroups) return 0
  return Object.values(skillGroups).reduce((sum, group) => {
    return sum + group.tags.length
  }, 0)
}
