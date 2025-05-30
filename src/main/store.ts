import { Repo, EditorConfig } from 'src/common/models'

export interface AppStore {
  repos: Repo[]
  theme: 'light' | 'dark' | 'system'
  editors: EditorConfig
}

// Platform-specific default configurations
function getPlatformDefaults(): EditorConfig {
  const platform = process.platform

  if (platform === 'win32') {
    // Windows defaults
    return {
      cursor: 'cursor',
      vscode: 'code',
      idea: 'idea64', // IntelliJ IDEA on Windows often uses idea64
      terminal: [
        'wt', // Windows Terminal (modern default)
        'cmd', // Command Prompt (fallback)
        'powershell' // PowerShell (fallback)
      ]
    }
  } else if (platform === 'darwin') {
    // macOS defaults
    return {
      cursor: 'cursor',
      vscode: 'code',
      idea: 'idea', // IntelliJ IDEA command line launcher
      terminal: [
        'open -a Terminal', // Default Terminal
        'open -a iTerm', // iTerm2 (popular alternative)
        'open -a Alacritty', // Alacritty
        'open -a Kitty' // Kitty
      ]
    }
  } else {
    // Linux/Unix defaults
    return {
      cursor: 'cursor',
      vscode: 'code',
      idea: 'idea', // IntelliJ IDEA command line launcher
      terminal: [
        'gnome-terminal', // GNOME Terminal (Ubuntu/GNOME)
        'konsole', // KDE Konsole
        'xfce4-terminal', // XFCE Terminal
        'alacritty', // Alacritty (modern, fast)
        'kitty', // Kitty (GPU-accelerated)
        'xterm' // xterm (universal fallback)
      ]
    }
  }
}

const platformDefaults = getPlatformDefaults()

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
    default: platformDefaults,
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
        editors: platformDefaults
      }
    })
  }
  return store
}
