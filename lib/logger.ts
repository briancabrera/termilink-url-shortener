type LogLevel = "info" | "warn" | "error" | "debug"

const isProduction = process.env.NODE_ENV === "production"

// Simple logger utility that can be disabled in production or controlled via env vars
export const logger = {
  info: (message: string, ...args: any[]) => {
    if (!isProduction || process.env.NEXT_PUBLIC_ENABLE_LOGS === "true") {
      console.info(`%c${message}`, "color: #3498db", ...args)
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (!isProduction || process.env.NEXT_PUBLIC_ENABLE_LOGS === "true") {
      console.warn(`%c${message}`, "color: #f39c12", ...args)
    }
  },
  error: (message: string, ...args: any[]) => {
    // Always log errors, even in production
    console.error(`%c${message}`, "color: #e74c3c", ...args)
  },
  debug: (message: string, ...args: any[]) => {
    if ((!isProduction && process.env.NEXT_PUBLIC_DEBUG === "true") || process.env.NEXT_PUBLIC_ENABLE_LOGS === "true") {
      console.debug(`%c${message}`, "color: #2ecc71", ...args)
    }
  },
  log: (level: LogLevel, message: string, ...args: any[]) => {
    switch (level) {
      case "info":
        logger.info(message, ...args)
        break
      case "warn":
        logger.warn(message, ...args)
        break
      case "error":
        logger.error(message, ...args)
        break
      case "debug":
        logger.debug(message, ...args)
        break
    }
  },
}
