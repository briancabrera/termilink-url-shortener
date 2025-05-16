import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  try {
    logger.info("[Auth Debug] Verificando estado de autenticación")

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      logger.error("[Auth Debug] Error al obtener sesión:", error)
      return NextResponse.json(
        {
          authenticated: false,
          error: error.message,
          debug: {
            environment: process.env.NODE_ENV,
            debug_enabled: process.env.DEBUG === "true",
            site_url: process.env.NEXT_PUBLIC_SITE_URL,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 },
      )
    }

    const isAuthenticated = !!data.session
    logger.info(`[Auth Debug] Usuario autenticado: ${isAuthenticated}`)

    // Obtener todas las cookies para diagnóstico
    const cookieHeader = request.headers.get("cookie") || ""
    const cookies = cookieHeader.split(";").map((cookie) => cookie.trim())

    // Filtrar cookies sensibles (no mostrar valores completos)
    const filteredCookies = cookies.map((cookie) => {
      const [name, value] = cookie.split("=")
      // Mostrar solo los primeros 5 caracteres del valor para cookies de autenticación
      if (name && (name.includes("supabase") || name.includes("auth") || name.includes("session"))) {
        return `${name}=${value ? value.substring(0, 5) + "..." : "undefined"}`
      }
      return cookie
    })

    return NextResponse.json({
      authenticated: isAuthenticated,
      user: isAuthenticated
        ? {
            id: data.session?.user.id,
            email: data.session?.user.email,
          }
        : null,
      debug: {
        environment: process.env.NODE_ENV,
        debug_enabled: process.env.DEBUG === "true",
        site_url: process.env.NEXT_PUBLIC_SITE_URL,
        timestamp: new Date().toISOString(),
        cookies: filteredCookies,
        headers: Object.fromEntries(
          Array.from(request.headers.entries()).filter(
            ([key]) => !key.includes("authorization") && !key.includes("cookie"),
          ),
        ),
      },
    })
  } catch (error: any) {
    logger.error("[Auth Debug] Error inesperado:", error)
    return NextResponse.json(
      {
        authenticated: false,
        error: error.message,
        debug: {
          environment: process.env.NODE_ENV,
          debug_enabled: process.env.DEBUG === "true",
          site_url: process.env.NEXT_PUBLIC_SITE_URL,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    )
  }
}
