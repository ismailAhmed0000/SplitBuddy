import { Link } from '@tanstack/react-router'
import { money } from '@/lib/format'
import type { Bill } from '@/lib/bills'

const iconTones = ['bg-brand-100 text-brand-600', 'bg-sky-100 text-sky-600', 'bg-amber-100 text-amber-600']

export function GroupBillsCard({ bills }: { bills: Bill[] | undefined }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Bills</h2>
        <span className="text-sm text-slate-400">
          {bills?.length ?? 0} {bills?.length === 1 ? 'bill' : 'bills'}
        </span>
      </div>

      <div className="mt-2">
        {bills?.length === 0 && <p className="py-4 text-sm text-slate-500">No bills in this group yet.</p>}

        {bills?.map((bill, i) => (
          <Link
            key={bill.id}
            to="/bills/$billId"
            params={{ billId: String(bill.id) }}
            className="flex items-center gap-4 border-b border-slate-100 py-3 last:border-b-0"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconTones[i % iconTones.length]}`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 3h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3V3Z"
                />
                <path strokeLinecap="round" d="M9 8h6M9 11.5h6M9 15h4" />
              </svg>
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
              {bill.merchant_name ?? 'Receipt'}
            </span>
            <span className="shrink-0 text-sm font-bold text-ink">{money(bill.total)}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
