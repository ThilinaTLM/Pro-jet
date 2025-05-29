/// <reference types="vite/client" />

interface ElectronAPI {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => Promise<any>
    on: (channel: string, func: (...args: any[]) => void) => void
    removeAllListeners: (channel: string) => void
  }
}

interface API {
  selectDirectory: () => Promise<string | null>
  launchCursor: (directoryPath: string) => Promise<{ success: boolean; error?: string }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
