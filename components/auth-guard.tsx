"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { logger } from "@/lib/logger"

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  lang?: string
}

export function AuthGuard({ children, redirectTo = "/login", lang = "es" }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Verificar sesión actual
    const checkSession = async () => {
      try {
        logger.info("AuthGuard: Verificando sesión")
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          logger.error(`AuthGuard: Error al verificar sesión: ${error.message}`)
          throw error
        }

        if (data?.session) {
          logger.info("AuthGuard: Sesión válida encontrada")
          setIsAuthenticated(true)
          setIsLoading(false)
        } else {
          logger.warn("AuthGuard: No se encontró sesión válida")
          setIsAuthenticated(false)
          setIsLoading(false)

          // Mostrar toast para informar al usuario
          toast({
            title: lang === "es" ? "Sesión no válida" : "Invalid session",
            description:
              lang === "es"
                ? "Necesitas iniciar sesión para acceder a esta página"
                : "You need to log in to access this page",
            variant: "destructive",
          })

          // Redirigir al login usando window.location para forzar recarga completa
          setTimeout(() => {
            logger.info(`AuthGuard: Redirigiendo a login: ${redirectTo}`)
            window.location.href = redirectTo
          }, 1000)
        }
      } catch (error: any) {
        logger.error(`AuthGuard: Error general: ${error.message || "Error desconocido"}`)

        toast({
          title: lang === "es" ? "Error de autenticación" : "Authentication error",
          description:
            error.message || (lang === "es" ? "No se pudo verificar tu sesión." : "Could not verify your session."),
          variant: "destructive",
        })

        setIsAuthenticated(false)
        setIsLoading(false)

        // Redirigir al login usando window.location
        setTimeout(() => {
          window.location.href = redirectTo
        }, 1000)
      }
    }

    checkSession()

    // Suscribirse a cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info(`AuthGuard: Cambio de estado de autenticación: ${event}`)

      if (event === "SIGNED_IN" && session) {
        logger.info("AuthGuard: Usuario ha iniciado sesión")
        setIsAuthenticated(true)
        setIsLoading(false)
      } else if (event === "SIGNED_OUT") {
        logger.info("AuthGuard: Usuario ha cerrado sesión")
        setIsAuthenticated(false)
        setIsLoading(false)

        // Redirigir al login
        window.location.href = redirectTo
      }
    })

    return () => {
      logger.info("AuthGuard: Limpiando suscripción de autenticación")
      authListener?.subscription.unsubscribe()
    }
  }, [router, toast, lang, redirectTo])

  // Mostrar un loader mientras se verifica la autenticación
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
            <div className="text-xs text-gray-400">loading.sh</div>
          </div>

          <div className="mb-6">
            <div className="flex">
              <span className="terminal-prompt">$</span>
              <span className="terminal-command ml-2">loading</span>
              <span className="blink ml-2">_</span>
            </div>
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

  // Si no está autenticado, mostrar mensaje y redirigir
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
        <div className="terminal-container w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-xs text-gray-400">access_denied.sh</div>
          </div>

          <div className="mb-6">
            <div className="flex">
              <span className="terminal-prompt">$</span>
              <span className="terminal-command ml-2">./check_auth.sh</span>
            </div>
          </div>

          <div className="p-4 bg-black/30 border border-red-500/30 rounded mb-4">
            <h3 className="text-red-400 font-bold text-xl mb-2">
              {lang === "es" ? "Acceso denegado" : "Access denied"}
            </h3>
            <p className="text-gray-300">
              {lang === "es"
                ? "No tienes permisos para acceder a esta página. Redirigiendo..."
                : "You don't have permission to access this page. Redirecting..."}
            </p>
          </div>

          <div className="flex justify-center">
            <button onClick={() => (window.location.href = redirectTo)} className="terminal-button">
              {lang === "es" ? "Ir a login" : "Go to login"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Si el usuario está autenticado, mostrar el contenido
  return <>{children}</>
}
