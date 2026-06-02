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
      className="text-xs font-medium text-gray-500 hover:text-gray-900 disabled:opacity-50 transition-colors border border-gray-200 rounded px-2 py-1"
    >
      {current === 'pl' ? 'EN' : 'PL'}
    </button>
  )
}
