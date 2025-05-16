"use client"

import { useEffect, useState } from "react"
import { TerminalLogin } from "@/components/terminal-login"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setIsAuthenticated(true)
        router.push("/admin")
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

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
          <TerminalLogin />

          <div className="mt-6">
            <Link href="/" className="terminal-link">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
