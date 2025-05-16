import { createClient } from "@supabase/supabase-js"

// Verificar que estamos en el servidor
const isServer = typeof window === "undefined"

// Crear cliente de Supabase para el cliente (navegador)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  if (isServer) {
    console.warn("Supabase credentials missing. Authentication will not work properly.")
  }
}

// Singleton pattern para evitar múltiples instancias en el cliente
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Configurar para que la sesión se almacene solo en memoria
        // y no persista cuando se cierra la página
        persistSession: false,
        // Usar localStorage en lugar de cookies para evitar problemas de CORS
        storageKey: "termilink_auth",
        // Establecer un tiempo de expiración corto para la sesión
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
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
