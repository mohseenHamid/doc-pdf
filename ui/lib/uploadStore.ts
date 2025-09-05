export type ConvertedItem = {
  id: string
  name: string
  size: number
  createdAt: number
  blob: Blob
  url: string
}

export type UploadStore = {
  items: ConvertedItem[]
  add: (item: Omit<ConvertedItem, 'id'>) => void
  remove: (id: string) => void
  clear: () => void
  find: (id: string) => ConvertedItem | undefined
}

export function createUploadStore(): UploadStore {
  let items: ConvertedItem[] = []

  function add(item: Omit<ConvertedItem, 'id'>) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const record: ConvertedItem = { id, ...item }
    items = [record, ...items]
  }

  function remove(id: string) {
    const toRemove = items.find((i) => i.id === id)
    if (toRemove) URL.revokeObjectURL(toRemove.url)
    items = items.filter((i) => i.id !== id)
  }

  function clear() {
    for (const i of items) URL.revokeObjectURL(i.url)
    items = []
  }

  function find(id: string) {
    return items.find((i) => i.id === id)
  }

  return {
    get items() {
      return items
    },
    add,
    remove,
    clear,
    find,
  }
}
