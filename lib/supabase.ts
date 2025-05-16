import { createClient } from "@supabase/supabase-js"
import { logger } from "./logger"

// Verificar que estamos en el servidor de manera más precisa
const isServer = typeof window === "undefined"

// Solo lanzar error si se importa desde el cliente en el navegador
if (!isServer && typeof window !== "undefined") {
  logger.warn("El módulo Redis se está importando desde el cliente. Esto puede causar errores.")
}

// Función para crear el cliente de Supabase con manejo de errores
export function createSupabaseClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error("Credenciales de Supabase no disponibles")
      throw new Error("Supabase credentials missing")
    }

    logger.info("Creando cliente de Supabase")

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Configurar para que la sesión se persista entre recargas de página
        persistSession: true,
        // Usar localStorage para la sesión
        storageKey: "termilink_auth_token",
        // Permitir actualización automática del token
        autoRefreshToken: true,
        // Detectar parámetros en la URL para autenticación
        detectSessionInUrl: true,
      },
    })
  } catch (error) {
    logger.error("Error al crear cliente de Supabase:", error)
    throw error
  }
}

// Singleton pattern para evitar múltiples instancias en el cliente
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    try {
      supabaseInstance = createSupabaseClient()
      logger.info("Cliente Supabase creado correctamente")
    } catch (error) {
      logger.error("Error al obtener cliente Supabase:", error)
      throw error
    }
  }
  return supabaseInstance
}

// Exportar directamente para compatibilidad con código existente
export const supabase = getSupabaseClient()

// Tipos para usuarios y sesiones
export type UserSession = {
  user: {
    id: string
    email?: string
  } | null
  session: any | null
  isLoading: boolean
}
