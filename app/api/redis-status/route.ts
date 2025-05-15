import { redis } from "@/lib/redis"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Intentar establecer un valor de prueba
    const testKey = "test-connection"
    const testValue = "Connection successful at " + new Date().toISOString()

    // Intentar una operación de escritura
    await redis.set(testKey, testValue, { ex: 60 }) // Expira en 60 segundos

    // Intentar una operación de lectura
    const retrievedValue = await redis.get(testKey)

    // Verificar si coincide
    const isSuccessful = retrievedValue === testValue

    // Obtener información sobre las variables de entorno disponibles (sin mostrar valores sensibles)
    const envInfo = {
      KV_URL: !!process.env.KV_URL,
      KV_REST_API_URL: !!process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
      REDIS_URL: !!process.env.REDIS_URL,
    }

    return NextResponse.json({
      success: isSuccessful,
      message: isSuccessful ? "Redis connection test successful" : "Redis connection test failed: values don't match",
      timestamp: new Date().toISOString(),
      environment: envInfo,
      testValue: retrievedValue,
    })
  } catch (error) {
    console.error("Redis connection test failed:", error)

    // Obtener información sobre las variables de entorno disponibles (sin mostrar valores sensibles)
    const envInfo = {
      KV_URL: !!process.env.KV_URL,
      KV_REST_API_URL: !!process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
      REDIS_URL: !!process.env.REDIS_URL,
    }

    return NextResponse.json(
      {
        success: false,
        error: `Redis connection test failed: ${error}`,
        timestamp: new Date().toISOString(),
        environment: envInfo,
      },
      { status: 500 },
    )
  }
}
