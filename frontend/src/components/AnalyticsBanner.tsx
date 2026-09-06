import { useCurrentUser } from '@/lib/auth'
import { useUserBalances } from '@/lib/balances'
import { currency } from '@/lib/format'

export function AnalyticsBanner() {
  const { data: user } = useCurrentUser()
  const { data: balances, isLoading } = useUserBalances(user?.id)

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-3xl bg-slate-100 sm:h-40" />
  }

  const groups = balances?.groups ?? []
  const owed = groups.filter((g) => g.balance > 0).reduce((sum, g) => sum + g.balance, 0)
  const owing = groups.filter((g) => g.balance < 0).reduce((sum, g) => sum + Math.abs(g.balance), 0)

  const stats = [
    { label: "You're owed", value: currency.format(owed) },
    { label: 'You owe', value: currency.format(owing), muted: owing > 0 },
    { label: 'Active tabs', value: String(groups.length) },
  ]

  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-white shadow-sm sm:p-10">
      <CurrencyMark />

      <dl className="relative grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-1.5 py-5 text-center first:pt-0 last:pb-0 sm:gap-2 sm:px-6 sm:py-2 sm:first:pl-0 sm:last:pr-0"
          >
            <dt className="text-sm tracking-wide text-white/55 uppercase">{stat.label}</dt>
            <dd className={`text-3xl font-bold sm:text-4xl ${stat.muted ? 'text-error-200' : 'text-white'}`}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** Oversized banknote glyph bled off the card edge as a watermark. */
function CurrencyMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      className="pointer-events-none absolute -right-10 -bottom-12 h-64 w-64 text-white/[0.07] select-none sm:-right-8 sm:h-72 sm:w-72"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3.25" />
      <path strokeLinecap="round" d="M6 9.5v5M18 9.5v5" />
    </svg>
  )
}
