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

    // Imprimir todas las cookies para depuración
    console.log(
      "Middleware: Todas las cookies:",
      Array.from(request.cookies.getAll()).map((c) => `${c.name}=${c.value.substring(0, 15)}...`),
    )

    // Verificar si es una ruta protegida que requiere autenticación
    // Excluir la ruta de login
    if (pathname.includes("/dashboard") && !pathname.includes("/login")) {
      try {
        console.log("Middleware: Verificando sesión para ruta protegida:", pathname)

        // Verificar si hay cookies de sesión de Supabase
        const hasSupabaseCookies =
          request.cookies.has("sb-access-token") ||
          request.cookies.has("sb-refresh-token") ||
          request.cookies.has("supabase-auth-token")

        console.log("Middleware: ¿Tiene cookies de Supabase?", hasSupabaseCookies)

        // Si no hay cookies de Supabase, redirigir al login
        if (!hasSupabaseCookies) {
          console.log("Middleware: No se encontraron cookies de Supabase, redirigiendo a login")
          const locale = getLocale(request)
          const url = request.nextUrl.clone()
          url.pathname = `/${locale}/login`
          return NextResponse.redirect(url)
        }

        // Crear cliente de Supabase
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get(name: string) {
                const cookie = request.cookies.get(name)
                console.log(`Middleware: Leyendo cookie ${name}:`, cookie ? "encontrada" : "no encontrada")
                return cookie?.value
              },
            },
          },
        )

        // Verificar sesión
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Middleware: Error al verificar sesión:", error.message)
        }

        console.log("Middleware: Resultado de verificación de sesión:", session ? "Sesión válida" : "Sin sesión")

        // Si no hay sesión, redirigir al login con el idioma correcto
        if (!session) {
          console.log("Middleware: Redirigiendo a login debido a falta de sesión")

          // IMPORTANTE: Para depuración, permitimos el acceso al dashboard aunque no haya sesión
          // Esto es temporal para identificar el problema
          console.log("Middleware: MODO DEPURACIÓN - Permitiendo acceso al dashboard sin sesión")
          return NextResponse.next()

          // Código original:
          // const locale = getLocale(request)
          // const url = request.nextUrl.clone()
          // url.pathname = `/${locale}/login`
          // return NextResponse.redirect(url)
        }

        console.log("Middleware: Session found, allowing access to dashboard")
      } catch (error) {
        console.error("Middleware: Error checking session:", error)

        // En modo depuración, permitimos el acceso aunque haya error
        console.log("Middleware: MODO DEPURACIÓN - Permitiendo acceso al dashboard tras error")
        return NextResponse.next()
      }
    }

    // Redirigir la raíz a la página con el idioma por defecto
    if (pathname === "/") {
      const locale = getLocale(request)
      return NextResponse.redirect(new URL(`/${locale}`, request.url))
    }

    // Redirigir /login y /dashboard a /{locale}/login y /{locale}/dashboard
    if (pathname === "/login" || pathname === "/dashboard") {
      const locale = getLocale(request)
      return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
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
  // Matcher ignoring `/_next/`, `/api/`, and other static paths
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|go).*)"],
}
