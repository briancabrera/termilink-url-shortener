import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function GET() {
  logger.debug("Debug API: Debug log test")
  logger.info("Debug API: Info log test")
  logger.warn("Debug API: Warning log test")
  logger.error("Debug API: Error log test")

  // Recopilar información del entorno
  const environmentInfo = {
    nodeEnv: process.env.NODE_ENV,
    debug: process.env.DEBUG === "true",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    appName: process.env.APP_NAME,
    nextRuntime: process.env.NEXT_RUNTIME,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json({
    message: "Debug API endpoint",
    environment: environmentInfo,
    loggingEnabled: true,
  })
}
