import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Verificar credenciales contra variables de entorno
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com"
    const adminPassword = process.env.ADMIN_PASSWORD || "password123"

    const isValid = username === adminEmail && password === adminPassword

    logger.info(`Verificación de credenciales: ${isValid ? "válidas" : "inválidas"}`)

    return NextResponse.json({ success: isValid })
  } catch (error: any) {
    logger.error(`Error al verificar credenciales: ${error.message}`)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
