import { ipcMain, dialog } from 'electron'
import { spawn } from 'child_process'

export function setupIpcHandlers(): void {
  // IPC handlers
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
