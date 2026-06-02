import pl from './pl'
import en from './en'
export type { Dict } from './pl'

export type Lang = 'pl' | 'en'
export const DEFAULT_LANG: Lang = 'pl'
export const LANG_COOKIE = 'lang'

export function getDict(lang: string) {
  return lang === 'en' ? en : pl
}
