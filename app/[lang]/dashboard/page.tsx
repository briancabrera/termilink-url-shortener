"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import {
  getSystemMetrics,
  getLatestUrls,
  findUrlBySlug,
  deleteUrl,
  type ShortUrl,
  type SystemMetrics,
} from "@/lib/admin-utils"
import { Copy, Trash2, Search, RefreshCw } from "lucide-react"
import { logger } from "@/lib/logger"

export default function DashboardPage({ params }: { params: { lang: string } }) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [urls, setUrls] = useState<ShortUrl[]>([])
  const [searchSlug, setSearchSlug] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const lang = params.lang || "es"

  // Función para cargar datos
  const loadData = async () => {
    setIsLoading(true)
    try {
      logger.info("Dashboard: Cargando datos del sistema")
      const [metricsData, urlsData] = await Promise.all([getSystemMetrics(), getLatestUrls(10)])
      setMetrics(metricsData)
      setUrls(urlsData)
      logger.info("Dashboard: Datos cargados correctamente")
    } catch (error) {
      logger.error("Dashboard: Error al cargar datos:", error)
      toast({
        title: lang === "es" ? "Error" : "Error",
        description: lang === "es" ? "No se pudieron cargar los datos del sistema." : "Could not load system data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData()
  }, [])

  // Función para refrescar datos
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)
    toast({
      title: lang === "es" ? "Datos actualizados" : "Data updated",
      description:
        lang === "es"
          ? "Los datos del sistema se han actualizado correctamente."
          : "System data has been updated successfully.",
      variant: "success",
    })
  }

  // Función para buscar URL por slug
  const handleSearch = async () => {
    if (!searchSlug.trim()) {
      toast({
        title: lang === "es" ? "Error de búsqueda" : "Search error",
        description: lang === "es" ? "Ingresa un slug para buscar." : "Enter a slug to search.",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    try {
      const result = await findUrlBySlug(searchSlug.trim())
      if (result) {
        setUrls([result])
        toast({
          title: lang === "es" ? "URL encontrada" : "URL found",
          description:
            lang === "es" ? `Se encontró la URL con slug "${searchSlug}"` : `URL with slug "${searchSlug}" was found`,
          variant: "success",
        })
      } else {
        toast({
          title: lang === "es" ? "URL no encontrada" : "URL not found",
          description:
            lang === "es"
              ? `No se encontró ninguna URL con slug "${searchSlug}"`
              : `No URL found with slug "${searchSlug}"`,
          variant: "destructive",
        })
        // Mantener la lista actual
      }
    } catch (error) {
      logger.error("Error al buscar URL:", error)
      toast({
        title: lang === "es" ? "Error" : "Error",
        description:
          lang === "es" ? "Ocurrió un error al buscar la URL." : "An error occurred while searching for the URL.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Función para eliminar URL
  const handleDelete = async (slug: string) => {
    if (
      !confirm(
        lang === "es"
          ? `¿Estás seguro de que deseas eliminar la URL con slug "${slug}"?`
          : `Are you sure you want to delete the URL with slug "${slug}"?`,
      )
    ) {
      return
    }

    try {
      const success = await deleteUrl(slug)
      if (success) {
        // Actualizar la lista de URLs
        setUrls(urls.filter((url) => url.slug !== slug))
        // Actualizar métricas
        if (metrics) {
          const deletedUrl = urls.find((url) => url.slug === slug)
          const deletedClicks = deletedUrl?.clicks || 0
          setMetrics({
            ...metrics,
            totalUrls: metrics.totalUrls - 1,
            totalClicks: metrics.totalClicks - deletedClicks,
            averageClicksPerUrl:
              metrics.totalUrls > 1
                ? Math.round(((metrics.totalClicks - deletedClicks) / (metrics.totalUrls - 1)) * 100) / 100
                : 0,
          })
        }
        toast({
          title: lang === "es" ? "URL eliminada" : "URL deleted",
          description:
            lang === "es"
              ? `La URL con slug "${slug}" ha sido eliminada correctamente.`
              : `The URL with slug "${slug}" has been successfully deleted.`,
          variant: "success",
        })
      } else {
        throw new Error(lang === "es" ? "No se pudo eliminar la URL" : "Could not delete the URL")
      }
    } catch (error) {
      logger.error("Error al eliminar URL:", error)
      toast({
        title: lang === "es" ? "Error" : "Error",
        description:
          lang === "es" ? "Ocurrió un error al eliminar la URL." : "An error occurred while deleting the URL.",
        variant: "destructive",
      })
    }
  }

  // Función para copiar URL
  const handleCopy = (slug: string) => {
    const host = window.location.host
    const protocol = window.location.protocol
    const url = `${protocol}//${host}/go/${slug}`

    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast({
          title: lang === "es" ? "URL copiada" : "URL copied",
          description:
            lang === "es"
              ? `La URL "${url}" ha sido copiada al portapapeles.`
              : `The URL "${url}" has been copied to the clipboard.`,
          variant: "success",
        })
      })
      .catch((error) => {
        logger.error("Error al copiar URL:", error)
        toast({
          title: lang === "es" ? "Error" : "Error",
          description:
            lang === "es" ? "No se pudo copiar la URL al portapapeles." : "Could not copy the URL to the clipboard.",
          variant: "destructive",
        })
      })
  }

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      logger.info("Dashboard: Cerrando sesión")
      await supabase.auth.signOut()
      toast({
        title: lang === "es" ? "Sesión cerrada" : "Signed out",
        description: lang === "es" ? "Has cerrado sesión correctamente." : "You have been signed out successfully.",
        variant: "success",
      })
      window.location.href = `/${lang}`
    } catch (error) {
      logger.error("Error al cerrar sesión:", error)
      toast({
        title: lang === "es" ? "Error" : "Error",
        description: lang === "es" ? "No se pudo cerrar la sesión." : "Could not sign out.",
        variant: "destructive",
      })
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
                <span className="terminal-command ml-2 no-select">cd ~/termilink/admin</span>
              </div>
              <div className="flex space-x-4">
                <button onClick={handleRefresh} disabled={isRefreshing} className="terminal-button flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isRefreshing
                    ? lang === "es"
                      ? "Actualizando..."
                      : "Updating..."
                    : lang === "es"
                      ? "Actualizar datos"
                      : "Refresh data"}
                </button>
                <Link href={`/${lang}/dashboard/logs`} className="terminal-button flex items-center">
                  <span className="mr-2">📋</span>
                  {lang === "es" ? "Ver logs" : "View logs"}
                </Link>
                <button onClick={handleLogout} className="terminal-button">
                  {lang === "es" ? "Cerrar sesión" : "Sign out"}
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
              <div className="text-xs text-gray-400 no-select">admin.sh</div>
            </div>

            <h1 className="text-cyan-400 text-2xl font-bold mb-6">
              {lang === "es" ? "Panel de Administración" : "Admin Panel"}
            </h1>

            {/* Sección de métricas */}
            <div className="mb-8">
              <h2 className="text-green-400 text-xl font-bold mb-4">
                {lang === "es" ? "# === MÉTRICAS ===" : "# === METRICS ==="}
              </h2>

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
                    {lang === "es" ? "Cargando métricas..." : "Loading metrics..."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-black/30 border border-green-500/30 rounded">
                    <h3 className="text-yellow-400 font-bold mb-2">{lang === "es" ? "Total URLs" : "Total URLs"}</h3>
                    <p className="text-2xl text-white">{metrics?.totalUrls || 0}</p>
                  </div>

                  <div className="p-4 bg-black/30 border border-green-500/30 rounded">
                    <h3 className="text-yellow-400 font-bold mb-2">
                      {lang === "es" ? "Clicks Totales" : "Total Clicks"}
                    </h3>
                    <p className="text-2xl text-white">{metrics?.totalClicks || 0}</p>
                  </div>

                  <div className="p-4 bg-black/30 border border-green-500/30 rounded">
                    <h3 className="text-yellow-400 font-bold mb-2">
                      {lang === "es" ? "Clicks Promedio" : "Average Clicks"}
                    </h3>
                    <p className="text-2xl text-white">{metrics?.averageClicksPerUrl || 0}</p>
                  </div>

                  <div className="p-4 bg-black/30 border border-green-500/30 rounded">
                    <h3 className="text-yellow-400 font-bold mb-2">{lang === "es" ? "Última URL" : "Latest URL"}</h3>
                    {metrics?.lastUrl ? (
                      <div>
                        <p className="text-white truncate">{metrics.lastUrl.slug}</p>
                        <p className="text-gray-400 text-sm truncate">{metrics.lastUrl.originalUrl}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {lang === "es" ? "Clicks: " : "Clicks: "}
                          {metrics.lastUrl.clicks}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-400">{lang === "es" ? "No hay URLs" : "No URLs"}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sección de administración de URLs */}
            <div>
              <h2 className="text-green-400 text-xl font-bold mb-4">
                {lang === "es" ? "# === ADMINISTRACIÓN ===" : "# === MANAGEMENT ==="}
              </h2>

              {/* Búsqueda */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <span className="terminal-prompt no-select">$</span>
                  <span className="terminal-command ml-2 no-select">find</span>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchSlug}
                      onChange={(e) => setSearchSlug(e.target.value)}
                      placeholder={lang === "es" ? "Buscar por slug..." : "Search by slug..."}
                      className="terminal-input w-full"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="terminal-button flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {isSearching
                      ? lang === "es"
                        ? "Buscando..."
                        : "Searching..."
                      : lang === "es"
                        ? "Buscar"
                        : "Search"}
                  </button>
                  {searchSlug && (
                    <button
                      onClick={() => {
                        setSearchSlug("")
                        loadData()
                      }}
                      className="terminal-button"
                    >
                      {lang === "es" ? "Mostrar todos" : "Show all"}
                    </button>
                  )}
                </div>
              </div>

              {/* Listado de URLs */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <span className="terminal-prompt no-select">$</span>
                  <span className="terminal-command ml-2 no-select">ls -la</span>
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
                      {lang === "es" ? "Cargando URLs..." : "Loading URLs..."}
                    </p>
                  </div>
                ) : urls.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-left border-b border-green-500/30">
                          <th className="p-2 text-yellow-400">{lang === "es" ? "Slug" : "Slug"}</th>
                          <th className="p-2 text-yellow-400">{lang === "es" ? "URL Original" : "Original URL"}</th>
                          <th className="p-2 text-yellow-400">{lang === "es" ? "Clicks" : "Clicks"}</th>
                          <th className="p-2 text-yellow-400">{lang === "es" ? "Acciones" : "Actions"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {urls.map((url) => (
                          <tr key={url.slug} className="border-b border-green-500/10 hover:bg-black/40">
                            <td className="p-2 text-white">
                              {url.slug}
                              <div className="text-xs text-gray-400">
                                {window.location.protocol}//{window.location.host}/go/{url.slug}
                              </div>
                            </td>
                            <td className="p-2 text-gray-300">
                              <div className="truncate max-w-xs">{url.originalUrl}</div>
                            </td>
                            <td className="p-2 text-gray-300">{url.clicks}</td>
                            <td className="p-2">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleCopy(url.slug)}
                                  className="p-2 hover:bg-green-500/20 rounded"
                                  title={lang === "es" ? "Copiar URL" : "Copy URL"}
                                >
                                  <Copy className="w-4 h-4 text-green-400" />
                                </button>
                                <button
                                  onClick={() => handleDelete(url.slug)}
                                  className="p-2 hover:bg-red-500/20 rounded"
                                  title={lang === "es" ? "Eliminar URL" : "Delete URL"}
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-black/30 border border-yellow-500/30 rounded">
                    <p className="text-yellow-400 text-center">
                      {lang === "es" ? "No se encontraron URLs" : "No URLs found"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-green-500/30">
              <Link href={`/${lang}`} className="terminal-link">
                {lang === "es" ? "Volver al inicio" : "Back to home"}
              </Link>

              <div className="text-gray-400 text-sm">TermiLink Admin v1.0</div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
