"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getDictionary } from "@/dictionaries"

// Tipos para mejorar la legibilidad y mantenimiento
type Dictionary = Awaited<ReturnType<typeof getDictionary>>
type ShortenResponse = {
  success: boolean
  shortUrl?: string
  expiration?: {
    formatted: string
  }
  isExistingUrl?: boolean
  error?: string
}

// Función auxiliar para cargar el diccionario
const useDictionary = (lang: string) => {
  const [dictionary, setDictionary] = useState<Dictionary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        setIsLoading(true)
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
      } finally {
        setIsLoading(false)
      }
    }
    loadDictionary()
  }, [lang])

  return { dictionary, isLoading }
}

// Función auxiliar para acortar URL
const shortenUrl = async (url: string, lang: string): Promise<ShortenResponse> => {
  const response = await fetch("/api/shorten", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": lang,
    },
    body: JSON.stringify({ url, lang }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error del servidor: ${response.status} ${response.statusText}. ${errorText.substring(0, 100)}...`)
  }

  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch (jsonError) {
    throw new Error(`Respuesta no válida: ${text.substring(0, 100)}...`)
  }
}

export function UrlShortenerForm({ lang }: { lang: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [expiration, setExpiration] = useState<string | null>(null)
  const [isExistingUrl, setIsExistingUrl] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { dictionary, isLoading: isDictionaryLoading } = useDictionary(lang)
  const { toast } = useToast()

  // Función para copiar al portapapeles
  const copyToClipboard = useCallback(() => {
    if (!shortUrl || !dictionary) return

    let hasCopied = false

    // Verificar si la API de Clipboard está disponible
    if (navigator.clipboard?.writeText) {
      try {
        navigator.clipboard.writeText(shortUrl)
        hasCopied = true
      } catch (error) {
        console.error("Error al copiar con Clipboard API:", error)
        // Fallback si falla la API de Clipboard
      }
    }

    // Fallback para navegadores que no soportan clipboard API
    if (!hasCopied) {
      try {
        const textArea = document.createElement("textarea")
        textArea.value = shortUrl
        textArea.style.position = "fixed" // Evitar desplazamiento
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        const successful = document.execCommand("copy")
        if (successful) {
          hasCopied = true
        } else {
          throw new Error("No se pudo copiar con execCommand")
        }
      } catch (err) {
        console.error("Error al copiar con execCommand:", err)
      } finally {
        // Limpiar el elemento temporal
        const textArea = document.querySelector("textarea")
        if (textArea) {
          document.body.removeChild(textArea)
        }
      }
    }

    // Mostrar toast solo si se copió exitosamente
    if (hasCopied) {
      toast({
        title: dictionary.form.toast.copy.title,
        description: dictionary.form.toast.copy.description,
      })
    } else {
      toast({
        title: dictionary.form.toast.error.title,
        description: "No se pudo copiar la URL. Por favor, cópiala manualmente.",
        variant: "destructive",
      })
    }
  }, [shortUrl, dictionary, toast])

  // Manejador del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!dictionary || isSubmitting) return

    // Prevenir múltiples submits
    setIsSubmitting(true)
    setError(null)
    setShortUrl(null)
    setExpiration(null)
    setIsExistingUrl(false)

    const form = e.currentTarget
    const formData = new FormData(form)
    const url = formData.get("url") as string

    try {
      // Usar la función auxiliar para acortar la URL
      const data = await shortenUrl(url, lang)

      if (data.success && data.shortUrl) {
        setShortUrl(data.shortUrl)
        setExpiration(data.expiration?.formatted || "24 horas")
        setIsExistingUrl(!!data.isExistingUrl)

        // Mostrar toast según el resultado
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
      // Mensaje de error genérico para el usuario
      const errorMessage = dictionary.form.toast.error.description
      setError(errorMessage)
      toast({
        title: dictionary.form.toast.error.title,
        description: errorMessage,
        variant: "destructive",
      })

      // Log del error real (solo en desarrollo)
      if (process.env.NODE_ENV !== "production") {
        console.error("Error al acortar URL:", error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mostrar un loader mientras se carga el diccionario
  if (isDictionaryLoading) {
    return (
      <div className="mb-6 p-4 bg-black/30 border border-green-500/30 rounded text-center">
        <div className="flex items-center justify-center">
          <div className="flex space-x-2">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse delay-150"></div>
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse delay-300"></div>
          </div>
        </div>
        <p className="text-center text-green-400 mt-4">Cargando formulario...</p>
      </div>
    )
  }

  if (!dictionary) {
    return (
      <div className="mb-6 p-4 bg-black/30 border border-red-500/30 rounded">
        <p className="text-red-400 text-center">Error al cargar el formulario. Por favor, recarga la página.</p>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex mb-3">
        <span className="terminal-prompt">$</span>
        <span className="terminal-command ml-2">{dictionary.form.command}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <label htmlFor="url-input" className="terminal-prompt mr-2">
              {dictionary.form.urlLabel}
            </label>
            <input
              id="url-input"
              name="url"
              placeholder={dictionary.form.urlPlaceholder}
              required
              type="url"
              disabled={isSubmitting}
              className="terminal-input flex-1"
              aria-describedby={error ? "url-error" : undefined}
            />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="terminal-button w-full">
          {isSubmitting ? dictionary.form.submitButton.loading : dictionary.form.submitButton.default}
        </button>
      </form>

      {error && (
        <div id="url-error" className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded" aria-live="polite">
          <div className="flex">
            <span className="text-red-500 mr-2">{dictionary.form.error.title}</span>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {shortUrl && (
        <div className="mt-4 terminal-result" aria-live="polite">
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
