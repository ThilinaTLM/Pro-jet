import { logger } from './logger'

export enum Platform {
  WINDOWS = 'win32',
  MACOS = 'darwin',
  LINUX = 'linux'
}

export class PlatformUtils {
  static getCurrentPlatform(): Platform {
    return process.platform as Platform
  }

  static isWindows(): boolean {
    return process.platform === Platform.WINDOWS
  }

  static isMacOS(): boolean {
    return process.platform === Platform.MACOS
  }

  static isLinux(): boolean {
    return process.platform === Platform.LINUX
  }

  static getPlatformName(): string {
    switch (process.platform) {
      case Platform.WINDOWS:
        return 'Windows'
      case Platform.MACOS:
        return 'macOS'
      case Platform.LINUX:
        return 'Linux'
      default:
        return 'Unknown'
    }
  }

  static getExecutableExtension(): string {
    return this.isWindows() ? '.exe' : ''
  }

  static getShellCommand(): string {
    if (this.isWindows()) {
      return 'cmd'
    } else {
      return 'bash'
    }
  }

  static getPathSeparator(): string {
    return this.isWindows() ? '\\' : '/'
  }

  static logPlatformInfo(): void {
    logger.info(`Platform: ${this.getPlatformName()} (${process.platform})`, 'Platform')
    logger.info(`Architecture: ${process.arch}`, 'Platform')
    logger.info(`Node version: ${process.version}`, 'Platform')
    logger.info(`Electron version: ${process.versions.electron}`, 'Platform')
  }

  static normalizeCommand(command: string): string {
    // Add .exe extension on Windows if not present
    if (this.isWindows() && !command.includes('.') && !command.includes(' ')) {
      return `${command}.exe`
    }
    return command
  }
}
