import type { UserRole } from '@/types/user'
import { USER_SORT_ORDER } from '@/constants/auth'

export const isUserRole = (value: unknown): value is UserRole => {
  return typeof value === 'string' && (USER_SORT_ORDER as readonly string[]).includes(value)
}

export const sortByRoleOrder = <T extends { role: UserRole }>(
  data: T[],
  order: readonly UserRole[],
): T[] => {
  const newData: T[] = []

  order.forEach((key) => {
    const matched = data.filter((item) => item.role === key)

    newData.push(...matched)
  })

  return newData
}
// 優化：可優化成這樣，之後研究
// export const sortByRoleOrder = <T extends { role: UserRole }>(
//   data: T[],
//   order: readonly UserRole[],
// ): T[] => {
//   // 複製一份陣列再排序，避免直接修改到原本的傳入資料（Immutability）
//   return [...data].sort((a, b) => {
//     return order.indexOf(a.role) - order.indexOf(b.role)
//   })
// }
