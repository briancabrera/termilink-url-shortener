import { redis } from "@/lib/redis"
import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// Función para log condicional
const logInfo = (message: string) => {
  logger.info(message)
}

const logWarn = (message: string) => {
  logger.warn(message)
}

const logError = (message: string, error?: any) => {
  logger.error(message, error)
}

// Validación de ID: solo permitir caracteres alfanuméricos y longitud razonable
const isValidId = (id: string): boolean => {
  return /^[a-zA-Z0-9]{3,12}$/.test(id)
}

// Validación de URL
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Función para construir URL de error evitando redirecciones infinitas
const buildErrorUrl = (request: NextRequest, errorType: string, id?: string): URL => {
  // Extraer el idioma de la URL o usar el valor por defecto
  const urlParts = request.nextUrl.pathname.split("/")
  const lang = urlParts.length > 1 && (urlParts[1] === "es" || urlParts[1] === "en") ? urlParts[1] : "es"

  // Construir URL de error con el idioma correcto
  return new URL(`/${lang}?error=${errorType}${id ? `&id=${id}` : ""}`, request.nextUrl.origin)
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    logInfo("Procesando solicitud de redirección")

    // Verificar que el ID existe y es válido
    if (!id) {
      logWarn("ID no proporcionado")
      return NextResponse.redirect(buildErrorUrl(request, "missing_id"))
    }

    // Validar formato del ID para evitar consultas innecesarias a Redis
    if (!isValidId(id)) {
      logWarn(`ID inválido: ${id}`)
      return NextResponse.redirect(buildErrorUrl(request, "invalid_id", id))
    }

    // Obtener la URL original de Redis
    let url: string | null
    try {
      url = await redis.get(id)
      logInfo("URL recuperada de Redis correctamente")
    } catch (redisError) {
      logError("Error al conectar con Redis:", redisError)
      // Si hay un error con Redis, redirigimos a la página principal con un parámetro de error
      return NextResponse.redirect(buildErrorUrl(request, "redis_connection"))
    }

    // Si no existe, redirigir a la página not-found
    if (!url) {
      logWarn("URL no encontrada")
      return NextResponse.redirect(buildErrorUrl(request, "url_not_found", id))
    }

    // Asegurarse de que la URL tenga el protocolo correcto
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`
    }

    // Validar que la URL es válida antes de redirigir
    if (!isValidUrl(url)) {
      logError("URL inválida detectada:", url)
      return NextResponse.redirect(buildErrorUrl(request, "invalid_url", id))
    }

    logInfo("Redirigiendo al destino")

    // Intentar incrementar el contador de visitas, pero no bloquear la redirección si falla
    try {
      await redis.incr(`stats:${id}`)
      logInfo("Estadísticas incrementadas correctamente")
    } catch (statsError) {
      logWarn("Error al incrementar estadísticas:", statsError)
      // No bloqueamos la redirección por este error
    }

    // Redirigir a la URL destino
    return NextResponse.redirect(url)
  } catch (error) {
    logError("Error general al procesar la redirección:", error)
    // En caso de error, redirigimos a la página principal con información del error
    return NextResponse.redirect(buildErrorUrl(request, "unknown", id))
  }
}
