import Link from 'next/link'
import { cookies } from 'next/headers'
import { getOrders } from '@/lib/queries'
import { getDict, LANG_COOKIE, type Lang } from '@/lib/i18n'

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

export default async function OrdersPage() {
  const [orders, cookieStore] = await Promise.all([getOrders(), cookies()])
  const lang = (cookieStore.get(LANG_COOKIE)?.value ?? 'pl') as Lang
  const t = getDict(lang)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t.orders.title}</h1>
        <Link
          href="/orders/new"
          className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          {t.orders.newButton}
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">{t.orders.empty}</p>
          <p className="text-sm mt-1">
            <Link href="/orders/new" className="text-gray-600 underline">
              {t.orders.emptyLink}
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{t.orders.cols.employee}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{t.orders.cols.department}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{t.orders.cols.priority}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">{t.orders.cols.value}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{t.orders.cols.status}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{t.orders.cols.date}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const total = order.items.reduce(
                  (sum, item) => sum + item.quantity * item.unitValue,
                  0
                )
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {order.employeeName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.department}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[order.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                        {t.priority[order.priority as keyof typeof t.priority] ?? order.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {total.toFixed(2)} PLN
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {t.status[order.status as keyof typeof t.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
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
