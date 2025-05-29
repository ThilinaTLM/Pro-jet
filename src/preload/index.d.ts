import { ElectronAPI } from '@electron-toolkit/preload'
import { Repo } from 'src/common/models'

declare global {
  interface Window {
    electron: ElectronAPI
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
