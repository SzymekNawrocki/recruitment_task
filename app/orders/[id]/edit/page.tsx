import { notFound, redirect } from 'next/navigation'
import { getOrder, getCatalog } from '@/lib/queries'
import OrderForm from '../../_components/OrderForm'

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [order, catalog] = await Promise.all([getOrder(id), getCatalog()])

  if (!order) notFound()
  if (order.status === 'APPROVED') redirect(`/orders/${id}`)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Edytuj zamówienie</h1>
      <OrderForm catalog={catalog} order={order} />
    </div>
  )
}
