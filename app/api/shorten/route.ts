import { redis } from "@/lib/redis"
import { generateUrlKey, isValidUrl, normalizeUrl, getUniqueShortId } from "@/lib/utils"
import { type NextRequest, NextResponse } from "next/server"

// Función para log condicional (solo en desarrollo)
const log = (message: string) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(message)
  }
}

// Función para log de error condicional (solo en desarrollo)
const logError = (message: string, error?: any) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(message, error)
  }
}

// Límite máximo de caracteres para una URL
const URL_MAX_LENGTH = 2000

export async function POST(request: NextRequest) {
  let requestData
  try {
    // Verificar que la solicitud es JSON válido
    try {
      requestData = await request.json()
    } catch (jsonError) {
      logError("Error al parsear JSON de la solicitud:", jsonError)
      return NextResponse.json(
        { success: false, error: "Formato de solicitud inválido. Se esperaba JSON." },
        { status: 400 },
      )
    }

    const { url, lang = "es" } = requestData
    log(`Procesando solicitud para acortar URL. Idioma: ${lang}`)

    // Validar la URL con nuestra función mejorada (no permitir IPs)
    if (!url || !isValidUrl(url, false)) {
      log(`URL inválida: ${url}`)
      const errorMessage =
        lang === "es"
          ? "La URL no parece válida. Asegúrate de que incluya un dominio real y comience con http:// o https://"
          : "The URL doesn't seem valid. Make sure it includes a real domain and starts with http:// or https://"
      return NextResponse.json({ success: false, error: errorMessage }, { status: 400 })
    }

    // Validar longitud de la URL
    if (url.length > URL_MAX_LENGTH) {
      log(`URL demasiado larga: ${url.length} caracteres`)
      const errorMessage =
        lang === "es"
          ? `URL demasiado larga. El límite es de ${URL_MAX_LENGTH} caracteres.`
          : `URL too long. The limit is ${URL_MAX_LENGTH} characters.`
      return NextResponse.json({ success: false, error: errorMessage }, { status: 400 })
    }

    // Normalizar la URL (asegurarse de que tiene protocolo)
    const normalizedUrl = normalizeUrl(url)
    log("URL normalizada correctamente")

    // Generar una clave para esta URL
    const urlKey = generateUrlKey(normalizedUrl)

    // Comprobar si esta URL ya existe en la base de datos
    let shortId: string | null = null
    let isExistingUrl = false

    try {
      // Optimización: Usar directamente get en lugar de exists + get
      shortId = await redis.get(urlKey)

      if (shortId) {
        log("URL existente encontrada")

        // Verificar que el ID también existe (podría haber expirado)
        const idExists = await redis.exists(shortId)

        if (idExists) {
          isExistingUrl = true
          log("ID existe, es una URL existente válida")
        } else {
          log("ID no existe, aunque la clave URL sí. Creando nuevo ID.")
          shortId = null // Forzar la creación de un nuevo ID
        }
      } else {
        log(`URL no encontrada en la base de datos. Es nueva.`)
      }
    } catch (lookupError) {
      logError(`Error al buscar URL existente:`, lookupError)
      // Continuamos con un nuevo ID si hay error
    }

    // Si la URL ya existe, reinstaurar el TTL y devolver el ID existente
    if (isExistingUrl && shortId) {
      log("URL ya existe. Reinstaurando TTL.")

      // Restaurar URL con TTL extendido
      const ttl = 60 * 60 * 24 // 24 horas
      try {
        // Reiniciar el TTL de la URL original
        await redis.expire(shortId, ttl)
        // Reiniciar el TTL del índice
        await redis.expire(urlKey, ttl)
        log("TTL reinstaurado correctamente")
      } catch (redisError) {
        logError(`Error al reinstaurar TTL:`, redisError)
        // Continuamos, intentando devolver la URL existente
      }
    } else {
      // Si la URL no existe, generar un nuevo ID corto usando la función extraída
      shortId = await getUniqueShortId()

      if (!shortId) {
        logError("No se pudo generar un ID único después de múltiples intentos")
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
        log("Nueva URL guardada con TTL de 24h")
      } catch (redisError) {
        logError(`Error al guardar en Redis:`, redisError)
        const errorMessage =
          lang === "es"
            ? "Error al guardar la URL. Por favor, inténtalo de nuevo."
            : "Error saving the URL. Please try again."
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
      }
    }

    // Construir la URL corta - Usar URL absoluta con mejor detección de protocolo
    const host = request.headers.get("host") || process.env.VERCEL_URL || "localhost:3000"
    const protocol = request.headers.get("x-forwarded-proto") || "https"
    const shortUrl = `${protocol}://${host}/go/${shortId}`
    log("URL corta generada correctamente")

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
      hour12: locale === "en-US",
    }

    let expirationFormatted
    try {
      expirationFormatted = expirationDate.toLocaleString(locale, options)
    } catch (dateError) {
      logError("Error al formatear la fecha:", dateError)
      // Fallback simple en caso de error
      expirationFormatted = expirationDate.toISOString()
    }

    // Asegurarse de que la respuesta sea JSON válido
    return new NextResponse(
      JSON.stringify({
        success: true,
        shortUrl,
        shortId,
        expiration: {
          seconds: 60 * 60 * 24,
          formatted: expirationFormatted,
        },
        isExistingUrl,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    logError("Error general al acortar URL:", error)
    const errorMessage =
      requestData?.lang === "es"
        ? "Ocurrió un error al acortar la URL. Por favor, inténtalo de nuevo."
        : "An error occurred while shortening the URL. Please try again."

    // Asegurarse de que la respuesta de error sea JSON válido
    return new NextResponse(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
