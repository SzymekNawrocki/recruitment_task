'use client'

import { useTransition } from 'react'
import { cancelOrder } from '../actions'

type Props = {
  orderId: string
  label: string
  confirm: string
  pendingLabel: string
}

export default function CancelButton({ orderId, label, confirm: confirmMsg, pendingLabel }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!window.confirm(confirmMsg)) return
    startTransition(() => { cancelOrder(orderId) })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="px-4 py-2 text-sm font-semibold text-red-700 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
    >
      {isPending ? pendingLabel : label}
    </button>
  )
}
