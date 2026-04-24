export function debounce<T extends (...args: any[]) => void>(fn: T, time: number = 1000) {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: Parameters<T>): void => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, time)
  }
}
