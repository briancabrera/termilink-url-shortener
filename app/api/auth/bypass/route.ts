import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  try {
    logger.info("[Auth Bypass] Iniciando bypass de autenticación para depuración")

    // Solo permitir en modo de desarrollo o si DEBUG está activado
    if (process.env.NODE_ENV !== "development" && process.env.DEBUG !== "true") {
      logger.warn("[Auth Bypass] Intento de bypass en producción sin DEBUG=true")
      return NextResponse.json(
        {
          success: false,
          message: "Bypass solo disponible en desarrollo o con DEBUG=true",
        },
        { status: 403 },
      )
    }

    const supabase = createServerSupabaseClient()

    // Crear una sesión temporal para depuración
    const { data, error } = await supabase.auth.signInWithPassword({
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "password",
    })

    if (error) {
      logger.error("[Auth Bypass] Error al crear sesión:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    logger.info("[Auth Bypass] Sesión creada correctamente")

    return NextResponse.json({
      success: true,
      message: "Sesión de bypass creada correctamente",
      session: {
        user: data.user?.email,
        expires: data.session?.expires_at,
      },
    })
  } catch (error: any) {
    logger.error("[Auth Bypass] Error inesperado:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
