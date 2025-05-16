import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createHash } from "crypto"
import { redis } from "./redis"

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

// Función para obtener un ID corto único verificando que no exista en Redis
export async function getUniqueShortId(maxAttempts = 5): Promise<string | null> {
  let shortId = generateShortId()
  let attempts = 0

  // Verificar que el ID no exista ya
  while (attempts < maxAttempts) {
    try {
      const exists = await redis.exists(shortId)
      if (!exists) return shortId
    } catch (existsError) {
      if (process.env.NODE_ENV !== "production") {
        console.error(`Error al verificar si el ID existe: ${existsError}`)
      }
      // Si hay un error, devolvemos el ID actual y esperamos que no exista
      return shortId
    }

    shortId = generateShortId()
    attempts++
  }

  // Si después de varios intentos no se pudo generar un ID único, devolvemos null
  return null
}

// Lista de TLDs comunes (extensible según necesidades)
const COMMON_TLDS = [
  "com",
  "org",
  "net",
  "edu",
  "gov",
  "mil",
  "io",
  "co",
  "ai",
  "app",
  "dev",
  "me",
  "info",
  "biz",
  "tv",
  "online",
  "tech",
  "store",
  "blog",
  "site",
  "xyz",
  "club",
  "shop",
  "art",
  "design",
  "game",
  "health",
  // Dominios de países
  "us",
  "uk",
  "ca",
  "au",
  "de",
  "fr",
  "es",
  "it",
  "jp",
  "cn",
  "ru",
  "br",
  "mx",
  "ar",
  "cl",
  "co",
  "pe",
  "ve",
]

// Expresión regular para validar URLs
const URL_REGEX = new RegExp(
  `^(https?:\\/\\/)` + // Protocolo (http:// o https://)
    `([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+` + // Subdominio (opcional) y dominio
    `(${COMMON_TLDS.join("|")})` + // TLDs comunes
    `(\\:\\d{1,5})?` + // Puerto (opcional)
    `(\\/[a-zA-Z0-9%_.~#&=-]*)*` + // Ruta (opcional)
    `(\\?[a-zA-Z0-9%_.~#&=-]+=[a-zA-Z0-9%_.~#&=-]*(&[a-zA-Z0-9%_.~#&=-]+=[a-zA-Z0-9%_.~#&=-]*)*)?` + // Query params (opcional)
    `(\\#[-a-zA-Z0-9]*)?$`, // Fragment (opcional)
  "i", // Case insensitive
)

// Expresión regular para detectar IPs
const IP_REGEX = /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/

// Función mejorada para validar una URL
export function isValidUrl(url: string, allowIPs = false): boolean {
  // Si la URL no tiene protocolo, añadimos https:// temporalmente para la validación
  let urlToCheck = url
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    urlToCheck = `https://${url}`
  }

  try {
    // Verificar que es una URL válida según el constructor URL
    const parsedUrl = new URL(urlToCheck)

    // Verificar que usa un protocolo permitido
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return false
    }

    // Verificar que no es una IP (a menos que estén permitidas)
    if (!allowIPs && IP_REGEX.test(urlToCheck)) {
      return false
    }

    // Verificar que tiene un dominio con TLD válido usando nuestra expresión regular
    return URL_REGEX.test(urlToCheck)
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
