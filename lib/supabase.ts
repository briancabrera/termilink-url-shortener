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
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
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
    role?: string
  } | null
  session: any | null
  isLoading: boolean
}

// Función para verificar si un usuario es administrador
export const isAdmin = (user: any) => {
  // Verificar si el usuario tiene el rol de administrador
  // Esto dependerá de cómo hayas configurado los roles en Supabase
  return user?.role === "admin" || user?.email?.endsWith("@admin.com")
}
