import Link from 'next/link'
import { cookies } from 'next/headers'
import { getOrders } from '@/lib/queries'
import { getDict, LANG_COOKIE, type Lang } from '@/lib/i18n'

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

export default async function OrdersPage() {
  const [orders, cookieStore] = await Promise.all([getOrders(), cookies()])
  const lang = (cookieStore.get(LANG_COOKIE)?.value ?? 'pl') as Lang
  const t = getDict(lang)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t.orders.title}</h1>
        <Link
          href="/orders/new"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          {t.orders.newButton}
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-lg font-medium">{t.orders.empty}</p>
          <p className="text-sm mt-1">
            <Link href="/orders/new" className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2">
              {t.orders.emptyLink}
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">{t.orders.cols.employee}</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">{t.orders.cols.department}</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">{t.orders.cols.priority}</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">{t.orders.cols.value}</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">{t.orders.cols.status}</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">{t.orders.cols.date}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const total = order.items.reduce(
                  (sum, item) => sum + item.quantity * item.unitValue,
                  0
                )
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-semibold text-indigo-700 hover:text-indigo-900 hover:underline underline-offset-2"
                      >
                        {order.employeeName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{order.department}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_BADGE[order.priority] ?? 'bg-slate-100 text-slate-700'}`}>
                        {t.priority[order.priority as keyof typeof t.priority] ?? order.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {total.toFixed(2)} PLN
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[order.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {t.status[order.status as keyof typeof t.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'pl-PL')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
