"use client"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface LanguageSwitcherProps {
  dictionary: {
    languageSwitcher: {
      label: string
      es: string
      en: string
    }
  }
  currentLocale: string
}

export function LanguageSwitcher({ dictionary, currentLocale }: LanguageSwitcherProps) {
  const pathName = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const switchToLocale = (newLocale: string) => {
    // No hacer nada si ya estamos en ese idioma
    if (newLocale === currentLocale) return

    // Redirect to the new locale
    const currentPathWithoutLocale = pathName.replace(`/${currentLocale}`, "")
    const newPath = `/${newLocale}${currentPathWithoutLocale}`
    router.push(newPath)
  }

  if (!mounted) return null

  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        <button
          onClick={() => switchToLocale("es")}
          className={`terminal-flag-button ${currentLocale === "es" ? "active" : ""}`}
          title={dictionary.languageSwitcher.es}
          aria-label={dictionary.languageSwitcher.es}
        >
          <span className="flag">🇪🇸</span>
        </button>
        <button
          onClick={() => switchToLocale("en")}
          className={`terminal-flag-button ${currentLocale === "en" ? "active" : ""}`}
          title={dictionary.languageSwitcher.en}
          aria-label={dictionary.languageSwitcher.en}
        >
          <span className="flag">🇺🇸</span>
        </button>
      </div>
    </div>
  )
}
