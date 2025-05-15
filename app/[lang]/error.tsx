"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
// Importamos directamente los diccionarios en lugar de usar getDictionary
// para evitar importaciones indirectas de módulos del servidor
import { dictionary as enDictionary } from "@/dictionaries/en"
import { dictionary as esDictionary } from "@/dictionaries/es"

export default function Error({
  error,
  reset,
  params,
}: {
  error: Error & { digest?: string }
  reset: () => void
  params: { lang: string }
}) {
  const [dictionary, setDictionary] = useState<any>(null)
  const [lang, setLang] = useState<string>("es") // Valor predeterminado

  useEffect(() => {
    // Usar params.lang si está disponible, de lo contrario usar el valor predeterminado
    const currentLang = params?.lang || lang
    setLang(currentLang)

    // Cargar el diccionario directamente sin usar getDictionary
    // para evitar importaciones indirectas de módulos del servidor
    const dict = currentLang === "en" ? enDictionary : esDictionary
    setDictionary(dict)

    console.error("Error en la aplicación:", error)
  }, [error, params?.lang, lang])

  // Mostrar un estado de carga mientras se obtiene el diccionario
  if (!dictionary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
        <div className="terminal-container w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-xs text-gray-400">error.sh</div>
          </div>
          <div className="p-4 text-center">
            <div className="flex items-center justify-center">
              <div className="flex space-x-2">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse delay-150"></div>
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
            <p className="text-red-400 mt-4">Cargando información de error...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <div className="terminal-container w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-xs text-gray-400">error.sh</div>
        </div>

        <div className="mb-4">
          <div className="flex">
            <span className="terminal-prompt">$</span>
            <span className="terminal-command ml-2">{dictionary.errors.general.command}</span>
          </div>
        </div>

        <h1 className="text-red-500 text-3xl font-bold mb-4">{dictionary.errors.general.title}</h1>
        <p className="text-gray-300 mb-6 text-xl">{dictionary.errors.general.description}</p>
        <p className="text-gray-400 mb-6 text-sm bg-black/50 p-3 rounded border border-red-500/30 overflow-auto">
          {error.message || "Error desconocido"}
          {error.digest && <span className="block mt-2">ID: {error.digest}</span>}
        </p>

        <div className="flex mb-4">
          <span className="terminal-prompt">$</span>
          <span className="terminal-command ml-2">{dictionary.errors.general.retryCommand}</span>
        </div>

        <div className="flex flex-col space-y-4">
          <button onClick={reset} className="terminal-button">
            {dictionary.errors.general.retryButton}
          </button>

          <div className="flex">
            <span className="terminal-prompt">$</span>
            <span className="terminal-command ml-2">{dictionary.errors.general.homeCommand}</span>
          </div>

          <Link href={`/${lang}`} className="terminal-button">
            {dictionary.errors.general.homeButton}
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-green-500/30 flex justify-center">
          <a href="https://links.briancabrera.com/" target="_blank" rel="noopener noreferrer" className="terminal-link">
            <span className="text-cyan-400">Brian Cabrera</span>
          </a>
        </div>
      </div>
    </div>
  )
}
