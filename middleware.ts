import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { match } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"
import { createServerClient } from "@supabase/ssr"

// Idiomas soportados
export const locales = ["es", "en"]
export const defaultLocale = "es"

// Función para obtener el idioma preferido del usuario
function getLocale(request: NextRequest): string {
  try {
    // Negotiator espera un objeto con headers
    const headers = Object.fromEntries(request.headers.entries())
    const negotiatorHeaders = { "accept-language": headers["accept-language"] || "" }
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

    return match(languages, locales, defaultLocale)
  } catch (error) {
    console.error("Error al determinar el idioma:", error)
    return defaultLocale
  }
}

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname

    // Verificar si es una ruta protegida que requiere autenticación
    // Excluir la ruta de login
    if ((pathname === "/dashboard" || pathname.includes("/admin")) && !pathname.includes("/login")) {
      // Crear cliente de Supabase
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
          },
        },
      )

      // Verificar sesión
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // Si no hay sesión, redirigir al login
      if (!session) {
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        return NextResponse.redirect(url)
      }
    }

    // Redirigir la raíz a la página con el idioma por defecto
    if (pathname === "/") {
      const locale = getLocale(request)
      return NextResponse.redirect(new URL(`/${locale}`, request.url))
    }

    // No procesar solicitudes a la API, archivos estáticos o redirecciones
    if (
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/go/")
    ) {
      return NextResponse.next()
    }

    // Verificar si la ruta ya incluye un locale
    const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

    if (pathnameHasLocale) return NextResponse.next()

    // Redirigir si no hay locale en la URL
    const locale = getLocale(request)
    const newUrl = new URL(`/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`, request.url)

    // Preservar los parámetros de búsqueda
    newUrl.search = request.nextUrl.search

    return NextResponse.redirect(newUrl)
  } catch (error) {
    console.error("Error en middleware:", error)
    // En caso de error, permitir que la solicitud continúe
    return NextResponse.next()
  }
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|go).*)"],
}
