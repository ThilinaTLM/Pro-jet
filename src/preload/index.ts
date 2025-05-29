import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Repo } from '../renderer/src/models'

// Custom APIs for renderer
const api = {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  launchCursor: (directoryPath: string) => ipcRenderer.invoke('launch-cursor', directoryPath),
  launchVscode: (directoryPath: string) => ipcRenderer.invoke('launch-vscode', directoryPath),
  
  // Store APIs
  store: {
    getRepos: (): Promise<Repo[]> => ipcRenderer.invoke('store-get-repos'),
    setRepos: (repos: Repo[]): Promise<void> => ipcRenderer.invoke('store-set-repos', repos),
    getTheme: (): Promise<'light' | 'dark'> => ipcRenderer.invoke('store-get-theme'),
    setTheme: (theme: 'light' | 'dark'): Promise<void> => ipcRenderer.invoke('store-set-theme', theme)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
