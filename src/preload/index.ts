import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Repo, EditorConfig } from '@common/models'
import { IpcEvents } from '@common/ipc-events'

// Custom APIs for renderer
const api = {
  closeWindow: () => ipcRenderer.invoke(IpcEvents.CloseWindow),
  selectDirectory: () => ipcRenderer.invoke(IpcEvents.SelectDirectory),
  launchCursor: (directoryPath: string) =>
    ipcRenderer.invoke(IpcEvents.LaunchCursor, directoryPath),
  launchVscode: (directoryPath: string) =>
    ipcRenderer.invoke(IpcEvents.LaunchVscode, directoryPath),
  launchTerminal: (directoryPath: string) =>
    ipcRenderer.invoke(IpcEvents.LaunchTerminal, directoryPath),
  launchIdea: (directoryPath: string) => ipcRenderer.invoke(IpcEvents.LaunchIdea, directoryPath),

  // Store APIs
  store: {
    getRepos: (): Promise<Repo[]> => ipcRenderer.invoke(IpcEvents.StoreGetRepos),
    setRepos: (repos: Repo[]): Promise<void> => ipcRenderer.invoke(IpcEvents.StoreSetRepos, repos),
    getTheme: (): Promise<'light' | 'dark' | 'system'> =>
      ipcRenderer.invoke(IpcEvents.StoreGetTheme),
    setTheme: (theme: 'light' | 'dark' | 'system'): Promise<void> =>
      ipcRenderer.invoke(IpcEvents.StoreSetTheme, theme),
    getEditors: (): Promise<EditorConfig> => ipcRenderer.invoke(IpcEvents.StoreGetEditors),
    setEditors: (editors: EditorConfig): Promise<void> =>
      ipcRenderer.invoke(IpcEvents.StoreSetEditors, editors)
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
