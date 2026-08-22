import { createFileRoute, Link } from '@tanstack/react-router'
import { useBuddyDetail } from '@/lib/buddies'
import { money } from '@/lib/format'

export const Route = createFileRoute('/_authenticated/buddies/$buddyId')({
  component: BuddyDetailPage,
})

const statusStyles: Record<string, string> = {
  processing: 'bg-amber-100 text-amber-700',
  parsed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-brand-100 text-brand-700',
  failed: 'bg-error-100 text-error-700',
}

function BuddyDetailPage() {
  const { buddyId } = Route.useParams()
  const { data: buddy, isLoading } = useBuddyDetail(Number(buddyId))

  if (isLoading || !buddy) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-slate-500">Loading…</p>
      </main>
    )
  }

  const isOwed = buddy.balance > 0
  const isOwing = buddy.balance < 0
  const balanceLabel = isOwed ? 'Is owed' : isOwing ? 'Owes' : 'Settled up'
  const balanceColor = isOwed ? 'text-brand-600' : isOwing ? 'text-error-600' : 'text-slate-500'

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/buddies" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← Back to buddies
      </Link>

      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{buddy.user.name}</h1>
          <p className="mt-0.5 text-sm text-slate-500">@{buddy.user.username}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">{balanceLabel}</p>
          <p className={`text-lg font-semibold ${balanceColor}`}>{money(Math.abs(buddy.balance))}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">Bills together</h2>

        {buddy.bills.length === 0 && (
          <p className="text-sm text-slate-500">No shared bills yet.</p>
        )}

        {buddy.bills.map((bill) => (
          <Link
            key={bill.id}
            to="/bills/$billId"
            params={{ billId: String(bill.id) }}
            className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-200"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{bill.merchant_name ?? 'Receipt'}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {bill.group_name}
                  {bill.bill_date ? ` · ${bill.bill_date}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-ink">{money(bill.total)}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[bill.status] ?? 'bg-slate-100 text-slate-700'}`}
                >
                  {bill.status}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-1 border-t border-slate-100 pt-3">
              {bill.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs text-slate-600">
                  <span>{item.name}</span>
                  <span>{money(item.amount)}</span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
