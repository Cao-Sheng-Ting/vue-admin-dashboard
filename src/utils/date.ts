import { Timestamp } from 'firebase/firestore'

export const formatDate = (
  d: Timestamp | Date | string | number | null | undefined,
): Date | null => {
  if (!d) return null

  if (d instanceof Date) return d

  if (d instanceof Timestamp) {
    return d.toDate()
  }

  const date = new Date(d as string | number)
  return isNaN(date.getTime()) ? null : date
}

export const formatCareerDuration = (y: number, m: number): string => {
  const totalYears = y + Math.floor(m / 12)
  const totalMonths = m % 12

  if (totalYears === 0 && totalMonths === 0) return '無經驗'

  if (totalYears === 0) return `${totalMonths}個月`

  if (totalMonths === 0) return `${totalYears}年`

  return `${totalYears}年又${totalMonths}個月`
}
