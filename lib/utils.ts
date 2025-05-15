import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createHash } from "crypto"

// Función para combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Caracteres permitidos para los IDs cortos (sin caracteres ambiguos como 0, O, 1, l, I)
const CHARACTERS = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"

// Función para generar un ID corto aleatorio
export function generateShortId(length = 6): string {
  let result = ""
  const charactersLength = CHARACTERS.length

  for (let i = 0; i < length; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}

// Función para validar una URL
export function isValidUrl(url: string): boolean {
  // Si la URL no tiene protocolo, añadimos https:// temporalmente para la validación
  let urlToCheck = url
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    urlToCheck = `https://${url}`
  }

  try {
    const parsedUrl = new URL(urlToCheck)
    // Verificar que tiene un dominio válido (al menos un punto)
    return parsedUrl.hostname.includes(".")
  } catch (e) {
    return false
  }
}

// Función para normalizar una URL (asegurarse de que tiene protocolo)
export function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`
  }
  return url
}

// Función para generar una clave de índice para la URL
export function generateUrlKey(url: string): string {
  // Crear un hash de la URL normalizada para usarlo como clave
  const hash = createHash("md5").update(url).digest("hex")
  return `url:${hash}`
}
