import { ipcMain, dialog, app, webUtils } from 'electron'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { getStore } from './store'
import { Repo, EditorConfig } from '@common/models'
import { IpcEvents } from '@common/ipc-events'

export function setupIpcHandlers(): void {
  // Store handlers
  ipcMain.handle(IpcEvents.StoreGetRepos, async () => {
    const store = await getStore()
    const repos = store.get('repos', [])
    // Convert lastOpened strings back to Date objects
    return repos.map((repo) => ({
      ...repo,
      lastOpened: new Date(repo.lastOpened)
    }))
  })

  ipcMain.handle(IpcEvents.StoreSetRepos, async (_, repos: Repo[]) => {
    const store = await getStore()
    // Convert Date objects to strings for storage
    const serializedRepos = repos.map((repo) => ({
      ...repo,
      lastOpened: repo.lastOpened.toISOString()
    }))
    store.set('repos', serializedRepos)
  })

  ipcMain.handle(IpcEvents.StoreGetTheme, async () => {
    const store = await getStore()
    return store.get('theme', 'system')
  })

  ipcMain.handle(IpcEvents.StoreSetTheme, async (_, theme: 'light' | 'dark' | 'system') => {
    const store = await getStore()
    store.set('theme', theme)
  })

  ipcMain.handle(IpcEvents.StoreGetEditors, async () => {
    const store = await getStore()
    return store.get('editors')
  })

  ipcMain.handle(IpcEvents.StoreSetEditors, async (_, editors: EditorConfig) => {
    const store = await getStore()
    store.set('editors', editors)
  })

  ipcMain.handle(IpcEvents.CloseWindow, async () => {
    console.log('Closing window')
    app.quit()
  })

  // Directory selection handler
  ipcMain.handle(IpcEvents.SelectDirectory, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

  // Check if path is directory handler
  ipcMain.handle(IpcEvents.CheckIsDirectory, async (_, file: File) => {
    try {
      const path = await webUtils.getPathForFile(file)
      const stats = await fs.stat(path)
      if (stats.isDirectory()) {
        return path
      }
      return null
    } catch (error) {
      console.error('Error checking if path is directory:', error)
      return null
    }
  })

  ipcMain.handle(IpcEvents.LaunchCursor, async (_, directoryPath: string) => {
    try {
      const store = await getStore()
      const editors = store.get('editors')
      const cursorBinary = editors.cursor || 'cursor'

      spawn(cursorBinary, [directoryPath], {
        detached: true,
        stdio: 'ignore'
      })
      return { success: true }
    } catch (error) {
      console.error('Failed to launch Cursor:', error)
      return {
        success: false,
        error: 'Failed to launch Cursor. Make sure Cursor is installed and available in PATH.'
      }
    }
  })

  ipcMain.handle(IpcEvents.LaunchVscode, async (_, directoryPath: string) => {
    try {
      const store = await getStore()
      const editors = store.get('editors')
      const vscodeBinary = editors.vscode || 'code'

      spawn(vscodeBinary, [directoryPath], {
        detached: true,
        stdio: 'ignore'
      })
      return { success: true }
    } catch (error) {
      console.error('Failed to launch VS Code:', error)
      return {
        success: false,
        error: 'Failed to launch VS Code. Make sure VS Code is installed and available in PATH.'
      }
    }
  })

  ipcMain.handle(IpcEvents.LaunchTerminal, async (_, directoryPath: string) => {
    try {
      const store = await getStore()
      const editors = store.get('editors')

      // Platform-specific terminal configurations
      let terminals: string[] = []

      if (process.platform === 'win32') {
        // Windows terminals
        terminals = editors.terminal || [
          'wt', // Windows Terminal
          'cmd', // Command Prompt
          'powershell' // PowerShell
        ]
      } else if (process.platform === 'darwin') {
        // macOS terminals
        terminals = editors.terminal || [
          'open -a Terminal', // Default Terminal
          'open -a iTerm', // iTerm2
          'open -a Alacritty', // Alacritty
          'open -a Kitty' // Kitty
        ]
      } else {
        // Linux/Unix terminals
        terminals = editors.terminal || [
          'gnome-terminal',
          'konsole',
          'xfce4-terminal',
          'alacritty',
          'kitty',
          'xterm'
        ]
      }

      for (const terminal of terminals) {
        try {
          let command: string
          let args: string[] = []

          if (process.platform === 'win32') {
            // Windows terminal handling
            switch (terminal) {
              case 'wt':
                // Windows Terminal
                command = 'wt'
                args = ['-d', directoryPath]
                break
              case 'cmd':
                // Command Prompt
                command = 'cmd'
                args = ['/c', 'start', 'cmd', '/k', `cd /d "${directoryPath}"`]
                break
              case 'powershell':
                // PowerShell
                command = 'powershell'
                args = [
                  '-Command',
                  `Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "${directoryPath}"'`
                ]
                break
              default:
                command = terminal
                args = [directoryPath]
            }
          } else if (process.platform === 'darwin') {
            // macOS terminal handling
            if (terminal.startsWith('open -a')) {
              const appName = terminal.replace('open -a ', '')
              command = 'open'
              args = ['-a', appName, directoryPath]
            } else {
              command = terminal
              args = [directoryPath]
            }
          } else {
            // Linux/Unix terminal handling
            command = terminal
            switch (terminal) {
              case 'gnome-terminal':
                args = ['--working-directory', directoryPath]
                break
              case 'konsole':
                args = ['--workdir', directoryPath]
                break
              case 'xfce4-terminal':
                args = ['--working-directory', directoryPath]
                break
              case 'alacritty':
                args = ['--working-directory', directoryPath]
                break
              case 'kitty':
                args = ['--directory', directoryPath]
                break
              case 'xterm':
                // xterm doesn't have a direct working directory option
                args = ['-e', 'bash', '-c', `cd "${directoryPath}" && bash`]
                break
              default:
                args = [directoryPath]
            }
          }

          spawn(command, args, {
            detached: true,
            stdio: 'ignore',
            shell: process.platform === 'win32' // Use shell on Windows for better compatibility
          })
          return { success: true }
        } catch (error) {
          // Try next terminal
          continue
        }
      }

      // If all terminals fail, return error
      throw new Error('No supported terminal found')
    } catch (error) {
      console.error('Failed to launch Terminal:', error)
      return {
        success: false,
        error: `Failed to launch Terminal on ${process.platform}. Make sure a terminal emulator is installed.`
      }
    }
  })

  ipcMain.handle(IpcEvents.LaunchIdea, async (_, directoryPath: string) => {
    try {
      const store = await getStore()
      const editors = store.get('editors')
      const ideaBinary = editors.idea || 'idea'

      spawn(ideaBinary, [directoryPath], {
        detached: true,
        stdio: 'ignore'
      })
      return { success: true }
    } catch (error) {
      console.error('Failed to launch Idea:', error)
      return {
        success: false,
        error: 'Failed to launch Idea. Make sure Idea is installed and available in PATH.'
      }
    }
  })
}
