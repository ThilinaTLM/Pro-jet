import { ipcMain, dialog, app } from 'electron'
import { IpcEvents } from '@common/ipc-events'
import { Repo, EditorConfig } from '@common/models'
import { logger } from '../utils/logger'
import { storeService } from '../services/store'
import { launcherService } from '../services/launcher'

export class IpcHandlers {
  private static instance: IpcHandlers

  static getInstance(): IpcHandlers {
    if (!IpcHandlers.instance) {
      IpcHandlers.instance = new IpcHandlers()
    }
    return IpcHandlers.instance
  }

  async setupHandlers(): Promise<void> {
    logger.info('Setting up IPC handlers', 'IpcHandlers')

    // Initialize services
    await storeService.initialize()

    // Store handlers
    this.setupStoreHandlers()

    // Application handlers
    this.setupAppHandlers()

    // Launcher handlers
    this.setupLauncherHandlers()

    logger.info('IPC handlers setup complete', 'IpcHandlers')
  }

  private setupStoreHandlers(): void {
    // Repository handlers
    ipcMain.handle(IpcEvents.StoreGetRepos, async () => {
      try {
        logger.debug('Handling get repos request', 'IpcHandlers')
        return await storeService.getRepos()
      } catch (error) {
        logger.error('Failed to get repos', 'IpcHandlers', error)
        throw error
      }
    })

    ipcMain.handle(IpcEvents.StoreSetRepos, async (_, repos: Repo[]) => {
      try {
        logger.debug(`Handling set repos request with ${repos.length} repos`, 'IpcHandlers')
        await storeService.setRepos(repos)
      } catch (error) {
        logger.error('Failed to set repos', 'IpcHandlers', error)
        throw error
      }
    })

    // Theme handlers
    ipcMain.handle(IpcEvents.StoreGetTheme, async () => {
      try {
        logger.debug('Handling get theme request', 'IpcHandlers')
        return await storeService.getTheme()
      } catch (error) {
        logger.error('Failed to get theme', 'IpcHandlers', error)
        throw error
      }
    })

    ipcMain.handle(IpcEvents.StoreSetTheme, async (_, theme: 'light' | 'dark' | 'system') => {
      try {
        logger.debug(`Handling set theme request: ${theme}`, 'IpcHandlers')
        await storeService.setTheme(theme)
      } catch (error) {
        logger.error('Failed to set theme', 'IpcHandlers', error)
        throw error
      }
    })

    // Editor configuration handlers
    ipcMain.handle(IpcEvents.StoreGetEditors, async () => {
      try {
        logger.debug('Handling get editors request', 'IpcHandlers')
        return await storeService.getEditors()
      } catch (error) {
        logger.error('Failed to get editors', 'IpcHandlers', error)
        throw error
      }
    })

    ipcMain.handle(IpcEvents.StoreSetEditors, async (_, editors: EditorConfig) => {
      try {
        logger.debug('Handling set editors request', 'IpcHandlers', editors)
        await storeService.setEditors(editors)
      } catch (error) {
        logger.error('Failed to set editors', 'IpcHandlers', error)
        throw error
      }
    })

    logger.debug('Store handlers registered', 'IpcHandlers')
  }

  private setupAppHandlers(): void {
    // Window management
    ipcMain.handle(IpcEvents.CloseWindow, async () => {
      try {
        logger.info('Handling close window request', 'IpcHandlers')
        app.quit()
      } catch (error) {
        logger.error('Failed to close window', 'IpcHandlers', error)
        throw error
      }
    })

    // Directory selection
    ipcMain.handle(IpcEvents.SelectDirectory, async () => {
      try {
        logger.debug('Handling select directory request', 'IpcHandlers')

        const result = await dialog.showOpenDialog({
          properties: ['openDirectory'],
          title: 'Select Project Directory'
        })

        if (!result.canceled && result.filePaths.length > 0) {
          const selectedPath = result.filePaths[0]
          logger.info(`Directory selected: ${selectedPath}`, 'IpcHandlers')
          return selectedPath
        }

        logger.debug('Directory selection cancelled', 'IpcHandlers')
        return null
      } catch (error) {
        logger.error('Failed to select directory', 'IpcHandlers', error)
        throw error
      }
    })

    logger.debug('App handlers registered', 'IpcHandlers')
  }

  private setupLauncherHandlers(): void {
    // Cursor launcher
    ipcMain.handle(IpcEvents.LaunchCursor, async (_, directoryPath: string) => {
      try {
        logger.info(`Handling launch Cursor request for: ${directoryPath}`, 'IpcHandlers')

        const editors = await storeService.getEditors()
        const result = await launcherService.launchEditor('cursor', directoryPath, editors.cursor)

        if (!result.success) {
          logger.warn(`Failed to launch Cursor: ${result.error}`, 'IpcHandlers')
        }

        return result
      } catch (error) {
        logger.error('Failed to handle Cursor launch', 'IpcHandlers', error)
        return {
          success: false,
          error: `Failed to launch Cursor: ${error}`
        }
      }
    })

    // VS Code launcher
    ipcMain.handle(IpcEvents.LaunchVscode, async (_, directoryPath: string) => {
      try {
        logger.info(`Handling launch VS Code request for: ${directoryPath}`, 'IpcHandlers')

        const editors = await storeService.getEditors()
        const result = await launcherService.launchEditor('vscode', directoryPath, editors.vscode)

        if (!result.success) {
          logger.warn(`Failed to launch VS Code: ${result.error}`, 'IpcHandlers')
        }

        return result
      } catch (error) {
        logger.error('Failed to handle VS Code launch', 'IpcHandlers', error)
        return {
          success: false,
          error: `Failed to launch VS Code: ${error}`
        }
      }
    })

    // IntelliJ IDEA launcher
    ipcMain.handle(IpcEvents.LaunchIdea, async (_, directoryPath: string) => {
      try {
        logger.info(`Handling launch IntelliJ IDEA request for: ${directoryPath}`, 'IpcHandlers')

        const editors = await storeService.getEditors()
        const result = await launcherService.launchEditor('idea', directoryPath, editors.idea)

        if (!result.success) {
          logger.warn(`Failed to launch IntelliJ IDEA: ${result.error}`, 'IpcHandlers')
        }

        return result
      } catch (error) {
        logger.error('Failed to handle IntelliJ IDEA launch', 'IpcHandlers', error)
        return {
          success: false,
          error: `Failed to launch IntelliJ IDEA: ${error}`
        }
      }
    })

    // Terminal launcher
    ipcMain.handle(IpcEvents.LaunchTerminal, async (_, directoryPath: string) => {
      try {
        logger.info(`Handling launch terminal request for: ${directoryPath}`, 'IpcHandlers')

        const editors = await storeService.getEditors()
        const result = await launcherService.launchTerminal(directoryPath, editors.terminal)

        if (!result.success) {
          logger.warn(`Failed to launch terminal: ${result.error}`, 'IpcHandlers')
        }

        return result
      } catch (error) {
        logger.error('Failed to handle terminal launch', 'IpcHandlers', error)
        return {
          success: false,
          error: `Failed to launch terminal: ${error}`
        }
      }
    })

    logger.debug('Launcher handlers registered', 'IpcHandlers')
  }

  removeAllHandlers(): void {
    logger.info('Removing all IPC handlers', 'IpcHandlers')

    // Remove all registered handlers
    Object.values(IpcEvents).forEach((event) => {
      ipcMain.removeAllListeners(event)
    })

    logger.info('All IPC handlers removed', 'IpcHandlers')
  }
}

export const ipcHandlers = IpcHandlers.getInstance()
