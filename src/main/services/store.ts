import { Repo, EditorConfig } from '@common/models'
import { logger } from '../utils/logger'
import { defaultsManager } from '../config/defaults'

export interface AppStore {
  repos: Repo[]
  theme: 'light' | 'dark' | 'system'
  editors: EditorConfig
}

export interface StoreSchema {
  repos: {
    type: 'array'
    default: Repo[]
    items: {
      type: 'object'
      properties: {
        label: { type: 'string' }
        path: { type: 'string' }
        lastOpened: { type: 'string' }
      }
      required: ['label', 'path', 'lastOpened']
    }
  }
  theme: {
    type: 'string'
    enum: ['light', 'dark', 'system']
    default: 'system'
  }
  editors: {
    type: 'object'
    default: EditorConfig
    properties: {
      cursor: { type: 'string' }
      vscode: { type: 'string' }
      idea: { type: 'string' }
      terminal: {
        type: 'array'
        items: { type: 'string' }
      }
    }
    required: ['cursor', 'vscode', 'idea', 'terminal']
  }
}

class StoreService {
  private static instance: StoreService
  private store: any = null
  private isInitialized = false

  static getInstance(): StoreService {
    if (!StoreService.instance) {
      StoreService.instance = new StoreService()
    }
    return StoreService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      logger.info('Initializing store service', 'StoreService')

      // Dynamic import for electron-store (ESM-only)
      const Store = (await import('electron-store')).default

      const platformDefaults = defaultsManager.getEditorDefaults()

      const schema: StoreSchema = {
        repos: {
          type: 'array',
          default: [],
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              path: { type: 'string' },
              lastOpened: { type: 'string' }
            },
            required: ['label', 'path', 'lastOpened']
          }
        },
        theme: {
          type: 'string',
          enum: ['light', 'dark', 'system'],
          default: 'system'
        },
        editors: {
          type: 'object',
          default: platformDefaults,
          properties: {
            cursor: { type: 'string' },
            vscode: { type: 'string' },
            idea: { type: 'string' },
            terminal: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['cursor', 'vscode', 'idea', 'terminal']
        }
      }

      this.store = new Store<AppStore>({
        schema: schema as any,
        defaults: {
          repos: [],
          theme: 'system',
          editors: platformDefaults
        },
        clearInvalidConfig: true,
        migrations: {
          '>=1.0.0': (_store) => {
            // Migration logic for future versions
            logger.info('Running store migrations', 'StoreService')
          }
        }
      })

      // Validate and auto-fix editor configuration on startup
      await this.validateAndFixEditorConfig()

