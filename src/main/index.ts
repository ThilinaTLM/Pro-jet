import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp as electronAppUtils, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { logger } from './utils/logger'
import { PlatformUtils } from './utils/platform'
import { ipcHandlers } from './handlers/ipc-handlers'

class ElectronApp {
  private mainWindow: BrowserWindow | null = null

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Electron application', 'ElectronApp')

      // Log platform information
      PlatformUtils.logPlatformInfo()

      // Set app user model id for windows
      electronAppUtils.setAppUserModelId('com.electron')

      // Setup IPC handlers
      await ipcHandlers.setupHandlers()

      // Setup app event listeners
      this.setupAppEventListeners()

      logger.info('Electron application initialized successfully', 'ElectronApp')
    } catch (error) {
      logger.error('Failed to initialize Electron application', 'ElectronApp', error)
      throw error
    }
  }

  private setupAppEventListeners(): void {
    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow()
      }
    })

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on('window-all-closed', () => {
      if (!PlatformUtils.isMacOS()) {
        this.cleanup()
        app.quit()
      }
    })

    app.on('before-quit', () => {
      this.cleanup()
    })

    logger.debug('App event listeners setup complete', 'ElectronApp')
  }

  createWindow(): void {
    try {
      logger.info('Creating main window', 'ElectronApp')

      // Create the browser window with platform-specific configurations
      const windowConfig = this.getWindowConfig()
      this.mainWindow = new BrowserWindow(windowConfig)

      // Setup window event listeners
      this.setupWindowEventListeners()

      // Load the application content
      this.loadApplicationContent()

      logger.info('Main window created successfully', 'ElectronApp')
    } catch (error) {
      logger.error('Failed to create main window', 'ElectronApp', error)
      throw error
    }
  }

  private getWindowConfig(): Electron.BrowserWindowConstructorOptions {
    const baseConfig: Electron.BrowserWindowConstructorOptions = {
      width: 400,
      height: 750,
      minWidth: 400,
      minHeight: 500,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        nodeIntegration: true,
        sandbox: false,
        contextIsolation: false // Consider enabling this for better security
      }
    }

    // Platform-specific configurations
    if (PlatformUtils.isMacOS()) {
      return {
        ...baseConfig,
        titleBarStyle: 'hiddenInset',
        trafficLightPosition: { x: 10, y: 10 }
      }
    } else if (PlatformUtils.isLinux()) {
      return {
        ...baseConfig,
        icon,
        titleBarStyle: 'hidden'
      }
    } else {
      // Windows
      return {
        ...baseConfig,
        titleBarStyle: 'hidden'
      }
    }
  }

  private setupWindowEventListeners(): void {
    if (!this.mainWindow) return

    this.mainWindow.on('ready-to-show', () => {
      if (this.mainWindow) {
        this.mainWindow.show()
        logger.info('Main window shown', 'ElectronApp')
      }
    })

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
      logger.info('Main window closed', 'ElectronApp')
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      logger.info(`Opening external URL: ${details.url}`, 'ElectronApp')
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // Handle window errors
    this.mainWindow.webContents.on('unresponsive', () => {
      logger.warn('Main window became unresponsive', 'ElectronApp')
    })

    this.mainWindow.webContents.on('responsive', () => {
      logger.info('Main window became responsive again', 'ElectronApp')
    })

    logger.debug('Window event listeners setup complete', 'ElectronApp')
  }

  private loadApplicationContent(): void {
    if (!this.mainWindow) return

    try {
      // HMR for renderer based on electron-vite cli.
      // Load the remote URL for development or the local html file for production.
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        logger.info(
          `Loading development URL: ${process.env['ELECTRON_RENDERER_URL']}`,
          'ElectronApp'
        )
        this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
      } else {
        const htmlPath = join(__dirname, '../renderer/index.html')
        logger.info(`Loading production HTML: ${htmlPath}`, 'ElectronApp')
        this.mainWindow.loadFile(htmlPath)
      }
    } catch (error) {
      logger.error('Failed to load application content', 'ElectronApp', error)
      throw error
    }
  }

  private cleanup(): void {
    try {
      logger.info('Cleaning up application resources', 'ElectronApp')

      // Remove all IPC handlers
      ipcHandlers.removeAllHandlers()

      // Close main window if it exists
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.close()
      }

      logger.info('Application cleanup complete', 'ElectronApp')
    } catch (error) {
      logger.error('Error during application cleanup', 'ElectronApp', error)
    }
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }
}

// Create application instance
const electronApp = new ElectronApp()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  try {
    await electronApp.initialize()
    electronApp.createWindow()
  } catch (error) {
    logger.error('Failed to start application', 'Main', error)
    app.quit()
  }
})

// Handle application errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', 'Main', error)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', 'Main', { reason, promise })
})

// Export for potential testing or external access
export { electronApp }

// Export services and utilities for testing and external access
export { logger } from './utils/logger'
export { PlatformUtils } from './utils/platform'
export { defaultsManager } from './config/defaults'
export { storeService } from './services/store'
export { launcherService } from './services/launcher'
export { ipcHandlers } from './handlers/ipc-handlers'
