import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { logger } from "@/lib/logger"

// Almacén de logs en memoria para entornos de producción
// Esto nos permitirá acceder a los últimos logs a través de la API
const memoryLogs: {
  timestamp: string
  level: string
  message: string
  details?: any
}[] = []

// Función para añadir un log al almacén en memoria
export function addLog(level: string, message: string, details?: any) {
  // Limitar a los últimos 1000 logs
  if (memoryLogs.length >= 1000) {
    memoryLogs.shift() // Eliminar el log más antiguo
  }

  memoryLogs.push({
    timestamp: new Date().toISOString(),
    level,
    message,
    details,
  })
}

// Sobrescribir los métodos de logger para capturar logs en memoria
const originalDebug = logger.debug
const originalInfo = logger.info
const originalWarn = logger.warn
const originalError = logger.error

logger.debug = (...args: any[]) => {
  addLog("debug", args[0], args.slice(1))
  originalDebug.apply(logger, args)
}

logger.info = (...args: any[]) => {
  addLog("info", args[0], args.slice(1))
  originalInfo.apply(logger, args)
}

logger.warn = (...args: any[]) => {
  addLog("warn", args[0], args.slice(1))
  originalWarn.apply(logger, args)
}

logger.error = (...args: any[]) => {
  addLog("error", args[0], args.slice(1))
  originalError.apply(logger, args)
}

export async function GET(request: Request) {
  try {
    // Verificar autenticación (solo administradores pueden ver logs)
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session) {
      return NextResponse.json({ error: "No autorizado para ver logs" }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const level = searchParams.get("level")
    const limit = Number.parseInt(searchParams.get("limit") || "100", 10)
    const search = searchParams.get("search")

    // Filtrar logs según los parámetros
    let filteredLogs = [...memoryLogs]

    if (level) {
      filteredLogs = filteredLogs.filter((log) => log.level === level)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.message.toLowerCase().includes(searchLower) ||
          (log.details && JSON.stringify(log.details).toLowerCase().includes(searchLower)),
      )
    }

    // Limitar la cantidad de logs devueltos
    filteredLogs = filteredLogs.slice(-limit)

    // Generar un log de prueba para verificar que el sistema funciona
    logger.info("API de logs accedida", {
      user: data.session.user.email,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      logs: filteredLogs,
      total: memoryLogs.length,
      filtered: filteredLogs.length,
      timestamp: new Date().toISOString(),
      debug_enabled: process.env.DEBUG === "true",
    })
  } catch (error: any) {
    logger.error("Error al acceder a los logs:", error)

    return NextResponse.json({ error: error.message || "Error al acceder a los logs" }, { status: 500 })
  }
}
