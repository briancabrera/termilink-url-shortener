"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { logger } from "@/lib/logger"

interface TerminalLoginProps {
  lang?: string
}

export function TerminalLogin({ lang = "es" }: TerminalLoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionStatus, setSessionStatus] = useState<string>("checking")
  const { toast } = useToast()

  // Verificar estado de sesión al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setSessionStatus(data.session ? "authenticated" : "unauthenticated")
        logger.debug("Estado inicial de sesión:", data.session ? "autenticado" : "no autenticado")
      } catch (error) {
        logger.error("Error al verificar sesión inicial:", error)
        setSessionStatus("error")
      }
    }

    checkSession()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      logger.info(`Iniciando login para: ${email}`)

      // Limpiar cualquier sesión anterior
      await supabase.auth.signOut()

      // Esperar un momento para asegurar que la sesión anterior se haya limpiado
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Intentar iniciar sesión
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (result.error) {
        logger.error(`Error de autenticación: ${result.error.message}`)
        throw result.error
      }

      if (result.data?.session) {
        logger.info("Sesión creada correctamente")

        // Verificar que la sesión se haya guardado correctamente
        const { data: sessionCheck } = await supabase.auth.getSession()

        if (sessionCheck.session) {
          logger.info("Sesión verificada correctamente")

          // Guardar manualmente las cookies de sesión
          document.cookie = `sb-session-verified=true; path=/; max-age=86400; SameSite=Lax`

          toast({
            title: lang === "es" ? "Acceso exitoso" : "Login successful",
            description: lang === "es" ? "Bienvenido al panel de administración." : "Welcome to the admin panel.",
            variant: "success",
          })

          // Esperar un poco para que el toast se muestre y las cookies se establezcan
          await new Promise((resolve) => setTimeout(resolve, 1500))

          logger.info(`Redirigiendo a: /${lang}/dashboard`)

          // Usar una redirección más robusta
          try {
            // Primero intentamos con una redirección directa
            window.location.href = `/${lang}/dashboard?auth=${Date.now()}`
          } catch (redirectError) {
            logger.error(`Error en redirección: ${redirectError}`)
            // Último recurso: recargar la página
            window.location.href = `/${lang}/dashboard`
          }
        } else {
          logger.warn("La sesión no se guardó correctamente después de la autenticación")
          throw new Error(lang === "es" ? "La sesión no se guardó correctamente" : "Session was not saved correctly")
        }
      } else {
        logger.warn("No se creó la sesión después de la autenticación")
        throw new Error(lang === "es" ? "No se pudo crear la sesión" : "Could not create session")
      }
    } catch (error: any) {
      logger.error(`Error en login: ${error.message || "Error desconocido"}`)

      toast({
        title: lang === "es" ? "Error" : "Error",
        description:
          error.message ||
          (lang === "es" ? "Ocurrió un error durante la autenticación." : "An error occurred during authentication."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para verificar el estado de las cookies
  const checkCookies = () => {
    const cookies = document.cookie.split(";").map((c) => c.trim())
    const cookieInfo = cookies.map((c) => {
      const [name, value] = c.split("=")
      return `${name}=${value ? value.substring(0, 10) + "..." : "empty"}`
    })

    toast({
      title: "Estado de cookies",
      description: (
        <div className="max-h-40 overflow-auto">
          <p>Total: {cookies.length}</p>
          <ul className="list-disc pl-4 text-xs">
            {cookieInfo.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      ),
      duration: 10000,
    })
  }

  return (
    <div className="terminal-container w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2 no-select">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-xs text-gray-400 no-select">auth.sh</div>
      </div>

      <div className="mb-4">
        <div className="flex">
          <span className="terminal-prompt no-select">$</span>
          <span className="terminal-command ml-2 no-select">./login.sh</span>
        </div>
      </div>

      <h2 className="text-green-400 text-xl font-bold mb-4">
        {lang === "es" ? "# === ACCESO ADMIN ===" : "# === ADMIN ACCESS ==="}
      </h2>

      {/* Estado de sesión */}
      <div className="mb-4 p-2 bg-black/30 border border-gray-700 rounded">
        <p className="text-xs text-gray-300">
          {lang === "es" ? "Estado de sesión: " : "Session status: "}
          <span
            className={
              sessionStatus === "authenticated"
                ? "text-green-400"
                : sessionStatus === "unauthenticated"
                  ? "text-yellow-400"
                  : sessionStatus === "error"
                    ? "text-red-400"
                    : "text-blue-400"
            }
          >
            {sessionStatus === "authenticated"
              ? lang === "es"
                ? "Autenticado"
                : "Authenticated"
              : sessionStatus === "unauthenticated"
                ? lang === "es"
                  ? "No autenticado"
                  : "Unauthenticated"
                : sessionStatus === "error"
                  ? lang === "es"
                    ? "Error"
                    : "Error"
                  : lang === "es"
                    ? "Verificando..."
                    : "Checking..."}
          </span>
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <div className="flex items-center mb-2">
            <span className="terminal-prompt no-select">$</span>
            <label htmlFor="email" className="ml-2 text-gray-300">
              EMAIL:
            </label>
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="terminal-input w-full"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <div className="flex items-center mb-2">
            <span className="terminal-prompt no-select">$</span>
            <label htmlFor="password" className="ml-2 text-gray-300">
              PASSWORD:
            </label>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="terminal-input w-full"
            placeholder="********"
          />
        </div>

        <button type="submit" disabled={isLoading} className="terminal-button w-full">
          {isLoading ? (lang === "es" ? "Procesando..." : "Processing...") : lang === "es" ? "Iniciar sesión" : "Login"}
        </button>
      </form>

      <div className="mt-4 flex gap-2">
        <button onClick={checkCookies} className="terminal-button text-xs py-1 px-2">
          {lang === "es" ? "Verificar cookies" : "Check cookies"}
        </button>

        <button
          onClick={async () => {
            await supabase.auth.signOut()
            toast({
              title: lang === "es" ? "Sesión cerrada" : "Session closed",
              description: lang === "es" ? "Se ha cerrado la sesión" : "Session has been closed",
            })
            setSessionStatus("unauthenticated")
          }}
          className="terminal-button text-xs py-1 px-2"
        >
          {lang === "es" ? "Cerrar sesión" : "Sign out"}
        </button>
      </div>

      <div className="mt-6 p-4 bg-black/30 border border-yellow-500/30 rounded">
        <p className="text-yellow-400 text-center text-sm">
          {lang === "es" ? "Los usuarios se crean manualmente en Supabase." : "Users are created manually in Supabase."}
        </p>
      </div>
    </div>
  )
}
