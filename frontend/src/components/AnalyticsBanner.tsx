import { useCurrentUser } from '@/lib/auth'
import { useUserBalances } from '@/lib/balances'
import { currency } from '@/lib/format'

export function AnalyticsBanner() {
  const { data: user } = useCurrentUser()
  const { data: balances, isLoading } = useUserBalances(user?.id)

  if (isLoading) {
    return (
      <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="h-28 rounded-2xl bg-slate-100" />
        <div className="h-28 rounded-2xl bg-slate-100" />
        <div className="h-28 rounded-2xl bg-slate-100" />
      </div>
    )
  }

  const groups = balances?.groups ?? []
  const owed = groups.filter((g) => g.balance > 0).reduce((sum, g) => sum + g.balance, 0)
  const owing = groups.filter((g) => g.balance < 0).reduce((sum, g) => sum + Math.abs(g.balance), 0)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="You're owed" value={currency.format(owed)} icon={<SettledIcon />} tone="brand" />
      <StatCard label="You owe" value={currency.format(owing)} icon={<DollarIcon />} tone="error" />
      <StatCard label="Active groups" value={String(groups.length)} icon={<GroupsIcon />} tone="slate" />
    </div>
  )
}

type Tone = 'brand' | 'slate' | 'error'

const toneClasses: Record<Tone, string> = {
  brand: 'bg-brand-100 text-brand-600',
  slate: 'bg-slate-100 text-slate-500',
  error: 'bg-error-100 text-error-600',
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: string
  icon: React.ReactNode
  tone: Tone
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
        {icon}
      </span>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
      </div>
    </div>
  )
}

function SettledIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 12a8 8 0 0 1 13.657-5.657M20 12a8 8 0 0 1-13.657 5.657M17 3v4h-4M7 21v-4h4"
      />
    </svg>
  )
}

function DollarIcon() {
  return <span className="text-xl font-bold">$</span>
}

function GroupsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="round" d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="17" cy="8.5" r="2.2" />
      <path strokeLinecap="round" d="M15 13.3a5.4 5.4 0 0 1 4.5 6.7" />
    </svg>
  )
}
