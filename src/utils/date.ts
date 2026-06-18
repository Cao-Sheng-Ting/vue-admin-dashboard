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
