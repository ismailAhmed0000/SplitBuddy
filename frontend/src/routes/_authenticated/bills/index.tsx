import { createFileRoute, Link } from '@tanstack/react-router'
import { useBills, useDeleteBill } from '@/lib/bills'
import { useGroups } from '@/lib/groups'
import { money } from '@/lib/format'

export const Route = createFileRoute('/_authenticated/bills/')({
  component: BillsListPage,
})

const statusStyles: Record<string, string> = {
  processing: 'bg-amber-100 text-amber-700',
  parsed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
}

function BillsListPage() {
  const { data: bills, isLoading } = useBills()
  const { data: groups } = useGroups()
  const deleteBill = useDeleteBill()

  const groupNames = new Map(groups?.map((g) => [g.id, g.name]))

  function handleDelete(id: number) {
    if (confirm('Delete this bill? This cannot be undone.')) {
      deleteBill.mutate(id)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Bills</h1>
      <p className="mt-1 text-sm text-slate-500">Every receipt you've uploaded, across all your groups.</p>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading && <p className="text-sm text-slate-500">Loading…</p>}

        {!isLoading && bills?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <p className="text-sm text-slate-500">
              No bills yet. Upload one from the{' '}
              <Link to="/" className="font-medium text-violet-600 hover:text-violet-700">
                dashboard
              </Link>
              .
            </p>
          </div>
        )}

        {bills?.map((bill) => (
          <div
            key={bill.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <Link to="/bills/$billId" params={{ billId: String(bill.id) }} className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{bill.merchant_name ?? 'Receipt'}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {groupNames.get(bill.group_id) ?? 'Unknown group'}
                {bill.bill_date ? ` · ${bill.bill_date}` : ''}
              </p>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">{money(bill.total)}</span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[bill.status] ?? 'bg-slate-100 text-slate-700'}`}
              >
                {bill.status}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(bill.id)}
                aria-label="Delete bill"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
