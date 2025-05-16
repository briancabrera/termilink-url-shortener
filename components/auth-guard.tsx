"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface AuthGuardProps {
  children: React.ReactNode
  lang: string
}

export function AuthGuard({ children, lang }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Verificar sesión actual
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (data?.session) {
          setIsAuthenticated(true)
          setIsLoading(false)
        } else {
          setIsAuthenticated(false)
          setIsLoading(false)
          // Redirigir al login si no hay sesión
          router.push(`/${lang}/debug/login`)
        }
      } catch (error: any) {
        console.error("Error al verificar sesión:", error)
        toast({
          title: lang === "es" ? "Error de autenticación" : "Authentication error",
          description:
            error.message || (lang === "es" ? "No se pudo verificar tu sesión." : "Could not verify your session."),
          variant: "destructive",
        })
        setIsAuthenticated(false)
        setIsLoading(false)
        router.push(`/${lang}/debug/login`)
      }
    }

    checkSession()

    // Suscribirse a cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setIsAuthenticated(true)
        setIsLoading(false)
        // Asegurarse de que la página se recargue para mostrar el contenido correcto
        router.refresh()
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false)
        setIsLoading(false)
        router.push(`/${lang}/debug/login`)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [router, toast, lang])

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

  // Si no está autenticado, no renderizar nada (ya se redirigió al login)
  if (!isAuthenticated) {
    return null
  }

  // Si el usuario está autenticado, mostrar el contenido
  return <>{children}</>
}
