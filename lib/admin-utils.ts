import { redis } from "./redis"
import { logger } from "./logger"

// Tipo para las métricas del sistema
export type SystemMetrics = {
  totalUrls: number
  totalClicks: number
  averageClicksPerUrl: number
  lastUrl: {
    slug: string
    originalUrl: string
    createdAt: string
    clicks: number
  } | null
}

// Tipo para una URL acortada
export type ShortUrl = {
  slug: string
  originalUrl: string
  clicks: number
  createdAt: string
}

// Función para obtener métricas del sistema
export async function getSystemMetrics(): Promise<SystemMetrics> {
  try {
    // Obtener todas las claves que no son estadísticas ni índices
    const keys = await redis.keys("*")
    const urlKeys = keys.filter(
      (key) => !key.startsWith("stats:") && !key.startsWith("url:") && key.length >= 3 && key.length <= 12,
    )

    // Total de URLs
    const totalUrls = urlKeys.length

    // Obtener clicks para cada URL
    let totalClicks = 0
    const clicksPromises = urlKeys.map(async (slug) => {
      const clicks = await redis.get(`stats:${slug}`)
      return clicks ? Number.parseInt(clicks, 10) : 0
    })

    const clicksArray = await Promise.all(clicksPromises)
    totalClicks = clicksArray.reduce((sum, clicks) => sum + clicks, 0)

    // Calcular promedio de clicks
    const averageClicksPerUrl = totalUrls > 0 ? Math.round((totalClicks / totalUrls) * 100) / 100 : 0

    // Obtener la última URL creada (simulado por ahora)
    // En un sistema real, necesitaríamos almacenar timestamps
    let lastUrl = null

    if (urlKeys.length > 0) {
      // Tomamos la primera URL como ejemplo
      const slug = urlKeys[0]
      const originalUrl = await redis.get(slug)
      const clicks = (await redis.get(`stats:${slug}`)) || "0"

      lastUrl = {
        slug,
        originalUrl: originalUrl || "",
        createdAt: new Date().toISOString(),
        clicks: Number.parseInt(clicks, 10),
      }
    }

    return {
      totalUrls,
      totalClicks,
      averageClicksPerUrl,
      lastUrl,
    }
  } catch (error) {
    logger.error("Error al obtener métricas del sistema:", error)
    // Devolver valores por defecto en caso de error
    return {
      totalUrls: 0,
      totalClicks: 0,
      averageClicksPerUrl: 0,
      lastUrl: null,
    }
  }
}

// Función para obtener las últimas URLs
export async function getLatestUrls(limit = 10): Promise<ShortUrl[]> {
  try {
    // Obtener todas las claves que no son estadísticas ni índices
    const keys = await redis.keys("*")
    const urlKeys = keys
      .filter((key) => !key.startsWith("stats:") && !key.startsWith("url:") && key.length >= 3 && key.length <= 12)
      .slice(0, limit)

    // Obtener detalles de cada URL
    const urlsPromises = urlKeys.map(async (slug) => {
      const originalUrl = await redis.get(slug)
      const clicks = (await redis.get(`stats:${slug}`)) || "0"

      return {
        slug,
        originalUrl: originalUrl || "",
        clicks: Number.parseInt(clicks, 10),
        createdAt: new Date().toISOString(), // Simulado
      }
    })

    return await Promise.all(urlsPromises)
  } catch (error) {
    logger.error("Error al obtener las últimas URLs:", error)
    return []
  }
}

// Función para buscar una URL por slug
export async function findUrlBySlug(slug: string): Promise<ShortUrl | null> {
  try {
    if (!slug) return null

    const originalUrl = await redis.get(slug)
    if (!originalUrl) return null

    const clicks = (await redis.get(`stats:${slug}`)) || "0"

    return {
      slug,
      originalUrl,
      clicks: Number.parseInt(clicks, 10),
      createdAt: new Date().toISOString(), // Simulado
    }
  } catch (error) {
    logger.error(`Error al buscar URL por slug ${slug}:`, error)
    return null
  }
}

// Función para eliminar una URL
export async function deleteUrl(slug: string): Promise<boolean> {
  try {
    if (!slug) return false

    // Obtener la URL original para encontrar su clave de índice
    const originalUrl = await redis.get(slug)

    // Eliminar la URL
    await redis.del(slug)

    // Eliminar estadísticas
    await redis.del(`stats:${slug}`)

    // Si tenemos la URL original, eliminar también su índice
    if (originalUrl) {
      // Generar la clave de índice (esto debería coincidir con cómo se genera en utils.ts)
      const urlKey = `url:${originalUrl}`
      await redis.del(urlKey)
    }

    return true
  } catch (error) {
    logger.error(`Error al eliminar URL ${slug}:`, error)
    return false
  }
}
