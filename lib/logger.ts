/**
 * Sistema de logging personalizado para TermiLink
 * Permite controlar qué tipos de mensajes se muestran en la consola
 */

// Niveles de log disponibles
export type LogLevel = "debug" | "info" | "warn" | "error" | "none"

// Configuración del logger
interface LoggerConfig {
  // Nivel mínimo de log que se mostrará
  minLevel: LogLevel
  // Si es true, se mostrarán los logs incluso en producción
  forceLogsInProduction: boolean
  // Prefijos para cada tipo de log
  prefixes: Record<Exclude<LogLevel, "none">, string>
  // Patrones de texto para suprimir (expresiones regulares o strings)
  suppressPatterns: (RegExp | string)[]
}

// Configuración por defecto
const defaultConfig: LoggerConfig = {
  // En producción, mostrar logs de nivel info y superior si DEBUG está habilitado
  minLevel: process.env.DEBUG === "true" ? "debug" : process.env.NODE_ENV === "production" ? "info" : "debug",
  // Forzar logs en producción si DEBUG está habilitado
  forceLogsInProduction: process.env.DEBUG === "true",
  prefixes: {
    debug: "[DEBUG]",
    info: "[INFO]",
    warn: "[WARN]",
    error: "[ERROR]",
  },
  suppressPatterns: [
    // Suprimir advertencias comunes que no son relevantes
    /Warning: ReactDOM.render is no longer supported/,
    /Warning: React.createFactory$$$$ is deprecated/,
    /Warning: Using UNSAFE_/,
    /Warning: ReactDOM.render has not been supported/,
    /Warning: React.jsx: type is invalid/,
    /Este módulo solo debe importarse desde el servidor/,
    /Variables de entorno de Redis no definidas/,
    /URL de Redis no comienza con https/,
    /Usando cliente de Redis simulado/,
    // Añadir más patrones según sea necesario
  ],
}

// Mapeo de niveles de log a valores numéricos para comparación
const logLevelValue: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
}

// Clase Logger
export class Logger {
  private config: LoggerConfig
  private originalConsole: typeof console

  constructor(config: Partial<LoggerConfig> = {}) {
    // Combinar la configuración por defecto con la proporcionada
    this.config = { ...defaultConfig, ...config }

    // Guardar referencia a los métodos originales de console
    this.originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    }
  }

  // Método para verificar si un mensaje debe ser suprimido
  private shouldSuppress(message: any): boolean {
    // Si estamos en modo DEBUG, no suprimir nada
    if (process.env.DEBUG === "true") return false

    if (!message || typeof message !== "string") return false

    return this.config.suppressPatterns.some((pattern) => {
      if (pattern instanceof RegExp) {
        return pattern.test(message)
      }
      return message.includes(pattern)
    })
  }

  // Método para verificar si un nivel de log debe ser mostrado
  private shouldLog(level: LogLevel): boolean {
    // En producción, mostrar logs si está forzado o si DEBUG está habilitado
    if (process.env.NODE_ENV === "production") {
      return this.config.forceLogsInProduction || process.env.DEBUG === "true" || level === "error"
    }

    return logLevelValue[level] >= logLevelValue[this.config.minLevel]
  }

  // Métodos de logging
  debug(...args: any[]): void {
    if (this.shouldLog("debug") && !this.shouldSuppress(args[0])) {
      this.originalConsole.debug(this.config.prefixes.debug, ...args)
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog("info") && !this.shouldSuppress(args[0])) {
      this.originalConsole.info(this.config.prefixes.info, ...args)
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog("warn") && !this.shouldSuppress(args[0])) {
      this.originalConsole.warn(this.config.prefixes.warn, ...args)
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog("error") && !this.shouldSuppress(args[0])) {
      this.originalConsole.error(this.config.prefixes.error, ...args)
    }
  }

  // Método para sobrescribir los métodos de console
  overrideConsole(): void {
    console.debug = (...args: any[]) => this.debug(...args)
    console.log = (...args: any[]) => this.info(...args)
    console.info = (...args: any[]) => this.info(...args)
    console.warn = (...args: any[]) => this.warn(...args)
    console.error = (...args: any[]) => this.error(...args)
  }

  // Método para restaurar los métodos originales de console
  restoreConsole(): void {
    console.debug = this.originalConsole.debug
    console.log = this.originalConsole.log
    console.info = this.originalConsole.info
    console.warn = this.originalConsole.warn
    console.error = this.originalConsole.error
  }
}

// Crear una instancia global del logger
export const logger = new Logger()

// Función para suprimir advertencias específicas
export function suppressWarnings() {
  // Sobrescribir console.warn para filtrar advertencias
  const originalWarn = console.warn
  console.warn = (...args: any[]) => {
    // Si DEBUG está habilitado, no suprimir nada
    if (process.env.DEBUG === "true") {
      originalWarn.apply(console, args)
      return
    }

    // Verificar si el mensaje coincide con algún patrón a suprimir
    if (args[0] && typeof args[0] === "string") {
      for (const pattern of defaultConfig.suppressPatterns) {
        if (pattern instanceof RegExp) {
          if (pattern.test(args[0])) return
        } else if (args[0].includes(pattern)) {
          return
        }
      }
    }
    // Si no coincide con ningún patrón, mostrar la advertencia
    originalWarn.apply(console, args)
  }
}

// Exportar una función para inicializar el logger en la aplicación
export function initializeLogger(config: Partial<LoggerConfig> = {}) {
  // En producción, suprimir todas las advertencias por defecto a menos que DEBUG esté habilitado
  if (process.env.NODE_ENV === "production" && process.env.DEBUG !== "true") {
    suppressWarnings()
  }

  // Si se proporciona una configuración personalizada, crear un nuevo logger
  if (Object.keys(config).length > 0) {
    const customLogger = new Logger(config)

    // Si se desea, sobrescribir los métodos de console
    if (config.forceLogsInProduction || process.env.NODE_ENV !== "production" || process.env.DEBUG === "true") {
      customLogger.overrideConsole()
    }

    return customLogger
  }

  return logger
}
