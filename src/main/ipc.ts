import { ipcMain, dialog } from 'electron'
import { spawn } from 'child_process'
import { getStore } from './store'
import { Repo } from '../renderer/src/models'

export function setupIpcHandlers(): void {
  // Store handlers
  ipcMain.handle('store-get-repos', async () => {
    const store = await getStore()
    const repos = store.get('repos', [])
    // Convert lastOpened strings back to Date objects
    return repos.map(repo => ({
      ...repo,
      lastOpened: new Date(repo.lastOpened)
    }))
  })

  ipcMain.handle('store-set-repos', async (_, repos: Repo[]) => {
    const store = await getStore()
    // Convert Date objects to strings for storage
    const serializedRepos = repos.map(repo => ({
      ...repo,
      lastOpened: repo.lastOpened.toISOString()
    }))
    store.set('repos', serializedRepos)
  })

  ipcMain.handle('store-get-theme', async () => {
    const store = await getStore()
    return store.get('theme', 'dark')
  })

  ipcMain.handle('store-set-theme', async (_, theme: 'light' | 'dark') => {
    const store = await getStore()
    store.set('theme', theme)
  })

  // Directory selection handler
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

  ipcMain.handle('launch-cursor', async (_, directoryPath: string) => {
    try {
      // Try to launch Cursor with the directory
      spawn('cursor', [directoryPath], { 
        detached: true,
        stdio: 'ignore'
      })
      return { success: true }
    } catch (error) {
      console.error('Failed to launch Cursor:', error)
      return { success: false, error: 'Failed to launch Cursor. Make sure Cursor is installed and available in PATH.' }
    }
  })

  ipcMain.handle('launch-vscode', async (_, directoryPath: string) => {
    try {
      // Try to launch VS Code with the directory
      spawn('code', [directoryPath], { 
        detached: true,
        stdio: 'ignore'
      })
      return { success: true }
    } catch (error) {
      console.error('Failed to launch VS Code:', error)
      return { success: false, error: 'Failed to launch VS Code. Make sure VS Code is installed and available in PATH.' }
    }
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
}
