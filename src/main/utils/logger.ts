import { app } from 'electron'
import { join } from 'path'
import { writeFileSync, existsSync, mkdirSync } from 'fs'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO
  private logFile: string
  private isDev: boolean

  constructor() {
    this.isDev = process.env.NODE_ENV === 'development'
    this.logLevel = this.isDev ? LogLevel.DEBUG : LogLevel.INFO

    // Create logs directory in user data
    const userDataPath = app.getPath('userData')
    const logsDir = join(userDataPath, 'logs')

    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true })
    }

    this.logFile = join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`)
  }

  private formatMessage(level: string, message: string, context?: string): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` [${context}]` : ''
    return `[${timestamp}] ${level}${contextStr}: ${message}`
  }

  private writeToFile(message: string): void {
    try {
      writeFileSync(this.logFile, message + '\n', { flag: 'a' })
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  private log(
    level: LogLevel,
    levelName: string,
    message: string,
    context?: string,
    data?: any
  ): void {
    if (level < this.logLevel) return

    const formattedMessage = this.formatMessage(levelName, message, context)

    // Console output with colors in development
    if (this.isDev) {
      const colors = {
        DEBUG: '\x1b[36m', // Cyan
        INFO: '\x1b[32m', // Green
        WARN: '\x1b[33m', // Yellow
        ERROR: '\x1b[31m' // Red
      }
      console.log(`${colors[levelName]}${formattedMessage}\x1b[0m`)
      if (data) {
        console.log(data)
      }
    }

    // Always write to file
    this.writeToFile(formattedMessage)
    if (data) {
      this.writeToFile(JSON.stringify(data, null, 2))
    }
  }

  debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, context, data)
  }

  info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, context, data)
  }

  warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, context, data)
  }

  error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, context, data)
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }
}

export const logger = new Logger()
