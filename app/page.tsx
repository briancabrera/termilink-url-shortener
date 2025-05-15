"use client"

import { UrlShortenerForm } from "@/components/url-shortener-form"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const error = searchParams.get("error")
    const id = searchParams.get("id")

    if (error) {
      let title = "Error"
      let description = "Ha ocurrido un error desconocido."

      switch (error) {
        case "redis_connection":
          title = "Error de conexión"
          description = "No se pudo conectar a la base de datos. Por favor, inténtalo de nuevo más tarde."
          break
        case "url_not_found":
          title = "URL no encontrada"
          description = `La URL acortada con ID "${id}" no existe o ha expirado.`
          break
        case "invalid_url":
          title = "URL inválida"
          description = "La URL almacenada no es válida y no se puede redirigir."
          break
      }

      toast({
        title,
        description,
        variant: "destructive",
      })
    }
  }, [searchParams, toast])

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      <header className="container mx-auto mb-8">
        <div className="terminal-header">
          <span className="terminal-prompt">$</span>
          <span className="terminal-command ml-2">cd ~/url-shortener</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl mx-auto">
          <div className="terminal-container mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-xs text-gray-400">urlito.sh</div>
            </div>

            <h1 className="terminal-title mb-2">URLito</h1>
            <p className="terminal-subtitle">
              <span className="typing inline-block w-full">Acorta tus URLs por 24 horas</span>
            </p>

            <div className="mb-6">
              <div className="flex">
                <span className="terminal-prompt">$</span>
                <span className="terminal-command ml-2">cat README.md</span>
              </div>
              <div className="mt-2 p-4 bg-black/30 rounded border border-green-500/30">
                <p className="text-gray-300 mb-2 text-lg">
                  URLito es un acortador de URLs minimalista que te permite crear enlaces cortos que expiran
                  automáticamente después de 24 horas.
                </p>
                <p className="text-gray-300 text-lg">
                  Perfecto para compartir enlaces temporales de forma rápida y segura.
                </p>
              </div>
            </div>

            <UrlShortenerForm />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="terminal-container feature-card">
              <div className="flex mb-3">
                <span className="terminal-prompt">$</span>
                <span className="terminal-command ml-2">cat features/speed.txt</span>
              </div>
              <h3 className="feature-title">Rápido</h3>
              <p className="feature-text">Acorta tus URLs en menos de 0.5 segundos gracias a Redis.</p>
            </div>

            <div className="terminal-container feature-card">
              <div className="flex mb-3">
                <span className="terminal-prompt">$</span>
                <span className="terminal-command ml-2">cat features/security.txt</span>
              </div>
              <h3 className="feature-title">Seguro</h3>
              <p className="feature-text">Los enlaces expiran automáticamente después de 24 horas.</p>
            </div>

            <div className="terminal-container feature-card">
              <div className="flex mb-3">
                <span className="terminal-prompt">$</span>
                <span className="terminal-command ml-2">cat features/simple.txt</span>
              </div>
              <h3 className="feature-title">Simple</h3>
              <p className="feature-text">Interfaz minimalista inspirada en la terminal para acortar tus URLs.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto mt-8 pt-4 border-t border-green-500/30">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <span className="terminal-prompt">$</span>
            <span className="text-gray-400 ml-2 text-lg">echo "© $(date +%Y) URLito"</span>
          </div>

          <div className="flex items-center">
            <a
              href="https://links.briancabrera.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="terminal-link"
            >
              <span className="text-cyan-400">Brian Cabrera</span>
            </a>
          </div>

          <div>
            <Link href="/debug" className="terminal-link">
              ./debug.sh
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
