"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function TerminalLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<"login" | "signup">("login")
  const { toast } = useToast()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result

      if (mode === "login") {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        })
      } else {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        })
      }

      if (result.error) {
        throw result.error
      }

      if (mode === "signup" && result.data?.user) {
        toast({
          title: "Cuenta creada",
          description: "Revisa tu email para confirmar tu cuenta.",
          variant: "success",
        })
      } else if (result.data?.session) {
        toast({
          title: "Acceso exitoso",
          description: "Bienvenido al panel de administración.",
          variant: "success",
        })
        // Redirigir al dashboard después de un login exitoso
        window.location.href = "/admin"
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error durante la autenticación.",
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
          <span className="terminal-command ml-2 no-select">{mode === "login" ? "./login.sh" : "./signup.sh"}</span>
        </div>
      </div>

      <h2 className="text-green-400 text-xl font-bold mb-4">
        {mode === "login" ? "# === ACCESO ADMIN ===" : "# === REGISTRO ADMIN ==="}
      </h2>

      <form onSubmit={handleAuth} className="space-y-4">
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
          {isLoading ? "Procesando..." : mode === "login" ? "Iniciar sesión" : "Registrarse"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="text-cyan-400 hover:underline"
        >
          {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  )
}
