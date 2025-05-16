"use client"

import { useEffect, useState } from "react"
import { TerminalLogin } from "@/components/terminal-login"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { logger } from "@/lib/logger"

export default function LoginPage({ params }: { params: { lang: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null)
  const [isDiagnosticLoading, setIsDiagnosticLoading] = useState(false)
  const router = useRouter()
  const lang = params.lang || "es"

  useEffect(() => {
    const checkAuth = async () => {
      try {
        logger.info("[Login Page] Verificando sesión")
        const { data } = await supabase.auth.getSession()

        if (data.session) {
          logger.info("[Login Page] Sesión encontrada, redirigiendo")
          setIsAuthenticated(true)

          // Usar un enfoque más robusto para la redirección
          try {
            // Primero intentar con router.push
            router.push(`/${lang}/dashboard`)

            // Como respaldo, usar window.location después de un breve retraso
            setTimeout(() => {
              logger.info("[Login Page] Usando redirección de respaldo")
              window.location.href = `/${lang}/dashboard`
            }, 1000)
          } catch (redirectError) {
            logger.error("[Login Page] Error en redirección:", redirectError)
            // Último recurso
            window.location.href = `/${lang}/dashboard`
          }
        } else {
          logger.info("[Login Page] No hay sesión activa")
          setIsLoading(false)
        }
      } catch (error) {
        logger.error("[Login Page] Error al verificar sesión:", error)
        setIsLoading(false)
      }
    }

    checkAuth()

    // Suscribirse a cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      logger.info(`[Login Page] Cambio de estado de autenticación: ${event}`)

      if (event === "SIGNED_IN" && session) {
        logger.info("[Login Page] Usuario ha iniciado sesión, redirigiendo")
        setIsAuthenticated(true)

        // Redirigir al dashboard
        window.location.href = `/${lang}/dashboard`
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [router, lang])

  const runDiagnostic = async () => {
    setIsDiagnosticLoading(true)
    try {
      logger.info("[Login Page] Ejecutando diagnóstico")

      // Verificar estado de autenticación desde la API
      const authResponse = await fetch("/api/auth/status")
      const authData = await authResponse.json()

      // Verificar estado de Redis
      const redisResponse = await fetch("/api/redis-status")
      const redisData = await redisResponse.json()

      // Recopilar información del navegador
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        localStorage: typeof localStorage !== "undefined",
        sessionStorage: typeof sessionStorage !== "undefined",
      }

      // Recopilar información del entorno
      const environmentInfo = {
        nodeEnv: process.env.NODE_ENV,
        debug: process.env.DEBUG === "true",
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || window.location.origin,
      }

      setDiagnosticInfo({
        timestamp: new Date().toISOString(),
        auth: authData,
        redis: redisData,
        browser: browserInfo,
        environment: environmentInfo,
      })

      logger.info("[Login Page] Diagnóstico completado")
    } catch (error) {
      logger.error("[Login Page] Error en diagnóstico:", error)
      setDiagnosticInfo({ error: String(error) })
    } finally {
      setIsDiagnosticLoading(false)
    }
  }

  const checkAuthStatus = async () => {
    try {
      setIsDiagnosticLoading(true)

      // Verificar estado de autenticación desde la API de debug
      const authResponse = await fetch("/api/auth/debug")
      const authData = await authResponse.json()

      setDiagnosticInfo({
        timestamp: new Date().toISOString(),
        authStatus: authData,
      })

      logger.info("[Login Page] Verificación de autenticación completada")
    } catch (error) {
      logger.error("[Login Page] Error en verificación de autenticación:", error)
      setDiagnosticInfo({ error: String(error) })
    } finally {
      setIsDiagnosticLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
        <div className="terminal-container w-full max-w-md">
          <div className="p-4 bg-black/30 border border-green-500/30 rounded">
            <div className="flex items-center justify-center">
              <div className="flex space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse delay-150"></div>
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
            <p className="text-center text-green-400 mt-4">Verificando sesión...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Se redirigirá automáticamente
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <span className="terminal-prompt no-select">$</span>
              <span className="terminal-command ml-2 no-select">cd ~/termilink/admin</span>
            </div>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center">
          <TerminalLogin lang={lang} />

          <div className="mt-6 flex flex-col md:flex-row gap-4 items-center">
            <Link href={`/${lang}`} className="terminal-link">
              {lang === "es" ? "Volver al inicio" : "Back to home"}
            </Link>

            <button onClick={runDiagnostic} disabled={isDiagnosticLoading} className="terminal-button text-sm">
              {isDiagnosticLoading
                ? lang === "es"
                  ? "Ejecutando..."
                  : "Running..."
                : lang === "es"
                  ? "Ejecutar diagnóstico"
                  : "Run diagnostic"}
            </button>

            <button onClick={checkAuthStatus} disabled={isDiagnosticLoading} className="terminal-button text-sm">
              {isDiagnosticLoading
                ? lang === "es"
                  ? "Verificando..."
                  : "Checking..."
                : lang === "es"
                  ? "Verificar autenticación"
                  : "Check authentication"}
            </button>
          </div>

          {/* Información de diagnóstico */}
          {diagnosticInfo && (
            <div className="mt-6 w-full max-w-md p-4 bg-black/30 border border-cyan-500/30 rounded">
              <h3 className="text-cyan-400 font-bold mb-2">
                {lang === "es" ? "Información de diagnóstico:" : "Diagnostic information:"}
              </h3>
              <pre className="text-gray-300 text-xs overflow-auto max-h-60">
                {JSON.stringify(diagnosticInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
