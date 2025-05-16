import { dictionary as enDictionary } from "./en"
import { dictionary as esDictionary } from "./es"

export type Dictionary = typeof enDictionary

// Versión segura para el cliente
export const getDictionary = async (locale: string): Promise<Dictionary> => {
  switch (locale) {
    case "en":
      return enDictionary
    case "es":
      return esDictionary
    default:
      return esDictionary
  }
}

// Versión segura para el servidor que no importa módulos del servidor
export const getDictionaryClient = (locale: string): Dictionary => {
  switch (locale) {
    case "en":
      return enDictionary
    case "es":
      return esDictionary
    default:
      return esDictionary
  }
}
