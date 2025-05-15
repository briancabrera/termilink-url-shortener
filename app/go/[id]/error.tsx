"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Error en la redirección:", error)
  }, [error])

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
            <span className="terminal-command ml-2">cat system_error.log</span>
          </div>
        </div>

        <h1 className="text-red-500 text-3xl font-bold mb-4">Error en la redirección</h1>
        <p className="text-gray-300 mb-6 text-xl">
          Lo sentimos, no pudimos redirigirte a la URL solicitada. El sistema ha encontrado un error inesperado.
        </p>
        <p className="text-gray-400 mb-6 text-sm bg-black/50 p-3 rounded border border-red-500/30 overflow-auto">
          {error.message || "Error desconocido"}
        </p>

        <div className="flex mb-4">
          <span className="terminal-prompt">$</span>
          <span className="terminal-command ml-2">./retry.sh</span>
        </div>

        <div className="flex flex-col space-y-4">
          <button onClick={reset} className="terminal-button">
            Intentar de nuevo
          </button>

          <div className="flex">
            <span className="terminal-prompt">$</span>
            <span className="terminal-command ml-2">cd /home</span>
          </div>

          <Link href="/es" className="terminal-button">
            Volver al inicio
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
