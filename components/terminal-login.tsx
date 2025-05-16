"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { logger } from "@/lib/logger"

interface TerminalLoginProps {
  lang?: string
}

export function TerminalLogin({ lang = "es" }: TerminalLoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Función para mostrar información de depuración
  const showDebugInfo = (message: string) => {
    logger.info(`[Auth Debug] ${message}`)
    if (process.env.DEBUG === "true") {
      setDebugInfo((prev) => (prev ? `${prev}\n${message}` : message))
    }
  }

  // Verificar si estamos en producción
  useEffect(() => {
    showDebugInfo(`Entorno: ${process.env.NODE_ENV || "development"}`)
    showDebugInfo(`DEBUG habilitado: ${process.env.DEBUG === "true" ? "Sí" : "No"}`)
    showDebugInfo(`URL del sitio: ${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}`)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    showDebugInfo("Iniciando proceso de login...")

    try {
      showDebugInfo(`Intentando autenticar a: ${email}`)
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (result.error) {
        showDebugInfo(`Error de autenticación: ${result.error.message}`)
        throw result.error
      }

      if (result.data?.session) {
        showDebugInfo("Autenticación exitosa, sesión creada")

        toast({
          title: lang === "es" ? "Acceso exitoso" : "Login successful",
          description: lang === "es" ? "Bienvenido al panel de administración." : "Welcome to the admin panel.",
          variant: "success",
        })

        // Pequeña pausa para asegurar que la sesión se establezca correctamente
        await new Promise((resolve) => setTimeout(resolve, 500))

        showDebugInfo(`Redirigiendo a: /${lang}/debug`)

        // Usar router.push en lugar de window.location para una navegación más limpia
        router.push(`/${lang}/debug`)

        // Como respaldo, también intentamos la redirección con window.location después de un breve retraso
        setTimeout(() => {
          showDebugInfo("Usando redirección de respaldo con window.location")
          window.location.href = `/${lang}/debug`
        }, 1000)
      } else {
        showDebugInfo("Autenticación completada pero no se creó sesión")
        throw new Error(lang === "es" ? "No se pudo crear la sesión" : "Could not create session")
      }
    } catch (error: any) {
      showDebugInfo(`Error capturado: ${error.message || "Error desconocido"}`)

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

      {/* Información de depuración */}
      {debugInfo && (
        <div className="mt-6 p-4 bg-black/30 border border-cyan-500/30 rounded">
          <h3 className="text-cyan-400 font-bold mb-2">Información de depuración:</h3>
          <pre className="text-gray-300 text-xs overflow-auto max-h-40">{debugInfo}</pre>
        </div>
      )}
    </div>
  )
}
