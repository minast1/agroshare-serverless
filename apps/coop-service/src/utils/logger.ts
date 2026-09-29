import { env } from '../config/env'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class CustomLogger {
  private moduleName: string

  // The constructor accepts a module context namespace
  constructor(moduleName: string) {
    this.moduleName = moduleName
  }

  private log(level: LogLevel, message: string, meta?: Record<string, any>) {
    const timestamp = new Date().toISOString()
    const isProduction = env.NODE_ENV === 'production'

    if (isProduction) {
      // 1. Production output optimized for CloudWatch JSON search parsing
      console.log(
        JSON.stringify({
          timestamp,
          level: level.toUpperCase(),
          module: this.moduleName,
          message,
          ...meta,
        })
      )
    } else {
      // 2. Beautiful terminal formatting for local development
      const colors = {
        info: '\x1b[36m',  // Cyan
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
        debug: '\x1b[35m', // Magenta
        reset: '\x1b[0m',
      }

      const color = colors[level] || colors.reset
      const metaString = meta ? ` | ${JSON.stringify(meta)}` : ''

      console.log(
        `[${timestamp}] ${color}${level.toUpperCase()}${colors.reset} [${this.moduleName}]: ${message}${metaString}`
      )
    }
  }

  public info(message: string, meta?: Record<string, any>) { this.log('info', message, meta) }
  public warn(message: string, meta?: Record<string, any>) { this.log('warn', message, meta) }
  public error(message: string, meta?: Record<string, any>) { this.log('error', message, meta) }
  public debug(message: string, meta?: Record<string, any>) { this.log('debug', message, meta) }
}

// Helper function to spin up contextual module instances easily
export const createLogger = (moduleName: string) => new CustomLogger(moduleName)