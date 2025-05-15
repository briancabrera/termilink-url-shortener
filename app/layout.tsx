import type React from "react"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { CustomHead } from "@/components/custom-head"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TermiLink - Acortador de URLs",
  description: "Acorta tus URLs por 24 horas con estilo de terminal",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        {/* Favicon incrustado directamente como base64 */}
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='black'/><path d='M30 50 L50 30 L50 40 L40 50 L50 60 L50 70 Z' fill='%234ade80'/><path d='M60 50 L80 30 L80 40 L70 50 L80 60 L80 70 Z' fill='%234ade80'/></svg>"
        />
      </head>
      <body className={cn("min-h-screen bg-background font-mono antialiased", jetbrainsMono.className)}>
        <CustomHead />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
