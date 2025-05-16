"use client"

import type React from "react"
import { useState } from "react"
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
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      logger.info(`Iniciando login para: ${email}`)
      logger.debug(`Login: Intentando iniciar sesión con email: ${email.substring(0, 3)}...`)

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
        logger.debug(`Login: Sesión creada correctamente. ID: ${result.data.session.user.id.substring(0, 8)}...`)

        toast({
          title: lang === "es" ? "Acceso exitoso" : "Login successful",
          description: lang === "es" ? "Bienvenido al panel de administración." : "Welcome to the admin panel.",
          variant: "success",
        })

        // Esperar un poco para que el toast se muestre
        await new Promise((resolve) => setTimeout(resolve, 1000))

        logger.info(`Redirigiendo a: /${lang}/dashboard`)
        logger.debug(`Login: Preparando redirección a /${lang}/dashboard`)

        // Usar una redirección más robusta
        try {
          // Primero intentamos con router.push si está disponible
          window.location.href = `/${lang}/dashboard`
          logger.debug(`Login: Redirección iniciada`)

          // Como respaldo, forzamos una recarga completa después de un breve retraso
          setTimeout(() => {
            window.location.replace(`/${lang}/dashboard`)
          }, 500)
        } catch (redirectError) {
          logger.error(`Error en redirección: ${redirectError}`)
          // Último recurso: recargar la página
          window.location.href = `/${lang}/dashboard`
        }
      } else {
        logger.warn("No se creó la sesión después de la autenticación")
        throw new Error(lang === "es" ? "No se pudo crear la sesión" : "Could not create session")
      }
    } catch (error: any) {
      logger.error(`Error en login: ${error.message || "Error desconocido"}`)
      logger.error(`Login: Error detallado:`, {
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 200),
        email: email.substring(0, 3) + "...",
      })

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

      <div className="mt-6 p-4 bg-black/30 border border-yellow-500/30 rounded">
        <p className="text-yellow-400 text-center text-sm">
          {lang === "es" ? "Los usuarios se crean manualmente en Supabase." : "Users are created manually in Supabase."}
        </p>
      </div>
    </div>
  )
}
