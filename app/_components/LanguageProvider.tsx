'use client'

import { createContext, useContext, useState } from 'react'
import { getDict, type Dict, type Lang } from '@/lib/i18n'

const LangContext = createContext<Dict>(getDict('pl'))

export function useT() {
  return useContext(LangContext)
}

export default function LanguageProvider({
  lang,
  children,
}: {
  lang: Lang
  children: React.ReactNode
}) {
  const [dict] = useState(() => getDict(lang))
  return <LangContext.Provider value={dict}>{children}</LangContext.Provider>
}
