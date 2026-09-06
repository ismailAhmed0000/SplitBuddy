import { Link } from '@tanstack/react-router'
import type { Tab } from '@/lib/tabs'

export function TabRow({ tab, onDelete }: { tab: Tab; onDelete: () => void }) {
  const memberCount = tab.members_count ?? tab.members?.length ?? 0

  return (
    <div className="flex items-center gap-4 border-b border-slate-100 px-4 py-4 last:border-b-0 sm:px-6">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75}>
          <circle cx="9" cy="8" r="3" />
          <path strokeLinecap="round" d="M2.5 20a6.5 6.5 0 0 1 13 0" />
          <circle cx="17" cy="8.5" r="2.2" />
          <path strokeLinecap="round" d="M15 13.3a5.4 5.4 0 0 1 4.5 6.7" />
        </svg>
      </span>

      <Link to="/tabs/$tabId" params={{ tabId: String(tab.id) }} className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{tab.name}</p>
        <p className="mt-0.5 truncate text-sm text-slate-500">
          {memberCount} {memberCount === 1 ? 'buddy' : 'buddies'}
        </p>
      </Link>

      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete tab"
        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-error-50 hover:text-error-600"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
