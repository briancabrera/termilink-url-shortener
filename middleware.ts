import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { match } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"

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

    // Siempre redirigir a login cuando se intente acceder a admin
    if (pathname.includes("/admin") && !pathname.includes("/admin/login")) {
      console.log("Middleware: Redirigiendo a login (siempre se requiere login)")
      return NextResponse.redirect(new URL("/admin/login", request.url))
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
