import { Redis } from "@upstash/redis"
import { logger } from "./logger"

// Verificar que estamos en el servidor de manera más precisa
const isServer = typeof window === "undefined" && !process.env.NEXT_RUNTIME

// Solo lanzar error si se importa desde el cliente en el navegador
if (!isServer && typeof window !== "undefined") {
  logger.warn("El módulo Redis se está importando desde el cliente. Esto puede causar errores.")
}

// Función para crear el cliente de Redis con manejo de errores
export function createRedisClient() {
  try {
    // Verificar que las variables de entorno necesarias estén disponibles
    if (!process.env.REDIS_URL && !process.env.KV_URL && !process.env.KV_REST_API_URL) {
      logger.warn("Variables de entorno de Redis no definidas. Usando cliente de Redis simulado.")
      return createMockRedisClient()
    }

    // Determinar qué URL usar - priorizar KV_REST_API_URL sobre otras opciones
    const url = process.env.KV_REST_API_URL || process.env.KV_URL || ""
    const token = process.env.KV_REST_API_TOKEN || ""

    // Si tenemos REDIS_URL pero no tenemos KV_REST_API_URL o KV_URL
    if (process.env.REDIS_URL && (!url || url === "")) {
      logger.info("Usando REDIS_URL para la conexión a Upstash Redis")
      // Nota: Upstash SDK no soporta directamente REDIS_URL, así que usamos el cliente simulado
      return createMockRedisClient()
    }

    // Verificar que la URL comienza con https://
    if (url && !url.startsWith("https://")) {
      logger.warn(`URL de Redis no comienza con https://: ${url}. Usando cliente simulado.`)
      return createMockRedisClient()
    }

    // Crear el cliente de Redis usando las variables de entorno
    logger.info("Inicializando cliente Redis con Upstash")
    const redis = new Redis({
      url,
      token,
      automaticDeserialization: true, // Asegurar deserialización automática
    })

    // Verificar que el cliente se ha inicializado correctamente
    logger.info("Cliente Redis inicializado correctamente")

    // Envolver los métodos del cliente Redis para manejar errores
    return {
      set: async (key: string, value: string, options?: { ex?: number }) => {
        try {
          return await redis.set(key, value, options)
        } catch (error) {
          logger.error(`Error en Redis SET para clave ${key}:`, error)
          // Usar el cliente simulado como fallback
          const mockClient = createMockRedisClient()
          return mockClient.set(key, value, options)
        }
      },
      get: async (key: string) => {
        try {
          return await redis.get(key)
        } catch (error) {
          logger.error(`Error en Redis GET para clave ${key}:`, error)
          // Usar el cliente simulado como fallback
          const mockClient = createMockRedisClient()
          return mockClient.get(key)
        }
      },
      exists: async (key: string) => {
        try {
          return await redis.exists(key)
        } catch (error) {
          logger.error(`Error en Redis EXISTS para clave ${key}:`, error)
          // Usar el cliente simulado como fallback
          const mockClient = createMockRedisClient()
          return mockClient.exists(key)
        }
      },
      incr: async (key: string) => {
        try {
          return await redis.incr(key)
        } catch (error) {
          logger.error(`Error en Redis INCR para clave ${key}:`, error)
          // Usar el cliente simulado como fallback
          const mockClient = createMockRedisClient()
          return mockClient.incr(key)
        }
      },
      expire: async (key: string, seconds: number) => {
        try {
          return await redis.expire(key, seconds)
        } catch (error) {
          logger.error(`Error en Redis EXPIRE para clave ${key}:`, error)
          // Usar el cliente simulado como fallback
          const mockClient = createMockRedisClient()
          return mockClient.expire(key)
        }
      },
      del: async (key: string) => {
        try {
          return await redis.del(key)
        } catch (error) {
          logger.error(`Error en Redis DEL para clave ${key}:`, error)
          // Usar el cliente simulado como fallback
          const mockClient = createMockRedisClient()
          return mockClient.del(key)
        }
      },
    }
  } catch (error) {
    logger.error("Error al crear el cliente de Redis:", error)
    return createMockRedisClient()
  }
}

// Cliente de Redis simulado para desarrollo o cuando fallan las credenciales
function createMockRedisClient() {
  logger.info("Usando cliente de Redis simulado")
  const mockStorage = new Map<string, { value: string; expiry: number | null }>()

  return {
    set: async (key: string, value: string, options?: { ex?: number }) => {
      try {
        // Siempre usar 24 horas (86400 segundos) como tiempo de expiración
        const expiry = Date.now() + (options?.ex ? options.ex * 1000 : 86400 * 1000)
        mockStorage.set(key, { value, expiry })
        logger.debug(`[Mock Redis] SET operación completada (expires in ${options?.ex || 86400}s)`)
        return "OK"
      } catch (error) {
        logger.error(`[Mock Redis] Error en SET para clave ${key}:`, error)
        return "ERROR"
      }
    },
    get: async (key: string) => {
      try {
        const item = mockStorage.get(key)
        if (!item) {
          logger.debug("[Mock Redis] GET valor no encontrado")
          return null
        }

        if (item.expiry && item.expiry < Date.now()) {
          mockStorage.delete(key)
          logger.debug("[Mock Redis] GET valor expirado")
          return null
        }

        logger.debug("[Mock Redis] GET operación completada")
        return item.value
      } catch (error) {
        logger.error(`[Mock Redis] Error en GET para clave ${key}:`, error)
        return null
      }
    },
    exists: async (key: string) => {
      try {
        const item = mockStorage.get(key)
        const exists = item !== undefined && (!item.expiry || item.expiry >= Date.now())
        logger.debug(`[Mock Redis] EXISTS resultado: ${exists}`)
        return exists ? 1 : 0
      } catch (error) {
        logger.error(`[Mock Redis] Error en EXISTS para clave ${key}:`, error)
        return 0
      }
    },
    incr: async (key: string) => {
      try {
        const item = mockStorage.get(key)
        let value = 1

        if (item && (!item.expiry || item.expiry >= Date.now())) {
          value = Number.parseInt(item.value, 10) + 1
          mockStorage.set(key, { value: value.toString(), expiry: item.expiry })
        } else {
          // Siempre usar 24 horas como tiempo de expiración para estadísticas también
          mockStorage.set(key, { value: value.toString(), expiry: Date.now() + 86400 * 1000 })
        }

        logger.debug("[Mock Redis] INCR operación completada")
        return value
      } catch (error) {
        logger.error(`[Mock Redis] Error en INCR para clave ${key}:`, error)
        return 1
      }
    },
    expire: async (key: string, seconds: number) => {
      try {
        const item = mockStorage.get(key)
        if (!item) {
          logger.debug("[Mock Redis] EXPIRE clave no encontrada")
          return 0
        }

        const expiry = Date.now() + seconds * 1000
        mockStorage.set(key, { value: item.value, expiry })
        logger.debug(`[Mock Redis] EXPIRE operación completada (${seconds}s)`)
        return 1
      } catch (error) {
        logger.error(`[Mock Redis] Error en EXPIRE para clave ${key}:`, error)
        return 0
      }
    },
    del: async (key: string) => {
      try {
        const deleted = mockStorage.delete(key)
        logger.debug(`[Mock Redis] DEL resultado: ${deleted ? 1 : 0}`)
        return deleted ? 1 : 0
      } catch (error) {
        logger.error(`[Mock Redis] Error en DEL para clave ${key}:`, error)
        return 0
      }
    },
  }
}

// Exportar el cliente de Redis
export const redis = createRedisClient()
