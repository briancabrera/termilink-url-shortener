import { NextResponse } from "next/server"
import { getSystemMetrics } from "@/lib/admin-utils"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  // Verificar autenticación
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si no hay sesión, devolver error
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const metrics = await getSystemMetrics()
    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Error al obtener métricas:", error)
    return NextResponse.json({ error: "Error al obtener métricas del sistema" }, { status: 500 })
  }
}
