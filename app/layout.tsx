import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import { cookies } from 'next/headers'
import LanguageProvider from './_components/LanguageProvider'
import LanguageSwitcher from './_components/LanguageSwitcher'
import { getDict, LANG_COOKIE, type Lang } from '@/lib/i18n'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Portal Zamówień IT',
  description: 'Wewnętrzny portal zamawiania sprzętu IT',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const lang = (cookieStore.get(LANG_COOKIE)?.value ?? 'pl') as Lang
  const t = getDict(lang)

  return (
    <html lang={lang} className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans antialiased">
        <LanguageProvider lang={lang}>
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
              <nav className="flex items-center gap-1">
                <Link
                  href="/orders"
                  className="px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-100 transition-colors"
                >
                  {t.nav.orders}
                </Link>
                <Link
                  href="/orders/new"
                  className="px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-100 transition-colors"
                >
                  {t.nav.newOrder}
                </Link>
                <Link
                  href="/admin"
                  className="px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-100 transition-colors"
                >
                  {t.nav.admin}
                </Link>
              </nav>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                  {t.app.title}
                </span>
                <LanguageSwitcher current={lang} />
              </div>
            </div>
          </header>
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  )
}
