import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getOrder, getCatalog } from '@/lib/queries'
import { getDict, LANG_COOKIE, type Lang } from '@/lib/i18n'
import OrderForm from '../../_components/OrderForm'

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [{ id }, cookieStore] = await Promise.all([params, cookies()])
  const lang = (cookieStore.get(LANG_COOKIE)?.value ?? 'pl') as Lang
  const t = getDict(lang)

  const [order, catalog] = await Promise.all([getOrder(id), getCatalog()])

  if (!order) notFound()
  if (order.status === 'APPROVED') redirect(`/orders/${id}`)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">{t.editOrder.title}</h1>
      <OrderForm catalog={catalog} order={order} />
    </div>
  )
}
