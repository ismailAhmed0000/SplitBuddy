import { useCurrentUser } from '@/lib/auth'
import { useUserBalances } from '@/lib/balances'
import { currency } from '@/lib/format'

export function AnalyticsBanner() {
  const { data: user } = useCurrentUser()
  const { data: balances, isLoading } = useUserBalances(user?.id)

  if (isLoading) {
    return (
      <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-28 rounded-2xl bg-slate-100" />
        <div className="h-28 rounded-2xl bg-slate-100" />
      </div>
    )
  }

  const overall = balances?.overall_balance ?? 0
  const groupCount = balances?.groups.length ?? 0
  const isOwed = overall > 0
  const isOwing = overall < 0

  const statusLabel = isOwed ? "You're owed" : isOwing ? 'You owe' : "You're settled up"
  const amountColor = isOwed ? 'text-emerald-600' : isOwing ? 'text-red-600' : 'text-slate-900'

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">{statusLabel}</p>
        <p className={`mt-1 text-3xl font-semibold ${amountColor}`}>{currency.format(Math.abs(overall))}</p>
        {groupCount === 0 && (
          <p className="mt-2 text-sm text-slate-500">Join or create a group to start tracking balances.</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Active groups</p>
        <p className="mt-1 text-3xl font-semibold text-slate-900">{groupCount}</p>
      </div>
    </div>
  )
}
