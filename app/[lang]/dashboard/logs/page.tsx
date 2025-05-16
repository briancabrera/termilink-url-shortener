"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { logger } from "@/lib/logger"
import { RefreshCw, Download, Search } from "lucide-react"

type LogEntry = {
  timestamp: string
  level: string
  message: string
  details?: any
}

export default function LogsPage({ params }: { params: { lang: string } }) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filter, setFilter] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("")
  const { toast } = useToast()
  const lang = params.lang || "es"

  // Función para cargar logs
  const loadLogs = async () => {
    setIsLoading(true)
    try {
      logger.info("Logs: Cargando logs del sistema")

      // Construir URL con parámetros de filtro
      let url = "/api/logs"
      const params = new URLSearchParams()

      if (levelFilter) {
        params.append("level", levelFilter)
      }

      if (filter) {
        params.append("search", filter)
      }

      params.append("limit", "100")

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setLogs(data.logs || [])

      logger.info("Logs: Datos cargados correctamente", { count: data.logs?.length || 0 })
    } catch (error) {
      logger.error("Logs: Error al cargar logs:", error)
      toast({
        title: lang === "es" ? "Error" : "Error",
        description: lang === "es" ? "No se pudieron cargar los logs del sistema." : "Could not load system logs.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar logs al montar el componente
  useEffect(() => {
    loadLogs()
  }, [])

  // Función para refrescar logs
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadLogs()
    setIsRefreshing(false)
    toast({
      title: lang === "es" ? "Logs actualizados" : "Logs updated",
      description:
        lang === "es"
          ? "Los logs del sistema se han actualizado correctamente."
          : "System logs have been updated successfully.",
      variant: "success",
    })
  }

  // Función para aplicar filtros
  const handleFilter = () => {
    loadLogs()
  }

  // Función para descargar logs
  const handleDownload = () => {
    try {
      // Crear un blob con los logs en formato JSON
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" })

      // Crear URL para el blob
      const url = URL.createObjectURL(blob)

      // Crear un enlace para descargar
      const a = document.createElement("a")
      a.href = url
      a.download = `termilink-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`

      // Simular clic en el enlace
      document.body.appendChild(a)
      a.click()

      // Limpiar
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: lang === "es" ? "Logs descargados" : "Logs downloaded",
        description:
          lang === "es" ? "Los logs se han descargado correctamente." : "Logs have been downloaded successfully.",
        variant: "success",
      })
    } catch (error) {
      logger.error("Error al descargar logs:", error)
      toast({
        title: lang === "es" ? "Error" : "Error",
        description: lang === "es" ? "No se pudieron descargar los logs." : "Could not download logs.",
        variant: "destructive",
      })
    }
  }

  // Función para obtener clase de color según el nivel de log
  const getLevelClass = (level: string) => {
    switch (level.toLowerCase()) {
      case "error":
        return "text-red-400"
      case "warn":
        return "text-yellow-400"
      case "info":
        return "text-cyan-400"
      case "debug":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <AuthGuard redirectTo={`/${lang}/login`} lang={lang}>
      <div className="min-h-screen p-4 md:p-8">
        <div className="container mx-auto">
          <header className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <span className="terminal-prompt no-select">$</span>
                <span className="terminal-command ml-2 no-select">cd ~/termilink/admin/logs</span>
              </div>
              <div className="flex space-x-4">
                <button onClick={handleRefresh} disabled={isRefreshing} className="terminal-button flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isRefreshing
                    ? lang === "es"
                      ? "Actualizando..."
                      : "Updating..."
                    : lang === "es"
                      ? "Actualizar logs"
                      : "Refresh logs"}
                </button>
                <button onClick={handleDownload} className="terminal-button flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  {lang === "es" ? "Descargar logs" : "Download logs"}
                </button>
              </div>
            </div>
          </header>

          <div className="terminal-container mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2 no-select">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-xs text-gray-400 no-select">logs.sh</div>
            </div>

            <h1 className="text-cyan-400 text-2xl font-bold mb-6">
              {lang === "es" ? "Logs del Sistema" : "System Logs"}
            </h1>

            {/* Filtros */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="terminal-prompt no-select">$</span>
                <span className="terminal-command ml-2 no-select">grep</span>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder={lang === "es" ? "Filtrar logs..." : "Filter logs..."}
                    className="terminal-input w-full"
                  />
                </div>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="terminal-input md:w-40"
                >
                  <option value="">{lang === "es" ? "Todos los niveles" : "All levels"}</option>
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warn</option>
                  <option value="error">Error</option>
                </select>
                <button
                  onClick={handleFilter}
                  disabled={isLoading}
                  className="terminal-button flex items-center justify-center"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {lang === "es" ? "Filtrar" : "Filter"}
                </button>
              </div>
            </div>

            {/* Listado de logs */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="terminal-prompt no-select">$</span>
                <span className="terminal-command ml-2 no-select">cat system.log</span>
              </div>

              {isLoading ? (
                <div className="p-4 bg-black/30 border border-green-500/30 rounded">
                  <div className="flex items-center justify-center">
                    <div className="flex space-x-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse delay-150"></div>
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse delay-300"></div>
                    </div>
                  </div>
                  <p className="text-center text-green-400 mt-4">
                    {lang === "es" ? "Cargando logs..." : "Loading logs..."}
                  </p>
                </div>
              ) : logs.length > 0 ? (
                <div className="bg-black/30 border border-green-500/30 rounded p-4 overflow-auto max-h-[70vh]">
                  <pre className="text-xs font-mono">
                    {logs.map((log, index) => (
                      <div key={index} className="mb-2 pb-2 border-b border-green-500/10">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                          <span className={getLevelClass(log.level)}>[{log.level.toUpperCase()}]</span>
                          <span className="text-white">{log.message}</span>
                        </div>
                        {log.details && (
                          <div className="mt-1 pl-4 text-gray-400">
                            {typeof log.details === "object"
                              ? JSON.stringify(log.details, null, 2)
                              : String(log.details)}
                          </div>
                        )}
                      </div>
                    ))}
                  </pre>
                </div>
              ) : (
                <div className="p-4 bg-black/30 border border-yellow-500/30 rounded">
                  <p className="text-yellow-400 text-center">
                    {lang === "es" ? "No se encontraron logs" : "No logs found"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-green-500/30">
              <Link href={`/${lang}/dashboard`} className="terminal-link">
                {lang === "es" ? "Volver al panel" : "Back to dashboard"}
              </Link>

              <div className="text-gray-400 text-sm">
                {lang === "es" ? "Total de logs: " : "Total logs: "}
                {logs.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
