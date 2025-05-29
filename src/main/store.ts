import { Repo, EditorConfig } from 'src/common/models'

export interface AppStore {
  repos: Repo[]
  theme: 'light' | 'dark' | 'system'
  editors: EditorConfig
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
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  editors: {
    type: 'object',
    default: {
      cursor: 'cursor',
      vscode: 'code',
      idea: 'idea',
      terminal: ['gnome-terminal', 'konsole', 'xfce4-terminal', 'alacritty', 'kitty', 'xterm']
    },
    properties: {
      cursor: { type: 'string' },
      vscode: { type: 'string' },
      idea: { type: 'string' },
      terminal: {
        type: 'array',
        items: { type: 'string' }
      }
    },
    required: ['cursor', 'vscode', 'idea', 'terminal']
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
        theme: 'system',
        editors: {
          cursor: 'cursor',
          vscode: 'code',
          idea: 'idea',
          terminal: ['gnome-terminal', 'konsole', 'xfce4-terminal', 'alacritty', 'kitty', 'xterm']
        }
      }
    })
  }
  return store
}