      this.isInitialized = true
      logger.info('Store service initialized successfully', 'StoreService')
    } catch (error) {
      logger.error('Failed to initialize store service', 'StoreService', error)
      throw error
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
  }

  private async validateAndFixEditorConfig(): Promise<void> {
    try {
      const currentConfig = this.store.get('editors', defaultsManager.getEditorDefaults())
      const validation = defaultsManager.validateEditorConfig(currentConfig)

      if (!validation.isValid) {
        logger.warn('Invalid editor configuration detected', 'StoreService', validation.issues)

        const fixedConfig = defaultsManager.autoFixEditorConfig(currentConfig)
        this.store.set('editors', fixedConfig)

        logger.info('Editor configuration auto-fixed', 'StoreService')
      } else {
        logger.debug('Editor configuration is valid', 'StoreService')
      }
    } catch (error) {
      logger.error('Failed to validate editor configuration', 'StoreService', error)
    }
  }

  // Repository management
  async getRepos(): Promise<Repo[]> {
    await this.ensureInitialized()

    try {
      const repos = this.store.get('repos', [])
      // Convert lastOpened strings back to Date objects
      const convertedRepos = repos.map((repo: any) => ({
        ...repo,
        lastOpened: new Date(repo.lastOpened)
      }))

      logger.debug(`Retrieved ${convertedRepos.length} repositories`, 'StoreService')
      return convertedRepos
    } catch (error) {
      logger.error('Failed to get repositories', 'StoreService', error)
      return []
    }
  }

  async setRepos(repos: Repo[]): Promise<void> {
    await this.ensureInitialized()

    try {
      // Validate repos data
      const validRepos = repos.filter(
        (repo) => repo.label && repo.path && repo.lastOpened instanceof Date
      )

      if (validRepos.length !== repos.length) {
        logger.warn(
          `Filtered out ${repos.length - validRepos.length} invalid repositories`,
          'StoreService'
        )
      }

      // Convert Date objects to strings for storage
      const serializedRepos = validRepos.map((repo) => ({
        ...repo,
        lastOpened: repo.lastOpened.toISOString()
      }))

      this.store.set('repos', serializedRepos)
      logger.info(`Saved ${serializedRepos.length} repositories`, 'StoreService')
    } catch (error) {
      logger.error('Failed to set repositories', 'StoreService', error)
      throw error
    }
  }

  async addRepo(repo: Repo): Promise<void> {
    const repos = await this.getRepos()

    // Check for duplicates
    const existingIndex = repos.findIndex((r) => r.path === repo.path)
    if (existingIndex >= 0) {
      // Update existing repo
      repos[existingIndex] = repo
      logger.info(`Updated existing repository: ${repo.label}`, 'StoreService')
    } else {
      // Add new repo
      repos.push(repo)
      logger.info(`Added new repository: ${repo.label}`, 'StoreService')
    }

    await this.setRepos(repos)
  }

  async removeRepo(path: string): Promise<void> {
    const repos = await this.getRepos()
    const filteredRepos = repos.filter((repo) => repo.path !== path)

    if (filteredRepos.length !== repos.length) {
      await this.setRepos(filteredRepos)
      logger.info(`Removed repository with path: ${path}`, 'StoreService')
    } else {
      logger.warn(`Repository not found for removal: ${path}`, 'StoreService')
    }
  }

  // Theme management
  async getTheme(): Promise<'light' | 'dark' | 'system'> {
    await this.ensureInitialized()

    try {
      const theme = this.store.get('theme', 'system')
      logger.debug(`Retrieved theme: ${theme}`, 'StoreService')
      return theme
    } catch (error) {
      logger.error('Failed to get theme', 'StoreService', error)
      return 'system'
    }
  }

  async setTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
    await this.ensureInitialized()

    try {
      this.store.set('theme', theme)
      logger.info(`Set theme to: ${theme}`, 'StoreService')
    } catch (error) {
      logger.error('Failed to set theme', 'StoreService', error)
      throw error
    }
  }

  // Editor configuration management
  async getEditors(): Promise<EditorConfig> {
    await this.ensureInitialized()

    try {
      const editors = this.store.get('editors', defaultsManager.getEditorDefaults())
      logger.debug('Retrieved editor configuration', 'StoreService', editors)
      return editors
    } catch (error) {
      logger.error('Failed to get editor configuration', 'StoreService', error)
      return defaultsManager.getEditorDefaults()
    }
  }

  async setEditors(editors: EditorConfig): Promise<void> {
    await this.ensureInitialized()

    try {
      // Validate configuration before saving
      const validation = defaultsManager.validateEditorConfig(editors)

      if (!validation.isValid) {
        logger.warn('Invalid editor configuration provided', 'StoreService', validation.issues)

        // Auto-fix the configuration
        const fixedConfig = defaultsManager.autoFixEditorConfig(editors)
        this.store.set('editors', fixedConfig)
        logger.info('Editor configuration auto-fixed and saved', 'StoreService')
      } else {
        this.store.set('editors', editors)
        logger.info('Editor configuration saved', 'StoreService')
      }
    } catch (error) {
      logger.error('Failed to set editor configuration', 'StoreService', error)
      throw error
    }
  }

  async resetEditorsToDefaults(): Promise<void> {
    const defaults = defaultsManager.getEditorDefaults()
    await this.setEditors(defaults)
    logger.info('Reset editor configuration to platform defaults', 'StoreService')
  }

  // Store management
  async clearStore(): Promise<void> {
    await this.ensureInitialized()

    try {
      this.store.clear()
      logger.info('Store cleared', 'StoreService')
    } catch (error) {
      logger.error('Failed to clear store', 'StoreService', error)
      throw error
    }
  }

  async getStoreSize(): Promise<number> {
    await this.ensureInitialized()

    try {
      return this.store.size
    } catch (error) {
      logger.error('Failed to get store size', 'StoreService', error)
      return 0
    }
  }

  async getStorePath(): Promise<string> {
    await this.ensureInitialized()

    try {
      return this.store.path
    } catch (error) {
      logger.error('Failed to get store path', 'StoreService', error)
      return ''
    }
  }
}

export const storeService = StoreService.getInstance()
