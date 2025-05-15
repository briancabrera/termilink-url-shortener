import type React from "react"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import { getDictionary } from "@/dictionaries"

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const dictionary = await getDictionary(params.lang)

  return {
    title: dictionary.metadata.title,
    description: dictionary.metadata.description,
    openGraph: {
      title: dictionary.metadata.title,
      description: dictionary.metadata.description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: dictionary.metadata.title,
      description: dictionary.metadata.description,
    },
    icons: {
      icon: [
        {
          url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='black'/><path d='M30 50 L50 30 L50 40 L40 50 L50 60 L50 70 Z' fill='%234ade80'/><path d='M60 50 L80 30 L80 40 L70 50 L80 60 L80 70 Z' fill='%234ade80'/></svg>",
          type: "image/svg+xml",
        },
      ],
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: { lang: string }
}>) {
  return (
    <html lang={params.lang}>
      <body className={cn("min-h-screen bg-background font-mono antialiased", jetbrainsMono.className)}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
