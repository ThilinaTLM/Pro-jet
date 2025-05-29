/// <reference types="vite/client" />

import { Repo } from './models'

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>
        on: (channel: string, func: (...args: any[]) => void) => void
        removeAllListeners: (channel: string) => void
      }
    }
    api: {
      selectDirectory: () => Promise<string | null>
      launchCursor: (directoryPath: string) => Promise<{ success: boolean; error?: string }>
      launchVscode: (directoryPath: string) => Promise<{ success: boolean; error?: string }>
      launchTerminal: (directoryPath: string) => Promise<{ success: boolean; error?: string }>
      launchIdea: (directoryPath: string) => Promise<{ success: boolean; error?: string }>
      closeWindow: () => Promise<void>
      store: {
        getRepos: () => Promise<Repo[]>
        setRepos: (repos: Repo[]) => Promise<void>
        getTheme: () => Promise<'light' | 'dark'>
        setTheme: (theme: 'light' | 'dark') => Promise<void>
      }
    }
  }
}

export {}
