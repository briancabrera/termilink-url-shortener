"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { logger } from "@/lib/logger"

export function TerminalLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"username" | "password">("username")
  const router = useRouter()
  const { toast } = useToast()

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un nombre de usuario.",
        variant: "destructive",
      })
      return
    }
    setStep("password")
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa una contraseña.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      logger.info("Iniciando proceso de login con Supabase (sin persistencia)")

      // Usar Supabase para verificar credenciales, pero con persistencia desactivada
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
        options: {
          // Desactivar persistencia de sesión
          persistSession: false,
        },
      })

      if (error) {
        logger.error(`Error de autenticación: ${error.message}`)
        throw new Error(error.message)
      }

      if (!data.user) {
        logger.error("No se recibió información del usuario después del login")
        throw new Error("No se pudo autenticar al usuario")
      }

      logger.info(`Login exitoso para el usuario: ${data.user.email}`)

      // Cerrar la sesión inmediatamente después de verificar las credenciales
      await supabase.auth.signOut()

      toast({
        title: "Acceso concedido",
        description: "Credenciales verificadas correctamente.",
        variant: "success",
      })

      // Redirigir al dashboard
      router.push("/admin")
    } catch (error: any) {
      logger.error(`Error en el proceso de login: ${error.message}`)
      toast({
        title: "Error de autenticación",
        description: error.message || "Credenciales inválidas. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="terminal-container w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2 no-select">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-xs text-gray-400 no-select">login.sh</div>
      </div>

      <div className="p-4">
        <h2 className="text-green-400 text-xl font-bold mb-4">Acceso al Panel de Administración</h2>

        {step === "username" ? (
          <form onSubmit={handleUsernameSubmit}>
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <span className="terminal-prompt no-select">$</span>
                <span className="terminal-command ml-2 no-select">whoami</span>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nombre de usuario"
                className="terminal-input w-full"
                autoFocus
              />
            </div>
            <button type="submit" className="terminal-button">
              Continuar
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-2">
              <div className="flex items-center mb-2">
                <span className="terminal-prompt no-select">$</span>
                <span className="terminal-command ml-2 no-select">sudo -u {username}</span>
              </div>
              <div className="flex items-center mb-2">
                <span className="terminal-prompt no-select text-yellow-400">[sudo]</span>
                <span className="terminal-command ml-2 no-select">password for {username}:</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="terminal-input w-full"
                autoFocus
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep("username")}
                className="terminal-button-secondary"
                disabled={isLoading}
              >
                Atrás
              </button>
              <button type="submit" className="terminal-button" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="loading-dots mr-2"></span>
                    Verificando...
                  </span>
                ) : (
                  "Acceder"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
