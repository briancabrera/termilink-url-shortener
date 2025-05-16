"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { dictionary as enDictionary } from "@/dictionaries/en"
import { dictionary as esDictionary } from "@/dictionaries/es"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { AuthGuard } from "@/components/auth-guard"
import {
  getSystemMetrics,
  getLatestUrls,
  findUrlBySlug,
  deleteUrl,
  type ShortUrl,
  type SystemMetrics,
} from "@/lib/admin-utils"
import { Copy, Trash2, Search, RefreshCw } from "lucide-react"

export default function DebugPage({ params }: { params: { lang: string } }) {
  const [redisStatus, setRedisStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dictionary, setDictionary] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [urls, setUrls] = useState<ShortUrl[]>([])
  const [searchSlug, setSearchSlug] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Cargar el diccionario directamente sin usar getDictionary
    const dict = params.lang === "en" ? enDictionary : esDictionary
    setDictionary(dict)

    // Verificar si el usuario está autenticado
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)
    }

    checkAuth()
  }, [params.lang])

  // Función para cargar datos
  const loadData = async () => {
    setIsLoading(true)
    try {
      const [metricsData, urlsData] = await Promise.all([getSystemMetrics(), getLatestUrls(10)])
      setMetrics(metricsData)
      setUrls(urlsData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast({
        title: params.lang === "es" ? "Error" : "Error",
        description:
          params.lang === "es" ? "No se pudieron cargar los datos del sistema." : "Could not load system data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos al montar el componente si está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  async function testRedisConnection() {
    if (!dictionary) return

    setIsLoading(true)
    setError(null)

    try {
      // Llamar a la API del servidor en lugar de acceder a Redis directamente
      const response = await fetch("/api/redis-status")
      const data = await response.json()
      setRedisStatus(data)

      // Mostrar toast con el resultado
      if (data.success) {
        toast({
          title: dictionary.debug.redisTest.success,
          description: data.message || "",
          variant: "success",
        })
      } else {
        toast({
          title: dictionary.debug.redisTest.error,
          description: data.error || "",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error al probar la conexión a Redis:", error)
      setError(error.message || "Error al probar la conexión a Redis")

      toast({
        title: dictionary.form.toast.error.title,
        description: error.message || dictionary.form.toast.error.description,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para refrescar datos
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)
    toast({
      title: params.lang === "es" ? "Datos actualizados" : "Data updated",
      description:
        params.lang === "es"
          ? "Los datos del sistema se han actualizado correctamente."
          : "System data has been updated successfully.",
      variant: "success",
    })
  }

  // Función para buscar URL por slug
  const handleSearch = async () => {
    if (!searchSlug.trim()) {
      toast({
        title: params.lang === "es" ? "Error de búsqueda" : "Search error",
        description: params.lang === "es" ? "Ingresa un slug para buscar." : "Enter a slug to search.",
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
          title: params.lang === "es" ? "URL encontrada" : "URL found",
          description:
            params.lang === "es"
              ? `Se encontró la URL con slug "${searchSlug}"`
              : `URL with slug "${searchSlug}" was found`,
          variant: "success",
        })
      } else {
        toast({
          title: params.lang === "es" ? "URL no encontrada" : "URL not found",
          description:
            params.lang === "es"
              ? `No se encontró ninguna URL con slug "${searchSlug}"`
              : `No URL found with slug "${searchSlug}"`,
          variant: "destructive",
        })
        // Mantener la lista actual
      }
    } catch (error) {
      console.error("Error al buscar URL:", error)
      toast({
        title: params.lang === "es" ? "Error" : "Error",
        description:
          params.lang === "es"
            ? "Ocurrió un error al buscar la URL."
            : "An error occurred while searching for the URL.",
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
        params.lang === "es"
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
          title: params.lang === "es" ? "URL eliminada" : "URL deleted",
          description:
            params.lang === "es"
              ? `La URL con slug "${slug}" ha sido eliminada correctamente.`
              : `The URL with slug "${slug}" has been successfully deleted.`,
          variant: "success",
        })
      } else {
        throw new Error(params.lang === "es" ? "No se pudo eliminar la URL" : "Could not delete the URL")
      }
    } catch (error) {
      console.error("Error al eliminar URL:", error)
      toast({
        title: params.lang === "es" ? "Error" : "Error",
        description:
          params.lang === "es" ? "Ocurrió un error al eliminar la URL." : "An error occurred while deleting the URL.",
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
          title: params.lang === "es" ? "URL copiada" : "URL copied",
          description:
            params.lang === "es"
              ? `La URL "${url}" ha sido copiada al portapapeles.`
              : `The URL "${url}" has been copied to the clipboard.`,
          variant: "success",
        })
      })
      .catch((error) => {
        console.error("Error al copiar URL:", error)
        toast({
          title: params.lang === "es" ? "Error" : "Error",
          description:
            params.lang === "es"
              ? "No se pudo copiar la URL al portapapeles."
              : "Could not copy the URL to the clipboard.",
          variant: "destructive",
        })
      })
  }

  // Función para cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = `/${params.lang}`
  }

  if (!dictionary) return null

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <span className="terminal-prompt no-select">$</span>
              <span className="terminal-command ml-2 no-select">cd ~/termilink/debug</span>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher dictionary={dictionary} currentLocale={params.lang} />
              {isAuthenticated && (
                <button onClick={handleLogout} className="terminal-button">
                  {params.lang === "es" ? "Cerrar sesión" : "Sign out"}
                </button>
              )}
              {!isAuthenticated && (
                <Link href={`/${params.lang}/debug/login`} className="terminal-button">
                  {params.lang === "es" ? "Iniciar sesión" : "Login"}
                </Link>
              )}
            </div>
          </div>
        </header>

        {isAuthenticated ? (
          <AuthGuard lang={params.lang}>
            <div className="terminal-container mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2 no-select">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-gray-400 no-select">admin.sh</div>
              </div>

              <h1 className="text-cyan-400 text-2xl font-bold mb-6">
                {params.lang === "es" ? "Panel de Administración" : "Admin Panel"}
              </h1>

              {/* Sección de métricas */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-green-400 text-xl font-bold">
                    {params.lang === "es" ? "# === MÉTRICAS ===" : "# === METRICS ==="}
                  </h2>
                  <button onClick={handleRefresh} disabled={isRefreshing} className="terminal-button flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {isRefreshing
                      ? params.lang === "es"
                        ? "Actualizando..."
                        : "Updating..."
                      : params.lang === "es"
                        ? "Actualizar datos"
                        : "Refresh data"}
                  </button>
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
                      {params.lang === "es" ? "Cargando métricas..." : "Loading metrics..."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-black/30 border border-green-500/30 rounded">
                      <h3 className="text-yellow-400 font-bold mb-2">
                        {params.lang === "es" ? "Total URLs" : "Total URLs"}
                      </h3>
                      <p className="text-2xl text-white">{metrics?.totalUrls || 0}</p>
                    </div>

                    <div className="p-4 bg-black/30 border border-green-500/30 rounded">
                      <h3 className="text-yellow-400 font-bold mb-2">
                        {params.lang === "es" ? "Clicks Totales" : "Total Clicks"}
                      </h3>
                      <p className="text-2xl text-white">{metrics?.totalClicks || 0}</p>
                    </div>

                    <div className="p-4 bg-black/30 border border-green-500/30 rounded">
                      <h3 className="text-yellow-400 font-bold mb-2">
                        {params.lang === "es" ? "Clicks Promedio" : "Average Clicks"}
                      </h3>
                      <p className="text-2xl text-white">{metrics?.averageClicksPerUrl || 0}</p>
                    </div>

                    <div className="p-4 bg-black/30 border border-green-500/30 rounded">
                      <h3 className="text-yellow-400 font-bold mb-2">
                        {params.lang === "es" ? "Última URL" : "Latest URL"}
                      </h3>
                      {metrics?.lastUrl ? (
                        <div>
                          <p className="text-white truncate">{metrics.lastUrl.slug}</p>
                          <p className="text-gray-400 text-sm truncate">{metrics.lastUrl.originalUrl}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {params.lang === "es" ? "Clicks: " : "Clicks: "}
                            {metrics.lastUrl.clicks}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-400">{params.lang === "es" ? "No hay URLs" : "No URLs"}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sección de administración de URLs */}
              <div>
                <h2 className="text-green-400 text-xl font-bold mb-4">
                  {params.lang === "es" ? "# === ADMINISTRACIÓN ===" : "# === MANAGEMENT ==="}
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
                        placeholder={params.lang === "es" ? "Buscar por slug..." : "Search by slug..."}
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
                        ? params.lang === "es"
                          ? "Buscando..."
                          : "Searching..."
                        : params.lang === "es"
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
                        {params.lang === "es" ? "Mostrar todos" : "Show all"}
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
                        {params.lang === "es" ? "Cargando URLs..." : "Loading URLs..."}
                      </p>
                    </div>
                  ) : urls.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="text-left border-b border-green-500/30">
                            <th className="p-2 text-yellow-400">{params.lang === "es" ? "Slug" : "Slug"}</th>
                            <th className="p-2 text-yellow-400">
                              {params.lang === "es" ? "URL Original" : "Original URL"}
                            </th>
                            <th className="p-2 text-yellow-400">{params.lang === "es" ? "Clicks" : "Clicks"}</th>
                            <th className="p-2 text-yellow-400">{params.lang === "es" ? "Acciones" : "Actions"}</th>
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
                                    title={params.lang === "es" ? "Copiar URL" : "Copy URL"}
                                  >
                                    <Copy className="w-4 h-4 text-green-400" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(url.slug)}
                                    className="p-2 hover:bg-red-500/20 rounded"
                                    title={params.lang === "es" ? "Eliminar URL" : "Delete URL"}
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
                        {params.lang === "es" ? "No se encontraron URLs" : "No URLs found"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AuthGuard>
        ) : (
          <div className="terminal-container mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2 no-select">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-xs text-gray-400 no-select">debug.sh</div>
            </div>

            <div className="flex mb-4">
              <span className="terminal-prompt no-select">$</span>
              <span className="terminal-command ml-2 no-select">{dictionary.debug.command}</span>
            </div>

            <h1 className="text-cyan-400 text-2xl font-bold mb-4">{dictionary.debug.title}</h1>

            <div className="mb-6">
              <div className="flex mb-2">
                <span className="terminal-prompt no-select">$</span>
                <span className="terminal-command ml-2 no-select">{dictionary.debug.redisTest.command}</span>
              </div>

              <button onClick={testRedisConnection} disabled={isLoading} className="terminal-button">
                {isLoading ? dictionary.debug.redisTest.buttonLoading : dictionary.debug.redisTest.button}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
                  <div className="flex">
                    <span className="text-red-500 mr-2 no-select">{dictionary.form.error.title}</span>
                    <p className="text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {redisStatus && (
                <div className="mt-4 p-3 bg-black/30 border border-green-500/30 rounded">
                  <h3 className="text-green-400 font-bold mb-2">{dictionary.debug.redisTest.result}</h3>
                  <div className="mb-4">
                    <p className="text-gray-300">
                      <span className="text-yellow-400 mr-2 no-select">{dictionary.debug.redisTest.status}</span>
                      {redisStatus.success ? (
                        <span className="text-green-400">{dictionary.debug.redisTest.success}</span>
                      ) : (
                        <span className="text-red-400">{dictionary.debug.redisTest.error}</span>
                      )}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-yellow-400 mr-2 no-select">{dictionary.debug.redisTest.message}</span>
                      {redisStatus.message || redisStatus.error || dictionary.debug.redisTest.noMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex">
              <span className="terminal-prompt no-select">$</span>
              <span className="terminal-command ml-2 no-select">{dictionary.debug.homeCommand}</span>
            </div>

            <div className="mt-4">
              <Link href={`/${params.lang}`} className="terminal-button inline-block">
                {dictionary.debug.homeButton}
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
        )}
      </div>
    </div>
  )
}
