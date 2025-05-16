import { NextResponse } from "next/server"
import { getLatestUrls, findUrlBySlug, deleteUrl } from "@/lib/admin-utils"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Verificar autenticación
async function verifyAuth() {
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
  return session
}

// GET - Obtener URLs
export async function GET(request: Request) {
  const session = await verifyAuth()

  // Si no hay sesión, devolver error
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Obtener parámetros de la URL
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get("slug")
  const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 10

  try {
    if (slug) {
      // Buscar URL por slug
      const url = await findUrlBySlug(slug)
      if (!url) {
        return NextResponse.json({ error: "URL no encontrada" }, { status: 404 })
      }
      return NextResponse.json(url)
    } else {
      // Obtener últimas URLs
      const urls = await getLatestUrls(limit)
      return NextResponse.json(urls)
    }
  } catch (error) {
    console.error("Error al obtener URLs:", error)
    return NextResponse.json({ error: "Error al obtener URLs" }, { status: 500 })
  }
}

// DELETE - Eliminar URL
export async function DELETE(request: Request) {
  const session = await verifyAuth()

  // Si no hay sesión, devolver error
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Obtener slug de la URL
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get("slug")

  if (!slug) {
    return NextResponse.json({ error: "Se requiere un slug" }, { status: 400 })
  }

  try {
    const success = await deleteUrl(slug)
    if (!success) {
      return NextResponse.json({ error: "No se pudo eliminar la URL" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar URL:", error)
    return NextResponse.json({ error: "Error al eliminar URL" }, { status: 500 })
  }
}
