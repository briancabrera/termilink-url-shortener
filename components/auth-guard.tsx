"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo: string
  lang: string
}

export function AuthGuard({ children, redirectTo, lang }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        logger.info("[AuthGuard] Verificando sesión")
        const { data } = await supabase.auth.getSession()

        if (data.session) {
          logger.info("[AuthGuard] Sesión válida encontrada")
          setIsAuthenticated(true)
        } else {
          logger.warn("[AuthGuard] No se encontró sesión válida, redirigiendo a login")
          router.push(redirectTo)
        }
      } catch (error) {
        logger.error("[AuthGuard] Error al verificar sesión:", error)
        router.push(redirectTo)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [redirectTo, router, lang])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="terminal-container p-8">
          <div className="flex space-x-2">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse delay-150"></div>
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse delay-300"></div>
          </div>
          <p className="text-green-400 mt-4">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : null
}
