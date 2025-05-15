import { dictionary as enDictionary } from "./en"
import { dictionary as esDictionary } from "./es"

export type Dictionary = typeof enDictionary

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
