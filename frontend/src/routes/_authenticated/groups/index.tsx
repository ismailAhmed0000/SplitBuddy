import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useCreateGroup, useGroups } from '@/lib/groups'

export const Route = createFileRoute('/_authenticated/groups/')({
  component: GroupsListPage,
})

function GroupsListPage() {
  const { data: groups, isLoading } = useGroups()
  const createGroup = useCreateGroup()

  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')

  function handleCreate() {
    if (!name.trim()) return
    createGroup.mutate(name.trim(), {
      onSuccess: () => {
        setName('')
        setIsCreating(false)
      },
    })
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Groups</h1>
          <p className="mt-1 text-sm text-slate-500">Where you and your buddies split bills.</p>
        </div>
        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            New group
          </button>
        )}
      </div>

      {isCreating && (
        <div className="mt-4 flex gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Group name (e.g. Trip to Bali)"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={createGroup.isPending || !name.trim()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createGroup.isPending ? 'Creating…' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreating(false)
              setName('')
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {isLoading && <p className="text-sm text-slate-500">Loading…</p>}

        {!isLoading && groups?.length === 0 && !isCreating && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <p className="text-sm text-slate-500">You're not in any groups yet.</p>
          </div>
        )}

        {groups?.map((group) => (
          <Link
            key={group.id}
            to="/groups/$groupId"
            params={{ groupId: String(group.id) }}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300"
          >
            <div>
              <p className="text-sm font-medium text-ink">{group.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {group.members_count ?? group.members?.length ?? 0} buddies
              </p>
            </div>
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </main>
  )
}
