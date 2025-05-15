"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getDictionary } from "@/dictionaries"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useToast } from "@/components/ui/use-toast"

export default function DebugPage({ params }: { params: { lang: string } }) {
  const [redisStatus, setRedisStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dictionary, setDictionary] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary(params.lang)
      setDictionary(dict)
    }
    loadDictionary()
  }, [params.lang])

  async function testRedisConnection() {
    if (!dictionary) return

    setIsLoading(true)
    setError(null)

    try {
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

  if (!dictionary) return null

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <span className="terminal-prompt">$</span>
              <span className="terminal-command ml-2">cd ~/termilink/debug</span>
            </div>
            <LanguageSwitcher dictionary={dictionary} currentLocale={params.lang} />
          </div>
        </header>

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
            <span className="terminal-command ml-2">{dictionary.debug.command}</span>
          </div>

          <h1 className="text-cyan-400 text-2xl font-bold mb-4">{dictionary.debug.title}</h1>

          <div className="mb-6">
            <div className="flex mb-2">
              <span className="terminal-prompt">$</span>
              <span className="terminal-command ml-2">{dictionary.debug.redisTest.command}</span>
            </div>

            <button onClick={testRedisConnection} disabled={isLoading} className="terminal-button">
              {isLoading ? dictionary.debug.redisTest.buttonLoading : dictionary.debug.redisTest.button}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
                <div className="flex">
                  <span className="text-red-500 mr-2">{dictionary.form.error.title}</span>
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            )}

            {redisStatus && (
              <div className="mt-4 p-3 bg-black/30 border border-green-500/30 rounded">
                <h3 className="text-green-400 font-bold mb-2">{dictionary.debug.redisTest.result}</h3>
                <div className="mb-4">
                  <p className="text-gray-300">
                    <span className="text-yellow-400 mr-2">{dictionary.debug.redisTest.status}</span>
                    {redisStatus.success ? (
                      <span className="text-green-400">{dictionary.debug.redisTest.success}</span>
                    ) : (
                      <span className="text-red-400">{dictionary.debug.redisTest.error}</span>
                    )}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-yellow-400 mr-2">{dictionary.debug.redisTest.message}</span>
                    {redisStatus.message || redisStatus.error || dictionary.debug.redisTest.noMessage}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex">
            <span className="terminal-prompt">$</span>
            <span className="terminal-command ml-2">{dictionary.debug.homeCommand}</span>
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
      </div>
    </div>
  )
}
