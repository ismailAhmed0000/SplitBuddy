import { Seal } from './CollectorBadge'

export function PaidStamp({
  isPaid,
  canMark,
  onMarkPaid,
  pending,
}: {
  isPaid: boolean
  canMark?: boolean
  onMarkPaid?: () => void
  pending?: boolean
}) {
  if (isPaid) {
    return (
      <span role="img" aria-label="Paid" title="Paid">
        <Seal fill="#00a86b" stroke="#006b44" textColor="#ffffff" label="PAID" />
      </span>
    )
  }

  if (!canMark) return null

  return (
    <button
      type="button"
      onClick={onMarkPaid}
      disabled={pending}
      aria-label="Mark as paid"
      title="Mark as paid"
      className="shrink-0 opacity-50 grayscale transition hover:opacity-80 hover:grayscale-0 disabled:cursor-not-allowed disabled:opacity-30"
    >
      <Seal fill="#94a3b8" stroke="#64748b" textColor="#ffffff" label="PAID" />
    </button>
  )
}
