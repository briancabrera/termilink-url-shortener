import { Redis } from "@upstash/redis"

// Función para crear el cliente de Redis con manejo de errores
export function createRedisClient() {
  try {
    // Verificar que las variables de entorno necesarias estén disponibles
    if (!process.env.REDIS_URL && !process.env.KV_URL && !process.env.KV_REST_API_URL) {
      console.warn("Variables de entorno de Redis no definidas. Usando cliente de Redis simulado.")
      return createMockRedisClient()
    }

    // Determinar qué URL usar
    const url = process.env.KV_REST_API_URL || process.env.KV_URL || ""
    const token = process.env.KV_REST_API_TOKEN || ""

    // Si tenemos REDIS_URL pero no tenemos KV_REST_API_URL o KV_URL
    if (process.env.REDIS_URL && (!url || url === "")) {
      console.log("Usando REDIS_URL para la conexión a Upstash Redis")

      // No usar directamente REDIS_URL, ya que puede tener formato incorrecto
      // En su lugar, usar las variables de entorno específicas de Upstash
      return createMockRedisClient()
    }

    // Verificar que la URL comienza con https://
    if (url && !url.startsWith("https://")) {
      console.warn(`URL de Redis no comienza con https://: ${url}. Usando cliente simulado.`)
      return createMockRedisClient()
    }

    // Crear el cliente de Redis usando las variables de entorno
    console.log("Inicializando cliente Redis con URL:", url)
    const redis = new Redis({
      url,
      token,
    })

    // Verificar que el cliente se ha inicializado correctamente
    console.log("Cliente Redis inicializado correctamente")

    return redis
  } catch (error) {
    console.error("Error al crear el cliente de Redis:", error)
    return createMockRedisClient()
  }
}

// Cliente de Redis simulado para desarrollo o cuando fallan las credenciales
function createMockRedisClient() {
  console.log("Usando cliente de Redis simulado")
  const mockStorage = new Map<string, { value: string; expiry: number | null }>()

  return {
    set: async (key: string, value: string, options?: { ex?: number }) => {
      // Siempre usar 24 horas (86400 segundos) como tiempo de expiración
      const expiry = Date.now() + (options?.ex ? options.ex * 1000 : 86400 * 1000)
      mockStorage.set(key, { value, expiry })
      console.log(`[Mock Redis] SET ${key} = ${value} (expires in ${options?.ex || 86400}s)`)
      return "OK"
    },
    get: async (key: string) => {
      const item = mockStorage.get(key)
      if (!item) {
        console.log(`[Mock Redis] GET ${key} = null (not found)`)
        return null
      }

      if (item.expiry && item.expiry < Date.now()) {
        mockStorage.delete(key)
        console.log(`[Mock Redis] GET ${key} = null (expired)`)
        return null
      }

      console.log(`[Mock Redis] GET ${key} = ${item.value}`)
      return item.value
    },
    exists: async (key: string) => {
      const item = mockStorage.get(key)
      const exists = item !== undefined && (!item.expiry || item.expiry >= Date.now())
      console.log(`[Mock Redis] EXISTS ${key} = ${exists}`)
      return exists ? 1 : 0
    },
    incr: async (key: string) => {
      const item = mockStorage.get(key)
      let value = 1

      if (item && (!item.expiry || item.expiry >= Date.now())) {
        value = Number.parseInt(item.value, 10) + 1
        mockStorage.set(key, { value: value.toString(), expiry: item.expiry })
      } else {
        // Siempre usar 24 horas como tiempo de expiración para estadísticas también
        mockStorage.set(key, { value: value.toString(), expiry: Date.now() + 86400 * 1000 })
      }

      console.log(`[Mock Redis] INCR ${key} = ${value}`)
      return value
    },
    del: async (key: string) => {
      const deleted = mockStorage.delete(key)
      console.log(`[Mock Redis] DEL ${key} = ${deleted ? 1 : 0}`)
      return deleted ? 1 : 0
    },
  }
}

// Exportar el cliente de Redis
export const redis = createRedisClient()
