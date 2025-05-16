"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function TerminalLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Verificar credenciales con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      // Cerrar sesión inmediatamente (no guardar cookies)
      await supabase.auth.signOut()

      // Redirigir al dashboard
      router.push("/admin")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Credenciales inválidas",
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

      <h2 className="text-green-400 text-xl font-bold mb-4"># === ACCESO ADMIN ===</h2>

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
          {isLoading ? "Procesando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  )
}
