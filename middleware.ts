import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Solo necesitamos asegurarnos de que las solicitudes a /go/[id] sean manejadas correctamente
  if (request.nextUrl.pathname.startsWith("/go/")) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/go/:path*"],
}
