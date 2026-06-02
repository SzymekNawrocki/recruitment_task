import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getOrder } from '@/lib/queries'
import { getDict, LANG_COOKIE, type Lang } from '@/lib/i18n'
import CancelButton from '../_components/CancelButton'

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-700',
}
const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [{ id }, cookieStore] = await Promise.all([params, cookies()])
  const lang = (cookieStore.get(LANG_COOKIE)?.value ?? 'pl') as Lang
  const t = getDict(lang)

  const order = await getOrder(id)
  if (!order) notFound()

  const total = order.items.reduce((sum, item) => sum + item.quantity * item.unitValue, 0)
  const isLocked =
    order.status === 'APPROVED' || order.status === 'CANCELLED' || order.status === 'REJECTED'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/orders" className="text-sm text-gray-500 hover:underline">
            {t.detail.back}
          </Link>
          <h1 className="text-2xl font-semibold mt-1">{order.employeeName}</h1>
        </div>
        <div className="flex gap-2">
          {!isLocked && (
            <>
              <Link
                href={`/orders/${order.id}/edit`}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t.detail.edit}
              </Link>
              <CancelButton orderId={order.id} label={t.detail.cancel} confirm={t.detail.cancelConfirm} pendingLabel={t.detail.cancelling} />
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{t.detail.department}</p>
            <p className="font-medium">{order.department}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{t.detail.priority}</p>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[order.priority] ?? 'bg-gray-100 text-gray-600'}`}>
              {t.priority[order.priority as keyof typeof t.priority] ?? order.priority}
            </span>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{t.detail.status}</p>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {t.status[order.status as keyof typeof t.status] ?? order.status}
            </span>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{t.detail.date}</p>
            <p className="font-medium">
              {new Date(order.createdAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'pl-PL')}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{t.detail.justification}</p>
            <p className="font-medium">{order.justification}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[400px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.detail.cols.item}</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">{t.detail.cols.unitPrice}</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">{t.detail.cols.qty}</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">{t.detail.cols.total}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3 text-right text-gray-600">{item.unitValue.toFixed(2)} PLN</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {(item.quantity * item.unitValue).toFixed(2)} PLN
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gray-200 bg-gray-50">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-700">
                {t.detail.total}
              </td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">
                {total.toFixed(2)} PLN
              </td>
            </tr>
          </tfoot>
        </table>
        </div>
      </div>
    </div>
  )
}
