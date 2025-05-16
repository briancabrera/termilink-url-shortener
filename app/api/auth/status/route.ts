import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  try {
    logger.info("[Auth Status] Verificando estado de autenticación")

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      logger.error("[Auth Status] Error al obtener sesión:", error)
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
    logger.info(`[Auth Status] Usuario autenticado: ${isAuthenticated}`)

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
      },
    })
  } catch (error: any) {
    logger.error("[Auth Status] Error inesperado:", error)
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
