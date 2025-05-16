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

// Lista de slugs de ejemplo para desarrollo/fallback
const SAMPLE_SLUGS = ["abc123", "xyz789", "def456", "ghi789", "jkl012"]

// Función para obtener métricas del sistema
export async function getSystemMetrics(): Promise<SystemMetrics> {
  try {
    // Inicializar contadores
    let totalUrls = 0
    let totalClicks = 0
    let lastUrl = null

    // Obtener URLs usando la función getLatestUrls
    const urls = await getLatestUrls(100) // Obtener hasta 100 URLs para calcular métricas

    totalUrls = urls.length

    // Calcular total de clicks
    totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0)

    // Calcular promedio de clicks
    const averageClicksPerUrl = totalUrls > 0 ? Math.round((totalClicks / totalUrls) * 100) / 100 : 0

    // Obtener la última URL (la primera de la lista)
    if (urls.length > 0) {
      lastUrl = {
        slug: urls[0].slug,
        originalUrl: urls[0].originalUrl,
        createdAt: urls[0].createdAt,
        clicks: urls[0].clicks,
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
    // En lugar de usar keys(), vamos a usar una estrategia alternativa
    // Primero, intentaremos obtener datos de un índice de URLs si existe
    const urlIndex = await redis.get("url_index")
    let slugs: string[] = []

    if (urlIndex) {
      try {
        // Si existe un índice, lo parseamos
        const parsedIndex = JSON.parse(urlIndex as string)
        if (Array.isArray(parsedIndex)) {
          slugs = parsedIndex.slice(0, limit)
        }
      } catch (parseError) {
        logger.error("Error al parsear índice de URLs:", parseError)
      }
    }

    // Si no hay slugs del índice, usamos una lista de muestra para desarrollo
    if (slugs.length === 0) {
      // Intentar obtener algunos slugs conocidos
      for (const slug of SAMPLE_SLUGS) {
        const exists = await redis.exists(slug)
        if (exists) {
          slugs.push(slug)
          if (slugs.length >= limit) break
        }
      }
    }

    // Si aún no tenemos slugs, devolvemos un array vacío
    if (slugs.length === 0) {
      return []
    }

    // Obtener detalles de cada URL
    const urlsPromises = slugs.map(async (slug) => {
      const originalUrl = await redis.get(slug)
      const clicks = await redis.get(`stats:${slug}`)

      return {
        slug,
        originalUrl: originalUrl || "",
        clicks: clicks ? Number.parseInt(clicks as string, 10) : 0,
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

    const clicks = await redis.get(`stats:${slug}`)

    return {
      slug,
      originalUrl: originalUrl as string,
      clicks: clicks ? Number.parseInt(clicks as string, 10) : 0,
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

      // Actualizar el índice de URLs si existe
      try {
        const urlIndex = await redis.get("url_index")
        if (urlIndex) {
          const parsedIndex = JSON.parse(urlIndex as string)
          if (Array.isArray(parsedIndex)) {
            const newIndex = parsedIndex.filter((s) => s !== slug)
            await redis.set("url_index", JSON.stringify(newIndex))
          }
        }
      } catch (indexError) {
        logger.warn("Error al actualizar índice de URLs:", indexError)
        // No bloqueamos la eliminación por este error
      }
    }

    return true
  } catch (error) {
    logger.error(`Error al eliminar URL ${slug}:`, error)
    return false
  }
}
