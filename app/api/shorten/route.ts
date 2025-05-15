import { redis } from "@/lib/redis"
import { generateShortId, generateUrlKey, isValidUrl, normalizeUrl } from "@/lib/utils"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  let requestData // Declare requestData here
  try {
    // Verificar que la solicitud es JSON válido

    try {
      requestData = await request.json()
    } catch (jsonError) {
      console.error("Error al parsear JSON de la solicitud:", jsonError)
      return NextResponse.json(
        { success: false, error: "Formato de solicitud inválido. Se esperaba JSON." },
        { status: 400 },
      )
    }

    const { url, lang = "es" } = requestData
    console.log(`Solicitud para acortar URL: ${url}, Idioma: ${lang}`)

    // Validar la URL
    if (!url || !isValidUrl(url)) {
      console.log(`URL inválida: ${url}`)
      const errorMessage =
        lang === "es" ? "URL inválida. Por favor, introduce una URL válida." : "Invalid URL. Please enter a valid URL."
      return NextResponse.json({ success: false, error: errorMessage }, { status: 400 })
    }

    // Normalizar la URL (asegurarse de que tiene protocolo)
    const normalizedUrl = normalizeUrl(url)
    console.log(`URL normalizada: ${normalizedUrl}`)

    // Generar una clave para esta URL
    const urlKey = generateUrlKey(normalizedUrl)

    // Comprobar si esta URL ya existe en la base de datos
    let shortId: string | null = null
    try {
      shortId = await redis.get(urlKey)
      console.log(`Comprobando si la URL existe. Key: ${urlKey}, Result: ${shortId}`)
    } catch (lookupError) {
      console.error(`Error al buscar URL existente: ${lookupError}`)
      // Continuamos con un nuevo ID si hay error
    }

    // Si la URL ya existe, reinstaurar el TTL y devolver el ID existente
    if (shortId) {
      console.log(`URL ya existe con ID: ${shortId}. Reinstaurando TTL.`)

      // Restaurar URL con TTL extendido
      const ttl = 60 * 60 * 24 // 24 horas
      try {
        // Verificar que el shortId sigue existiendo (podría haber expirado el ID pero no el índice)
        const idExists = await redis.exists(shortId)
        if (idExists) {
          // Reiniciar el TTL de la URL original
          await redis.expire(shortId, ttl)
          // Reiniciar el TTL del índice
          await redis.expire(urlKey, ttl)
          console.log(`TTL reinstaurado para ID: ${shortId} y Key: ${urlKey}`)
        } else {
          // Si el ID expiró pero el índice no, necesitamos guardar la URL nuevamente
          await redis.set(shortId, normalizedUrl, { ex: ttl })
          console.log(`URL guardada nuevamente con ID existente: ${shortId}`)
        }
      } catch (redisError) {
        console.error(`Error al reinstaurar TTL: ${redisError}`)
        // Continuamos, intentando devolver la URL existente
      }
    } else {
      // Si la URL no existe, generar un nuevo ID corto
      shortId = generateShortId()
      let attempts = 0
      const maxAttempts = 5

      // Verificar que el ID no exista ya
      while (attempts < maxAttempts) {
        try {
          const exists = await redis.exists(shortId)
          if (!exists) break
        } catch (existsError) {
          console.error(`Error al verificar si el ID existe: ${existsError}`)
          break
        }

        shortId = generateShortId()
        attempts++
      }

      if (attempts >= maxAttempts) {
        console.error("No se pudo generar un ID único después de múltiples intentos")
        const errorMessage =
          lang === "es"
            ? "No se pudo generar un ID único. Por favor, inténtalo de nuevo."
            : "Could not generate a unique ID. Please try again."
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
      }

      // Guardar la URL en Redis con un TTL de 24 horas (en segundos)
      const ttl = 60 * 60 * 24 // 24 horas
      try {
        // Guardar la URL con el ID corto
        await redis.set(shortId, normalizedUrl, { ex: ttl })
        // Guardar el índice URL -> ID
        await redis.set(urlKey, shortId, { ex: ttl })
        console.log(`Nueva URL guardada. ID: ${shortId}, URL: ${normalizedUrl}, Key: ${urlKey}, TTL: ${ttl}s (24h)`)
      } catch (redisError) {
        console.error(`Error al guardar en Redis: ${redisError}`)
        const errorMessage =
          lang === "es"
            ? "Error al guardar la URL. Por favor, inténtalo de nuevo."
            : "Error saving the URL. Please try again."
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
      }
    }

    // Construir la URL corta - Usar URL absoluta
    const host = request.headers.get("host") || process.env.VERCEL_URL || "localhost:3000"
    const protocol = host.includes("localhost") ? "http" : "https"
    const shortUrl = `${protocol}://${host}/go/${shortId}`
    console.log(`URL corta generada: ${shortUrl}`)

    // Calcular tiempo de expiración para mostrar al usuario
    const expirationDate = new Date(Date.now() + 60 * 60 * 24 * 1000) // 24 horas desde ahora

    // Formatear la fecha según el idioma
    const locale = lang === "es" ? "es-ES" : "en-US"
    const options = {
      day: "2-digit" as const,
      month: "2-digit" as const,
      year: "numeric" as const,
      hour: "2-digit" as const,
      minute: "2-digit" as const,
      hour12: locale === ("en-US" as boolean),
    }

    const expirationFormatted = expirationDate.toLocaleString(locale, options)

    return NextResponse.json({
      success: true,
      shortUrl,
      shortId,
      expiration: {
        seconds: 60 * 60 * 24,
        formatted: expirationFormatted,
      },
      isExistingUrl: shortId !== null,
    })
  } catch (error) {
    console.error("Error general al acortar URL:", error)
    const errorMessage =
      requestData?.lang === "es"
        ? "Ocurrió un error al acortar la URL. Por favor, inténtalo de nuevo."
        : "An error occurred while shortening the URL. Please try again."
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
