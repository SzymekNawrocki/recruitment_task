import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getOrder } from '@/lib/queries'
import { getDict, LANG_COOKIE, type Lang } from '@/lib/i18n'
import CancelButton from '../_components/CancelButton'

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700 border border-slate-200',
  medium: 'bg-amber-100 text-amber-800 border border-amber-200',
  high: 'bg-red-100 text-red-800 border border-red-200',
}
const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-blue-100 text-blue-800 border border-blue-200',
  APPROVED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  REJECTED: 'bg-red-100 text-red-800 border border-red-200',
  CANCELLED: 'bg-slate-100 text-slate-600 border border-slate-200',
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
          <Link href="/orders" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline underline-offset-2">
            ← {t.detail.back}
          </Link>
          <h1 className="text-2xl font-bold mt-1 text-slate-900">{order.employeeName}</h1>
        </div>
        <div className="flex gap-2">
          {!isLocked && (
            <>
              <Link
                href={`/orders/${order.id}/edit`}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {t.detail.edit}
              </Link>
              <CancelButton orderId={order.id} label={t.detail.cancel} confirm={t.detail.cancelConfirm} pendingLabel={t.detail.cancelling} />
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">{t.detail.department}</p>
            <p className="font-semibold text-slate-900">{order.department}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">{t.detail.priority}</p>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_BADGE[order.priority] ?? 'bg-slate-100 text-slate-700'}`}>
              {t.priority[order.priority as keyof typeof t.priority] ?? order.priority}
            </span>
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">{t.detail.status}</p>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[order.status] ?? 'bg-slate-100 text-slate-600'}`}>
              {t.status[order.status as keyof typeof t.status] ?? order.status}
            </span>
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">{t.detail.date}</p>
            <p className="font-semibold text-slate-900">
              {new Date(order.createdAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'pl-PL')}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">{t.detail.justification}</p>
            <p className="text-slate-800">{order.justification}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[400px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">{t.detail.cols.item}</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-700">{t.detail.cols.unitPrice}</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-700">{t.detail.cols.qty}</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-700">{t.detail.cols.total}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-800">{item.name}</td>
                <td className="px-4 py-3 text-right text-slate-600">{item.unitValue.toFixed(2)} PLN</td>
                <td className="px-4 py-3 text-right text-slate-800">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">
                  {(item.quantity * item.unitValue).toFixed(2)} PLN
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-200 bg-slate-50">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right font-semibold text-slate-700">
                {t.detail.total}
              </td>
              <td className="px-4 py-3 text-right font-bold text-slate-900 text-base">
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
