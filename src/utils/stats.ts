export const countOccurrences = (arr: string[]) => {
  if (!arr.length) return {}
  const countMap: Record<string, number> = {}

  arr.forEach((s) => {
    countMap[s] = (countMap[s] || 0) + 1
  })

  return countMap
}

export const calcPercentage = (arr: string[]) => {
  const map = countOccurrences(arr)

  return Object.entries(map).map(([status, count]) => ({
    status,
    total: count,
    percentage: ((count / arr.length) * 100).toFixed(2),
  }))
}

export const getTopOccurrences = (arr: string[], limit: number = 5) => {
  const map = countOccurrences(arr)

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}
