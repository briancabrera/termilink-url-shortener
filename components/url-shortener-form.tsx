"use client"

import type React from "react"

import { useState } from "react"
import { Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function UrlShortenerForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [expiration, setExpiration] = useState<string | null>(null)
  const [isExistingUrl, setIsExistingUrl] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setShortUrl(null)
    setExpiration(null)
    setIsExistingUrl(false)

    const form = e.currentTarget
    const formData = new FormData(form)
    const url = formData.get("url") as string

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      // Verificar si la respuesta es HTML en lugar de JSON
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("text/html")) {
        console.error("Recibida respuesta HTML en lugar de JSON")
        throw new Error("Error de servidor: respuesta incorrecta")
      }

      // Intentar parsear la respuesta como JSON
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("Error al parsear la respuesta JSON:", jsonError)
        throw new Error("Error al procesar la respuesta del servidor")
      }

      if (data.success && data.shortUrl) {
        setShortUrl(data.shortUrl)
        setExpiration(data.expiration?.formatted || "24 horas")
        setIsExistingUrl(data.isExistingUrl)

        const toastMessage = data.isExistingUrl
          ? "URL existente encontrada. Se ha extendido su tiempo de expiración."
          : "Tu URL corta está lista para usar."

        toast({
          title: "¡URL acortada con éxito!",
          description: toastMessage,
          variant: "success",
        })
      } else {
        setError(data.error || "Ocurrió un error al acortar la URL.")
        toast({
          title: "Error",
          description: data.error || "Ocurrió un error al acortar la URL.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al acortar URL:", error)
      setError("Ocurrió un error al acortar la URL. Por favor, inténtalo de nuevo.")
      toast({
        title: "Error",
        description: "Ocurrió un error al acortar la URL. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function copyToClipboard() {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl)
      toast({
        title: "¡Copiado!",
        description: "URL copiada al portapapeles.",
      })
    }
  }

  return (
    <div className="mb-6">
      <div className="flex mb-3">
        <span className="terminal-prompt">$</span>
        <span className="terminal-command ml-2">./acortar-url.sh</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <span className="terminal-prompt mr-2">URL:</span>
            <input
              name="url"
              placeholder="https://ejemplo-de-url-muy-larga.com/ruta/muy/larga"
              required
              type="url"
              disabled={isLoading}
              className="terminal-input flex-1"
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="terminal-button w-full">
          {isLoading ? "Procesando..." : "Acortar URL"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
          <div className="flex">
            <span className="text-red-500 mr-2">ERROR:</span>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {shortUrl && (
        <div className="mt-4 terminal-result">
          <div className="flex mb-3">
            <span className="terminal-prompt">$</span>
            <span className="terminal-command ml-2">cat resultado.txt</span>
          </div>

          {isExistingUrl && (
            <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400">
              <p>URL ya existente. Se extendió su tiempo de expiración a 24 horas.</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-cyan-400 mb-2 break-all text-xl">{shortUrl}</p>
              <p className="text-yellow-400 text-lg">
                <span className="text-gray-400">Expira en:</span> {expiration}
              </p>
            </div>
            <button onClick={copyToClipboard} className="p-2 hover:bg-green-500/20 rounded" aria-label="Copiar URL">
              <Copy className="h-5 w-5 text-green-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
