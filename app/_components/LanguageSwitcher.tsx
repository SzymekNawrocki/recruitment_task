'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setLang } from '@/app/actions'
import type { Lang } from '@/lib/i18n'

export default function LanguageSwitcher({ current }: { current: Lang }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function toggle() {
    const next: Lang = current === 'pl' ? 'en' : 'pl'
    startTransition(async () => {
      await setLang(next)
      router.refresh()
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="text-xs font-medium text-slate-400 hover:text-white disabled:opacity-50 transition-colors border border-slate-700 rounded px-2 py-1 hover:border-slate-500"
    >
      {current === 'pl' ? 'EN' : 'PL'}
    </button>
  )
}
