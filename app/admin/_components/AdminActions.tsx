'use client'

import { useTransition } from 'react'
import { approveOrder, rejectOrder } from '@/app/orders/actions'

type Props = {
  orderId: string
  approveLabel: string
  rejectLabel: string
  rejectConfirm: string
}

export default function AdminActions({ orderId, approveLabel, rejectLabel, rejectConfirm }: Props) {
  const [isPending, startTransition] = useTransition()

  function approve() {
    startTransition(() => { approveOrder(orderId) })
  }

  function reject() {
    if (!confirm(rejectConfirm)) return
    startTransition(() => { rejectOrder(orderId) })
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={approve}
        disabled={isPending}
        className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
      >
        {approveLabel}
      </button>
      <button
        type="button"
        onClick={reject}
        disabled={isPending}
        className="px-4 py-2 text-sm font-semibold text-red-700 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
      >
        {rejectLabel}
      </button>
    </div>
  )
}
