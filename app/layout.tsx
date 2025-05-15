import type React from "react"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import { initializeLogger } from "@/lib/logger"

// Inicializar el sistema de logging
if (typeof window === "undefined") {
  // Solo inicializar en el servidor para evitar duplicación
  initializeLogger({
    minLevel: process.env.NODE_ENV === "production" ? "error" : "info",
    forceLogsInProduction: process.env.DEBUG === "true",
  })
}

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TermiLink - Acortador de URLs",
  description: "Acorta tus URLs por 24 horas con TermiLink.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={cn("min-h-screen bg-background font-mono antialiased", jetbrainsMono.className)}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
