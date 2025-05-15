import type React from "react"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TermiLink - Acortador de URLs",
  description: "Acorta tus URLs por 24 horas con estilo de terminal",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [
      {
        rel: "manifest",
        url: "/site.webmanifest",
      },
    ],
  },
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
