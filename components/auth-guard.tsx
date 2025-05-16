"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase, type UserSession, isAdmin } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface AuthGuardProps {
  children: React.ReactNode
  lang: string
}

export function AuthGuard({ children, lang }: AuthGuardProps) {
  const [session, setSession] = useState<UserSession>({
    user: null,
    session: null,
    isLoading: true,
  })
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
          // Obtener datos del usuario
          const { data: userData } = await supabase.auth.getUser()
          setSession({
            user: userData.user,
            session: data.session,
            isLoading: false,
          })
        } else {
          setSession({
            user: null,
            session: null,
            isLoading: false,
          })
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
        setSession({
          user: null,
          session: null,
          isLoading: false,
        })
        router.push(`/${lang}/debug/login`)
      }
    }

    checkSession()

    // Suscribirse a cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const { data: userData } = await supabase.auth.getUser()
        setSession({
          user: userData.user,
          session,
          isLoading: false,
        })
      } else if (event === "SIGNED_OUT") {
        setSession({
          user: null,
          session: null,
          isLoading: false,
        })
        router.push(`/${lang}/debug/login`)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [router, toast, lang])

  // Mostrar un loader mientras se verifica la autenticación
  if (session.isLoading) {
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

  // Si no hay usuario, no renderizar nada (ya se redirigió al login)
  if (!session.user) {
    return null
  }

  // Verificar si el usuario es administrador
  if (!isAdmin(session.user)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
        <div className="terminal-container w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-xs text-gray-400">error.sh</div>
          </div>

          <div className="mb-4">
            <div className="flex">
              <span className="terminal-prompt">$</span>
              <span className="terminal-command ml-2">sudo access</span>
            </div>
          </div>

          <div className="p-4 bg-black/30 border border-red-500/30 rounded mb-6">
            <h2 className="text-red-500 text-xl font-bold mb-2">
              {lang === "es" ? "Acceso denegado" : "Access denied"}
            </h2>
            <p className="text-gray-300">
              {lang === "es"
                ? "No tienes permisos de administrador para acceder a esta sección."
                : "You don't have administrator permissions to access this section."}
            </p>
          </div>

          <button onClick={() => supabase.auth.signOut()} className="terminal-button w-full">
            {lang === "es" ? "Cerrar sesión" : "Sign out"}
          </button>
        </div>
      </div>
    )
  }

  // Si el usuario está autenticado y es admin, mostrar el contenido
  return <>{children}</>
}
