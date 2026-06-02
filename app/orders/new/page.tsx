import { cookies } from 'next/headers'
import { getCatalog } from '@/lib/queries'
import { getDict, LANG_COOKIE, type Lang } from '@/lib/i18n'
import OrderForm from '../_components/OrderForm'

export default async function NewOrderPage() {
  const [catalog, cookieStore] = await Promise.all([getCatalog(), cookies()])
  const lang = (cookieStore.get(LANG_COOKIE)?.value ?? 'pl') as Lang
  const t = getDict(lang)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">{t.newOrder.title}</h1>
      <OrderForm catalog={catalog} />
    </div>
  )
}
