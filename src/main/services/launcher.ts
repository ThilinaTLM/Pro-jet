import { spawn, ChildProcess } from 'child_process'
import { existsSync } from 'fs'
import { which } from 'shelljs'
import { logger } from '../utils/logger'
import { PlatformUtils } from '../utils/platform'
import { defaultsManager } from '../config/defaults'
import { EditorConfig } from '@common/models'

export interface LaunchResult {
  success: boolean
  error?: string
  command?: string
  args?: string[]
}

export interface LaunchOptions {
  detached?: boolean
  stdio?: 'ignore' | 'inherit' | 'pipe'
  shell?: boolean
  cwd?: string
}

class LauncherService {
  private static instance: LauncherService

  static getInstance(): LauncherService {
    if (!LauncherService.instance) {
      LauncherService.instance = new LauncherService()
    }
    return LauncherService.instance
  }

  private async checkCommandExists(command: string): Promise<boolean> {
    try {
      // Use shelljs which() for cross-platform command checking
      const result = which(command)
      return result !== null
    } catch (error) {
      logger.debug(`Command check failed for ${command}`, 'LauncherService', error)
      return false
    }
  }

  private async tryLaunchWithVariants(
    commands: string[],
    args: string[],
    options: LaunchOptions = {}
  ): Promise<LaunchResult> {
    const defaultOptions: LaunchOptions = {
      detached: true,
      stdio: 'ignore',
      shell: PlatformUtils.isWindows(),
      ...options
    }

    for (const command of commands) {
      try {
        logger.debug(`Attempting to launch: ${command} ${args.join(' ')}`, 'LauncherService')

        // Check if command exists first
        const exists = await this.checkCommandExists(command)
        if (!exists) {
          logger.debug(`Command not found: ${command}`, 'LauncherService')
          continue
        }

        const child: ChildProcess = spawn(command, args, defaultOptions)

        // Wait a bit to see if the process starts successfully
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve(true)
          }, 500)

          child.on('error', (error) => {
            clearTimeout(timeout)
            reject(error)
          })

          child.on('spawn', () => {
            clearTimeout(timeout)
            resolve(true)
          })
        })

        logger.info(`Successfully launched: ${command} ${args.join(' ')}`, 'LauncherService')
        return {
          success: true,
          command,
          args
        }
      } catch (error) {
        logger.debug(`Failed to launch ${command}`, 'LauncherService', error)
        continue
      }
    }

    return {
      success: false,
      error: `Failed to launch any of the attempted commands: ${commands.join(', ')}`
    }
  }

  async launchEditor(
    editorType: keyof Omit<EditorConfig, 'terminal'>,
    directoryPath: string,
    customCommand?: string
  ): Promise<LaunchResult> {
    try {
      logger.info(`Launching ${editorType} for directory: ${directoryPath}`, 'LauncherService')

      // Validate directory exists
      if (!existsSync(directoryPath)) {
        const error = `Directory does not exist: ${directoryPath}`
        logger.error(error, 'LauncherService')
        return { success: false, error }
      }

      let commands: string[]

      if (customCommand) {
        commands = [customCommand]
      } else {
        commands = defaultsManager.getSupportedEditorVariants(editorType)
      }

      if (commands.length === 0) {
        const error = `No supported commands found for ${editorType}`
        logger.error(error, 'LauncherService')
        return { success: false, error }
      }

      return await this.tryLaunchWithVariants(commands, [directoryPath])
    } catch (error) {
      const errorMessage = `Failed to launch ${editorType}: ${error}`
      logger.error(errorMessage, 'LauncherService', error)
      return { success: false, error: errorMessage }
    }
  }

  async launchTerminal(directoryPath: string, customTerminals?: string[]): Promise<LaunchResult> {
    try {
      logger.info(`Launching terminal for directory: ${directoryPath}`, 'LauncherService')

      // Validate directory exists
      if (!existsSync(directoryPath)) {
        const error = `Directory does not exist: ${directoryPath}`
        logger.error(error, 'LauncherService')
        return { success: false, error }
      }

      const terminals = customTerminals || defaultsManager.getSupportedTerminals()

      for (const terminal of terminals) {
        try {
          const result = await this.launchTerminalWithCommand(terminal, directoryPath)
          if (result.success) {
            return result
          }
        } catch (error) {
          logger.debug(`Failed to launch terminal ${terminal}`, 'LauncherService', error)
          continue
        }
      }

      return {
        success: false,
        error: `Failed to launch any terminal. Tried: ${terminals.join(', ')}`
      }
    } catch (error) {
      const errorMessage = `Failed to launch terminal: ${error}`
      logger.error(errorMessage, 'LauncherService', error)
      return { success: false, error: errorMessage }
    }
  }

  private async launchTerminalWithCommand(
    terminal: string,
    directoryPath: string
  ): Promise<LaunchResult> {
    let command: string
    let args: string[] = []

    if (PlatformUtils.isWindows()) {
      switch (terminal) {
        case 'wt':
          command = 'wt'
          args = ['-d', directoryPath]
          break
        case 'cmd':
          command = 'cmd'
          args = ['/c', 'start', 'cmd', '/k', `cd /d "${directoryPath}"`]
          break
        case 'powershell':
          command = 'powershell'
          args = [
            '-Command',
            `Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "${directoryPath}"'`
          ]
          break
        case 'pwsh':
          command = 'pwsh'
          args = [
            '-Command',
            `Start-Process pwsh -ArgumentList '-NoExit', '-Command', 'Set-Location "${directoryPath}"'`
          ]
          break
        default:
          command = terminal
          args = [directoryPath]
      }
    } else if (PlatformUtils.isMacOS()) {
      if (terminal.startsWith('open -a')) {
        const appName = terminal.replace('open -a ', '')
        command = 'open'
        args = ['-a', appName, directoryPath]
      } else {
        command = terminal
        args = [directoryPath]
      }
    } else {
      // Linux/Unix
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
        case 'terminator':
          args = ['--working-directory', directoryPath]
          break
        case 'tilix':
          args = ['--working-directory', directoryPath]
          break
        case 'xterm':
          args = ['-e', 'bash', '-c', `cd "${directoryPath}" && bash`]
          break
        default:
          args = ['--working-directory', directoryPath]
      }
    }

    return await this.tryLaunchWithVariants([command], args, {
      shell: PlatformUtils.isWindows()
    })
  }

  async validateConfiguration(
    config: EditorConfig
  ): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = []

    // Validate each editor command
    for (const [editorType, command] of Object.entries(config)) {
      if (editorType === 'terminal') {
        // Validate terminal array
        const terminals = command as string[]
        for (const terminal of terminals) {
          const exists = await this.checkCommandExists(terminal.split(' ')[0])
          if (!exists) {
            issues.push(`Terminal command not found: ${terminal}`)
          }
        }
      } else {
        // Validate editor command
        const exists = await this.checkCommandExists(command as string)
        if (!exists) {
          issues.push(`Editor command not found: ${command} (${editorType})`)
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }
}

export const launcherService = LauncherService.getInstance()
