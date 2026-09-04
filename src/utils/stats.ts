export const countOccurrences = (arr: string[]) => {
  if (!arr.length) return {}
  const countMap: Record<string, number> = {}

  arr.forEach((s) => {
    countMap[s] = (countMap[s] || 0) + 1
  })

  return countMap
}

export const getTopOccurrences = (map: Record<string, number>, limit: number = 5) => {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

export const calcPercentageByTotal = (map: Record<string, number>) => {
  const totalCount = Object.values(map).reduce((sum, val) => sum + val, 0)

  return Object.entries(map).map(([name, count]) => ({
    name,
    total: count,
    percentage: ((count / totalCount) * 100).toFixed(2),
  }))
}

export const calcPercentageByMax = (entries: [string, number][]) => {
  const [firstEntry] = entries

  if (!firstEntry) return []
  const maxCount = firstEntry[1]

  return entries.map(([name, count]) => ({
    name,
    total: count,
    percentage: ((count / maxCount) * 100).toFixed(2),
  }))
}
