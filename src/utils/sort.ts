import type { UserRole } from '@/types/user'

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
