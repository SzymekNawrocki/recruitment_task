import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminActions from './_components/AdminActions'

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-700',
}
const PRIORITY_LABEL: Record<string, string> = {
  low: 'Niski',
  medium: 'Średni',
  high: 'Wysoki',
}

export default async function AdminPage() {
  const pending = await prisma.order.findMany({
    where: { status: 'PENDING' },
    include: { items: true },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Panel admina</h1>

      {pending.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Brak oczekujących zamówień</p>
          <p className="text-sm mt-1">
            <Link href="/orders" className="text-gray-600 underline">
              Zobacz wszystkie zamówienia
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((order) => {
            const total = order.items.reduce(
              (sum, item) => sum + item.quantity * item.unitValue,
              0
            )
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-semibold text-gray-900 hover:underline"
                      >
                        {order.employeeName}
                      </Link>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[order.priority] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {PRIORITY_LABEL[order.priority] ?? order.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {order.department} &middot;{' '}
                      {new Date(order.createdAt).toLocaleDateString('pl-PL')}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{order.justification}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold text-gray-900">{total.toFixed(2)} PLN</p>
                    <p className="text-xs text-gray-400">{order.items.length} poz.</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-50">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-1 text-gray-700">{item.name}</td>
                          <td className="py-1 text-right text-gray-400">
                            {item.quantity} × {item.unitValue.toFixed(0)} PLN
                          </td>
                          <td className="py-1 text-right font-medium text-gray-800 pl-4">
                            {(item.quantity * item.unitValue).toFixed(2)} PLN
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <AdminActions orderId={order.id} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
