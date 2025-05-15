import { redis } from "@/lib/redis"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Intentar establecer un valor de prueba
    const testKey = "test-connection"
    const testValue = "Connection successful at " + new Date().toISOString()

    await redis.set(testKey, testValue, { ex: 60 }) // Expira en 60 segundos

    // Intentar recuperar el valor
    const retrievedValue = await redis.get(testKey)

    // Verificar si coincide
    const isSuccessful = retrievedValue === testValue

    return NextResponse.json({
      success: isSuccessful,
      message: isSuccessful ? "Redis connection test successful" : "Redis connection test failed: values don't match",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Redis connection test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: `Redis connection test failed: ${error}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
