import { useProjectStore } from '@/stores/projectStore'
import { debounce } from '@/utils'

export function useDebounceSearch() {
  const projectStore = useProjectStore()
  const keyword = ref('')

  const updateStore = debounce((val: string) => {
    projectStore.searchQuery = val
  }, 1500)

  watch(keyword, (newValue) => {
    updateStore(newValue)
  })

  return keyword
}
