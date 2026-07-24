import type { UserInfo } from '@/types/user'
import { Timestamp } from 'firebase/firestore'

type UserMemberInfo = { uid: UserInfo['uid']; nickname: UserInfo['nickname'] }

export interface TimeLineItem {
  id: string
  title: string
  duration?: number
  organization?: string
  skillTags: string[]
  highlights: string[]
  members?: UserMemberInfo[]
  sortOrder: number
}

export interface Experience {
  id: string
  timeLineName: string
  createdBy: UserMemberInfo
  createdAt: Timestamp
  updatedAt: Timestamp
  item: TimeLineItem[]
}

// export type ExperienceMap = Record<string, Experience>

export type AddExperienceData = Omit<Experience, 'id', 'createdAt', 'updatedAt'>
