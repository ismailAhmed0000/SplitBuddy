import { Link } from '@tanstack/react-router'
import type { Group } from '@/lib/groups'

export function GroupRow({ group, onDelete }: { group: Group; onDelete: () => void }) {
  const memberCount = group.members_count ?? group.members?.length ?? 0

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

      <Link to="/groups/$groupId" params={{ groupId: String(group.id) }} className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{group.name}</p>
        <p className="mt-0.5 truncate text-sm text-slate-500">
          {memberCount} {memberCount === 1 ? 'buddy' : 'buddies'}
        </p>
      </Link>

      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete group"
        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-error-50 hover:text-error-600"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
