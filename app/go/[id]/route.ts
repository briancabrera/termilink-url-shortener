import { redis } from "@/lib/redis"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    console.log(`Procesando redirección para ID: ${id}`)

    // Verificar que el ID existe
    if (!id) {
      console.error("ID no proporcionado")
      return NextResponse.redirect(new URL("/", request.nextUrl))
    }

    // Obtener la URL original de Redis
    let url: string | null
    try {
      url = await redis.get(id)
      console.log(`URL recuperada de Redis: ${url}`)
    } catch (redisError) {
      console.error(`Error al conectar con Redis: ${redisError}`)
      // Si hay un error con Redis, redirigimos a la página principal con un parámetro de error
      return NextResponse.redirect(new URL(`/?error=redis_connection`, request.nextUrl))
    }

    // Si no existe, redirigir a la página not-found
    if (!url) {
      console.log(`URL no encontrada para el ID: ${id}`)
      return NextResponse.redirect(new URL(`/?error=url_not_found&id=${id}`, request.nextUrl))
    }

    // Asegurarse de que la URL tenga el protocolo correcto
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`
    }

    console.log(`Redirigiendo a: ${url}`)

    // Intentar incrementar el contador de visitas, pero no bloquear la redirección si falla
    try {
      await redis.incr(`stats:${id}`)
      console.log(`Estadísticas incrementadas para ID: ${id}`)
    } catch (statsError) {
      console.error(`Error al incrementar estadísticas: ${statsError}`)
      // No bloqueamos la redirección por este error
    }

    // Validar que la URL es válida antes de redirigir
    try {
      new URL(url)
      return NextResponse.redirect(url)
    } catch (urlError) {
      console.error(`URL inválida: ${url}`, urlError)
      return NextResponse.redirect(new URL(`/?error=invalid_url&id=${id}`, request.nextUrl))
    }
  } catch (error) {
    console.error(`Error general al procesar la redirección: ${error}`)
    // En caso de error, redirigimos a la página principal con información del error
    return NextResponse.redirect(new URL(`/?error=unknown&id=${id}`, request.nextUrl))
  }
}
