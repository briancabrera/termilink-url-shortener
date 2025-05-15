"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getDictionary } from "@/dictionaries"

export function UrlShortenerForm({ lang }: { lang: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [expiration, setExpiration] = useState<string | null>(null)
  const [isExistingUrl, setIsExistingUrl] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dictionary, setDictionary] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const dict = await getDictionary(lang)
        setDictionary(dict)
      } catch (error) {
        console.error("Error al cargar el diccionario:", error)
        // Usar un diccionario mínimo como fallback
        setDictionary({
          form: {
            command: "./acortar-url.sh",
            urlLabel: "URL:",
            urlPlaceholder: "https://ejemplo.com",
            submitButton: {
              loading: "Procesando...",
              default: "Acortar URL",
            },
            result: {
              command: "cat resultado.txt",
              existingUrl: "URL ya existente. Se extendió su tiempo de expiración a 24 horas.",
              expiresIn: "Expira en:",
              copyButton: "Copiar URL",
              copied: "¡Copiado!",
              copiedDescription: "URL copiada al portapapeles.",
            },
            error: {
              title: "ERROR:",
            },
            toast: {
              success: {
                title: "¡URL acortada con éxito!",
                description: "Tu URL corta está lista para usar.",
              },
              existing: {
                title: "URL existente encontrada",
                description: "URL ya existente. Se extendió su tiempo de expiración a 24 horas.",
              },
              error: {
                title: "Error",
                description: "Ocurrió un error al acortar la URL. Por favor, inténtalo de nuevo.",
              },
              copy: {
                title: "¡Copiado!",
                description: "URL copiada al portapapeles.",
              },
            },
          },
        })
      }
    }
    loadDictionary()
  }, [lang])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!dictionary) return

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
          "Accept-Language": lang,
        },
        body: JSON.stringify({ url, lang }),
      })

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        console.error(`Error del servidor: ${response.status} ${response.statusText}`)

        // Intentar obtener el texto del error
        let errorText = ""
        try {
          errorText = await response.text()
          console.error("Respuesta de error:", errorText)
        } catch (textError) {
          console.error("No se pudo leer el texto de error:", textError)
        }

        throw new Error(
          `Error del servidor: ${response.status} ${response.statusText}. ${errorText.substring(0, 100)}...`,
        )
      }

      // Verificar si la respuesta es HTML en lugar de JSON
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("text/html")) {
        console.error("Recibida respuesta HTML en lugar de JSON")
        throw new Error("Error de servidor: respuesta incorrecta (HTML recibido)")
      }

      // Intentar parsear la respuesta como JSON
      let data
      try {
        const text = await response.text()
        console.log("Respuesta recibida:", text.substring(0, 200)) // Log para depuración

        // Intentar parsear el texto como JSON
        try {
          data = JSON.parse(text)
        } catch (jsonError) {
          console.error("Error al parsear JSON:", jsonError)
          throw new Error(`Respuesta no válida: ${text.substring(0, 100)}...`)
        }
      } catch (textError) {
        console.error("Error al obtener texto de la respuesta:", textError)
        throw new Error("Error al procesar la respuesta del servidor")
      }

      if (data.success && data.shortUrl) {
        setShortUrl(data.shortUrl)
        setExpiration(data.expiration?.formatted || "24 horas")
        setIsExistingUrl(data.isExistingUrl)

        // Usar las traducciones para los toasts
        if (data.isExistingUrl) {
          toast({
            title: dictionary.form.toast.existing.title,
            description: dictionary.form.toast.existing.description,
            variant: "default",
          })
        } else {
          toast({
            title: dictionary.form.toast.success.title,
            description: dictionary.form.toast.success.description,
            variant: "success",
          })
        }
      } else {
        setError(data.error || dictionary.form.toast.error.description)
        toast({
          title: dictionary.form.toast.error.title,
          description: data.error || dictionary.form.toast.error.description,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error al acortar URL:", error)
      setError(error.message || dictionary.form.toast.error.description)
      toast({
        title: dictionary.form.toast.error.title,
        description: error.message || dictionary.form.toast.error.description,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function copyToClipboard() {
    if (shortUrl && dictionary) {
      try {
        navigator.clipboard.writeText(shortUrl)
        toast({
          title: dictionary.form.toast.copy.title,
          description: dictionary.form.toast.copy.description,
        })
      } catch (error) {
        console.error("Error al copiar al portapapeles:", error)
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement("textarea")
        textArea.value = shortUrl
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
          document.execCommand("copy")
          toast({
            title: dictionary.form.toast.copy.title,
            description: dictionary.form.toast.copy.description,
          })
        } catch (err) {
          console.error("Error al copiar con execCommand:", err)
          toast({
            title: dictionary.form.toast.error.title,
            description: "No se pudo copiar la URL. Por favor, cópiala manualmente.",
            variant: "destructive",
          })
        }
        document.body.removeChild(textArea)
      }
    }
  }

  if (!dictionary) return null

  return (
    <div className="mb-6">
      <div className="flex mb-3">
        <span className="terminal-prompt">$</span>
        <span className="terminal-command ml-2">{dictionary.form.command}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <span className="terminal-prompt mr-2">{dictionary.form.urlLabel}</span>
            <input
              name="url"
              placeholder={dictionary.form.urlPlaceholder}
              required
              type="url"
              disabled={isLoading}
              className="terminal-input flex-1"
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="terminal-button w-full">
          {isLoading ? dictionary.form.submitButton.loading : dictionary.form.submitButton.default}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
          <div className="flex">
            <span className="text-red-500 mr-2">{dictionary.form.error.title}</span>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {shortUrl && (
        <div className="mt-4 terminal-result">
          <div className="flex mb-3">
            <span className="terminal-prompt">$</span>
            <span className="terminal-command ml-2">{dictionary.form.result.command}</span>
          </div>

          {isExistingUrl && (
            <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400">
              <p>{dictionary.form.result.existingUrl}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-cyan-400 mb-2 break-all text-xl">{shortUrl}</p>
              <p className="text-yellow-400 text-lg">
                <span className="text-gray-400">{dictionary.form.result.expiresIn}</span> {expiration}
              </p>
            </div>
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-green-500/20 rounded"
              aria-label={dictionary.form.result.copyButton}
            >
              <Copy className="h-5 w-5 text-green-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
