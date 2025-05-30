import { EditorConfig } from '@common/models'
import { PlatformUtils, Platform } from '../utils/platform'
import { logger } from '../utils/logger'

export interface PlatformDefaults {
  editors: EditorConfig
  supportedTerminals: string[]
  supportedEditors: {
    cursor: string[]
    vscode: string[]
    idea: string[]
  }
}

class DefaultsManager {
  private static instance: DefaultsManager
  private platformDefaults: Map<Platform, PlatformDefaults> = new Map()

  private constructor() {
    this.initializePlatformDefaults()
  }

  static getInstance(): DefaultsManager {
    if (!DefaultsManager.instance) {
      DefaultsManager.instance = new DefaultsManager()
    }
    return DefaultsManager.instance
  }

  private initializePlatformDefaults(): void {
    // Windows defaults
    this.platformDefaults.set(Platform.WINDOWS, {
      editors: {
        cursor: 'cursor',
        vscode: 'code',
        idea: 'idea64',
        terminal: ['wt', 'cmd', 'powershell']
      },
      supportedTerminals: [
        'wt', // Windows Terminal
        'cmd', // Command Prompt
        'powershell', // PowerShell
        'pwsh', // PowerShell Core
        'git-bash' // Git Bash
      ],
      supportedEditors: {
        cursor: ['cursor.exe', 'cursor'],
        vscode: ['code.exe', 'code'],
        idea: ['idea64.exe', 'idea64', 'idea.exe', 'idea']
      }
    })

    // macOS defaults
    this.platformDefaults.set(Platform.MACOS, {
      editors: {
        cursor: 'cursor',
        vscode: 'code',
        idea: 'idea',
        terminal: ['open -a Terminal', 'open -a iTerm', 'open -a Alacritty', 'open -a Kitty']
      },
      supportedTerminals: [
        'open -a Terminal',
        'open -a iTerm',
        'open -a Alacritty',
        'open -a Kitty',
        'open -a Warp'
      ],
      supportedEditors: {
        cursor: ['cursor', '/Applications/Cursor.app/Contents/MacOS/Cursor'],
        vscode: ['code', '/Applications/Visual Studio Code.app/Contents/MacOS/Electron'],
        idea: ['idea', '/Applications/IntelliJ IDEA.app/Contents/MacOS/idea']
      }
    })

    // Linux defaults
    this.platformDefaults.set(Platform.LINUX, {
      editors: {
        cursor: 'cursor',
        vscode: 'code',
        idea: 'idea',
        terminal: ['gnome-terminal', 'konsole', 'xfce4-terminal', 'alacritty', 'kitty', 'xterm']
      },
      supportedTerminals: [
        'gnome-terminal', // GNOME Terminal
        'konsole', // KDE Konsole
        'xfce4-terminal', // XFCE Terminal
        'alacritty', // Alacritty
        'kitty', // Kitty
        'terminator', // Terminator
        'tilix', // Tilix
        'xterm', // xterm
        'urxvt', // rxvt-unicode
        'st' // Simple Terminal
      ],
      supportedEditors: {
        cursor: ['cursor'],
        vscode: ['code', 'code-insiders'],
        idea: ['idea', 'intellij-idea-ultimate', 'intellij-idea-community']
      }
    })

    logger.info('Platform defaults initialized', 'DefaultsManager')
  }

  getCurrentPlatformDefaults(): PlatformDefaults {
    const platform = PlatformUtils.getCurrentPlatform()
    const defaults = this.platformDefaults.get(platform)

    if (!defaults) {
      logger.error(`No defaults found for platform: ${platform}`, 'DefaultsManager')
      throw new Error(`Unsupported platform: ${platform}`)
    }

    return defaults
  }

  getEditorDefaults(): EditorConfig {
    return this.getCurrentPlatformDefaults().editors
  }

  getSupportedTerminals(): string[] {
    return this.getCurrentPlatformDefaults().supportedTerminals
  }

  getSupportedEditorVariants(editor: keyof EditorConfig): string[] {
    if (editor === 'terminal') {
      return this.getSupportedTerminals()
    }

    const defaults = this.getCurrentPlatformDefaults()
    return defaults.supportedEditors[editor as keyof typeof defaults.supportedEditors] || []
  }

  validateEditorConfig(config: EditorConfig): { isValid: boolean; issues: string[] } {
    const issues: string[] = []
    const defaults = this.getCurrentPlatformDefaults()

    // Validate each editor
    Object.entries(config).forEach(([key, value]) => {
      if (key === 'terminal') {
        if (!Array.isArray(value) || value.length === 0) {
          issues.push(`Terminal configuration must be a non-empty array`)
        } else {
          const unsupportedTerminals = value.filter(
            (terminal) => !defaults.supportedTerminals.includes(terminal)
          )
          if (unsupportedTerminals.length > 0) {
            issues.push(`Unsupported terminals: ${unsupportedTerminals.join(', ')}`)
          }
        }
      } else {
        const editorKey = key as keyof typeof defaults.supportedEditors
        const supportedVariants = defaults.supportedEditors[editorKey]
        if (supportedVariants && !supportedVariants.includes(value as string)) {
          issues.push(
            `Unsupported ${key} configuration: ${value}. Supported: ${supportedVariants.join(', ')}`
          )
        }
      }
    })

    return {
      isValid: issues.length === 0,
      issues
    }
  }

  autoFixEditorConfig(config: EditorConfig): EditorConfig {
    const defaults = this.getCurrentPlatformDefaults()
    const fixedConfig = { ...config }

    // Auto-fix each editor with platform-specific defaults
    Object.keys(defaults.editors).forEach((key) => {
      const editorKey = key as keyof EditorConfig
      if (editorKey === 'terminal') {
        if (!Array.isArray(fixedConfig.terminal) || fixedConfig.terminal.length === 0) {
          fixedConfig.terminal = defaults.editors.terminal
          logger.warn(`Auto-fixed terminal configuration`, 'DefaultsManager')
        }
      } else {
        const currentValue = fixedConfig[editorKey] as string
        const supportedVariants =
          defaults.supportedEditors[editorKey as keyof typeof defaults.supportedEditors]

        if (supportedVariants && !supportedVariants.includes(currentValue)) {
          fixedConfig[editorKey] = defaults.editors[editorKey] as any
          logger.warn(
            `Auto-fixed ${editorKey} configuration from ${currentValue} to ${defaults.editors[editorKey]}`,
            'DefaultsManager'
          )
        }
      }
    })

    return fixedConfig
  }
}

export const defaultsManager = DefaultsManager.getInstance()
