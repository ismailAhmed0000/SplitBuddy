import { Link } from '@tanstack/react-router'
import { formatShortDate, money } from '@/lib/format'
import type { Bill } from '@/lib/bills'

const statusDotClass: Record<Bill['status'], string> = {
  confirmed: 'bg-brand-600',
  parsed: 'bg-slate-300',
  processing: 'bg-amber-400',
  failed: 'bg-error-500',
}

export function BillRow({
  bill,
  groupName,
  onDelete,
}: {
  bill: Bill
  groupName: string
  onDelete: () => void
}) {
  const date = formatShortDate(bill.bill_date)

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 sm:gap-4 sm:px-6">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass[bill.status]}`}
        aria-label={bill.status}
        title={bill.status}
      />
      <span className="hidden w-12 shrink-0 text-sm text-slate-500 sm:inline">{date}</span>

      <Link to="/bills/$billId" params={{ billId: String(bill.id) }} className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{bill.merchant_name ?? 'Receipt'}</p>
        <p className="mt-0.5 truncate text-sm text-slate-500 sm:hidden">
          {date} · {groupName}
        </p>
        <p className="mt-0.5 hidden truncate text-sm text-slate-500 sm:block">{groupName}</p>
      </Link>

      <span className="shrink-0 text-sm font-bold text-brand-700 sm:text-base">{money(bill.total)}</span>

      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete bill"
        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-error-50 hover:text-error-600"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
