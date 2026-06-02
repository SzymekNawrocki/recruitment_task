import Link from 'next/link'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getDict, LANG_COOKIE, type Lang } from '@/lib/i18n'
import AdminActions from './_components/AdminActions'

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700 border border-slate-200',
  medium: 'bg-amber-100 text-amber-800 border border-amber-200',
  high: 'bg-red-100 text-red-800 border border-red-200',
}

export default async function AdminPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get(LANG_COOKIE)?.value ?? 'pl') as Lang
  const t = getDict(lang)

  const pending = await prisma.order.findMany({
    where: { status: 'PENDING' },
    include: { items: true },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-900">{t.admin.title}</h1>

      {pending.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-lg font-medium">{t.admin.empty}</p>
          <p className="text-sm mt-1">
            <Link href="/orders" className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2">
              {t.admin.emptyLink}
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
              <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-semibold text-indigo-700 hover:text-indigo-900 hover:underline underline-offset-2"
                      >
                        {order.employeeName}
                      </Link>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_BADGE[order.priority] ?? 'bg-slate-100 text-slate-700'}`}>
                        {t.priority[order.priority as keyof typeof t.priority] ?? order.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {order.department} &middot;{' '}
                      {new Date(order.createdAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'pl-PL')}
                    </p>
                    <p className="text-sm text-slate-700 mt-1">{order.justification}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold text-slate-900">{total.toFixed(2)} PLN</p>
                    <p className="text-xs text-slate-500">{order.items.length} {t.admin.items}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-50">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-1.5 text-slate-800">{item.name}</td>
                          <td className="py-1.5 text-right text-slate-500">
                            {item.quantity} × {item.unitValue.toFixed(0)} PLN
                          </td>
                          <td className="py-1.5 text-right font-semibold text-slate-900 pl-4">
                            {(item.quantity * item.unitValue).toFixed(2)} PLN
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-1 border-t border-slate-100">
                  <AdminActions
                    orderId={order.id}
                    approveLabel={t.admin.approve}
                    rejectLabel={t.admin.reject}
                    rejectConfirm={t.admin.rejectConfirm}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
