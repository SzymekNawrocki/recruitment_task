'use client'

import { useTransition } from 'react'
import { approveOrder, rejectOrder } from '@/app/orders/actions'

export default function AdminActions({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition()

  function approve() {
    startTransition(() => { approveOrder(orderId) })
  }

  function reject() {
    if (!confirm('Odrzucić to zamówienie?')) return
    startTransition(() => { rejectOrder(orderId) })
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={approve}
        disabled={isPending}
        className="px-3 py-1.5 text-sm font-medium text-green-700 border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
      >
        Zatwierdź
      </button>
      <button
        type="button"
        onClick={reject}
        disabled={isPending}
        className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
      >
        Odrzuć
      </button>
    </div>
  )
}
