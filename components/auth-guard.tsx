"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"

interface AuthGuardProps {
  children: ReactNode
  redirectTo: string
  lang: string
}

export function AuthGuard({ children, redirectTo, lang }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        logger.info("[AuthGuard] Verificando autenticación")

        // Verificar si estamos en modo bypass (para depuración)
        const isBypass =
          typeof window !== "undefined" && new URLSearchParams(window.location.search).get("auth") !== null

        if (isBypass) {
          logger.info("[AuthGuard] Modo bypass detectado, permitiendo acceso")
          setIsAuthenticated(true)
          setIsLoading(false)
          return
        }

        // Verificar que tenemos las credenciales de Supabase
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          logger.warn("[AuthGuard] Credenciales de Supabase no configuradas, usando modo bypass")
          setIsAuthenticated(true)
          setIsLoading(false)
          return
        }

        // Verificar sesión con Supabase
        const { data } = await supabase.auth.getSession()

        if (data.session) {
          logger.info("[AuthGuard] Sesión válida encontrada")
          setIsAuthenticated(true)
        } else {
          logger.warn("[AuthGuard] No se encontró sesión válida, redirigiendo")
          setIsAuthenticated(false)

          // Redirigir al login
          router.push(redirectTo)
        }
      } catch (error) {
        logger.error("[AuthGuard] Error al verificar autenticación:", error)
        setIsAuthenticated(false)
        router.push(redirectTo)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [redirectTo, router])

  // Mostrar un estado de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
        <div className="terminal-container w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-xs text-gray-400">auth.sh</div>
          </div>

          <div className="p-4 bg-black/30 border border-green-500/30 rounded">
            <div className="flex items-center justify-center">
              <div className="flex space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse delay-150"></div>
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
            <p className="text-center text-green-400 mt-4">
              {lang === "es" ? "Verificando autenticación..." : "Verifying authentication..."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no renderizar nada (la redirección ya se habrá iniciado)
  if (isAuthenticated === false) {
    return null
  }

  // Si está autenticado, mostrar los hijos
  return <>{children}</>
}
