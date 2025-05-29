import { Repo } from 'src/common/models'

export interface AppStore {
  repos: Repo[]
  theme: 'light' | 'dark'
}

const schema = {
  repos: {
    type: 'array',
    default: [],
    items: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        path: { type: 'string' },
        lastOpened: { type: 'string' }
      },
      required: ['label', 'path', 'lastOpened']
    }
  },
  theme: {
    type: 'string',
    enum: ['light', 'dark'],
    default: 'dark'
  }
} as const

// Use dynamic import for electron-store since it's ESM-only
let store: any = null

export async function getStore() {
  if (!store) {
    const Store = (await import('electron-store')).default
    store = new Store<AppStore>({
      schema,
      defaults: {
        repos: [],
        theme: 'dark'
      }
    })
  }
  return store
} 