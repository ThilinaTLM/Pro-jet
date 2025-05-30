import { ipcMain, dialog, app } from 'electron'
import { spawn } from 'child_process'
import { getStore } from './store'
import { Repo, EditorConfig } from '@common/models'
import { IpcEvents } from '@common/ipc-events'

// Helper function to get platform-specific binary names with fallbacks
function getPlatformBinary(baseName: string, customBinary?: string): string[] {
  if (customBinary) {
    return [customBinary]
  }

  const platform = process.platform
  const binaries: string[] = []

  if (platform === 'win32') {
    // Windows: try both with and without .exe extension
    binaries.push(`${baseName}.exe`, baseName)
  } else {
    // macOS and Linux: use base name
    binaries.push(baseName)
  }

  return binaries
}

// Helper function to try launching with multiple binary options
async function tryLaunchEditor(
  binaries: string[],
  directoryPath: string,
  editorName: string
): Promise<{ success: boolean; error?: string }> {
  for (const binary of binaries) {
    try {
      spawn(binary, [directoryPath], {
        detached: true,
        stdio: 'ignore'
      })
      return { success: true }
    } catch (error) {
      // Continue to next binary option
      continue
    }
  }

  return {
    success: false,
    error: `Failed to launch ${editorName}. Make sure ${editorName} is installed and available in PATH. Tried: ${binaries.join(', ')}`
  }
}

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

  ipcMain.handle(IpcEvents.LaunchCursor, async (_, directoryPath: string) => {
    try {
      const store = await getStore()
      const editors = store.get('editors')
      const binaries = getPlatformBinary('cursor', editors.cursor)

      return await tryLaunchEditor(binaries, directoryPath, 'Cursor')
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
      const binaries = getPlatformBinary('code', editors.vscode)

      return await tryLaunchEditor(binaries, directoryPath, 'VS Code')
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

      // Use configured terminals from store (which now has platform-specific defaults)
      const terminals = editors.terminal

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
                // Try as direct command with .exe fallback
                const binaries = getPlatformBinary(terminal)
                command = binaries[0]
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
                args = ['--working-directory', directoryPath] // Generic fallback
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
        error: `Failed to launch Terminal on ${process.platform}`
      }
    }
  })

  ipcMain.handle(IpcEvents.LaunchIdea, async (_, directoryPath: string) => {
    try {
      const store = await getStore()
      const editors = store.get('editors')
      
      // IntelliJ IDEA has different binary names on different platforms
      let binaries: string[]
      if (editors.idea) {
        binaries = [editors.idea]
      } else {
        const platform = process.platform
        if (platform === 'win32') {
          binaries = ['idea64.exe', 'idea64', 'idea.exe', 'idea']
        } else if (platform === 'darwin') {
          binaries = ['idea', '/Applications/IntelliJ IDEA.app/Contents/MacOS/idea']
        } else {
          binaries = ['idea', 'intellij-idea-ultimate', 'intellij-idea-community']
        }
      }

      return await tryLaunchEditor(binaries, directoryPath, 'IntelliJ IDEA')
    } catch (error) {
      console.error('Failed to launch IntelliJ IDEA:', error)
      return {
        success: false,
        error: 'Failed to launch IntelliJ IDEA. Make sure IntelliJ IDEA is installed and available in PATH.'
      }
    }
  })
}
