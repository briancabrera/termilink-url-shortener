"use client"

import { useEffect } from "react"

export function CustomHead() {
  useEffect(() => {
    // Crear un favicon dinámicamente
    const link = document.createElement("link")
    link.rel = "icon"
    link.href =
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="black"/><path d="M30 50 L50 30 L50 40 L40 50 L50 60 L50 70 Z" fill="%234ade80"/><path d="M60 50 L80 30 L80 40 L70 50 L80 60 L80 70 Z" fill="%234ade80"/></svg>'

    // Eliminar cualquier favicon existente
    const existingLinks = document.querySelectorAll('link[rel="icon"]')
    existingLinks.forEach((el) => el.remove())

    // Añadir el nuevo favicon
    document.head.appendChild(link)

    return () => {
      // Limpieza
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

  return null
}
