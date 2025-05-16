"use client"

import { useState } from "react"
import Link from "next/link"

export default function DebugPage() {
  const [redisStatus, setRedisStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function testRedisConnection() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/redis-status")
      const data = await response.json()
      setRedisStatus(data)
    } catch (error) {
      console.error("Error al probar la conexión a Redis:", error)
      setError("Error al probar la conexión a Redis")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto">
        <div className="terminal-container mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-xs text-gray-400">debug.sh</div>
          </div>

          <div className="flex mb-4">
            <span className="terminal-prompt">$</span>
            <span className="terminal-command ml-2">./system_diagnostics.sh</span>
          </div>

          <h1 className="text-cyan-400 text-2xl font-bold mb-4">Diagnóstico del Sistema</h1>

          <div className="mb-6">
            <div className="flex mb-2">
              <span className="terminal-prompt">$</span>
              <span className="terminal-command ml-2">test_redis_connection</span>
            </div>

            <button onClick={testRedisConnection} disabled={isLoading} className="terminal-button">
              {isLoading ? "Ejecutando..." : "Probar conexión a Redis"}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
                <div className="flex">
                  <span className="text-red-500 mr-2">ERROR:</span>
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            )}

            {redisStatus && (
              <div className="mt-4 p-3 bg-black/30 border border-green-500/30 rounded">
                <h3 className="text-green-400 font-bold mb-2">Resultado:</h3>
                <div className="mb-4">
                  <p className="text-gray-300">
                    <span className="text-yellow-400 mr-2">Estado:</span>
                    {redisStatus.success ? (
                      <span className="text-green-400">Conexión exitosa</span>
                    ) : (
                      <span className="text-red-400">Error de conexión</span>
                    )}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-yellow-400 mr-2">Mensaje:</span>
                    {redisStatus.message || redisStatus.error || "No hay mensaje"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex">
            <span className="terminal-prompt">$</span>
            <span className="terminal-command ml-2">cd /home</span>
          </div>

          <div className="mt-4">
            <Link href="/" className="terminal-button inline-block">
              Volver al inicio
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-green-500/30 flex justify-center">
            <a
              href="https://links.briancabrera.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="terminal-link"
            >
              <span className="text-cyan-400">Brian Cabrera</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
