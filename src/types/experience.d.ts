import type { UserInfo } from '@/types/user'
import { Timestamp } from 'firebase/firestore'

type UserMemberInfo = { uid: UserInfo['uid']; nickname: UserInfo['nickname'] }

export interface TimelineItem {
  id: string
  title: string
  organization?: string
  durationYears?: number | null
  durationMonths?: number | null
  highlights: string[]
  skillTags: string[]
  // members?: UserMemberInfo[]
  sortOrder: number
}

export type AddTimelineItemData = Omit<TimelineItem, 'id' | 'sortOrder'>

type ExperienceType = 'portfolio' | 'career'

export interface Experience {
  id: string
  type: ExperienceType
  timelineName: string
  createdBy: UserMemberInfo
  createdAt: Timestamp
  updatedAt: Timestamp
  items: TimelineItem[]
}

// export type ExperienceMap = Record<string, Experience>

export type AddExperienceData = Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>
