import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { match } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"

// Idiomas soportados
export const locales = ["es", "en"]
export const defaultLocale = "es"

// Función para obtener el idioma preferido del usuario
function getLocale(request: NextRequest): string {
  // Negotiator espera un objeto con headers
  const headers = Object.fromEntries(request.headers.entries())
  const negotiatorHeaders = { "accept-language": headers["accept-language"] || "" }
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

  return match(languages, locales, defaultLocale)
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // No procesar solicitudes a la API
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Verificar si la solicitud es para redirección de URL corta
  if (pathname.startsWith("/go/")) {
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
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|go).*)"],
}
