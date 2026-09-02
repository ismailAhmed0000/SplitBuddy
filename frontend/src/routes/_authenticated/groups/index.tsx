import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useCreateGroup, useDeleteGroup, useGroups } from '@/lib/groups'
import { GroupRow } from '@/components/GroupRow'

export const Route = createFileRoute('/_authenticated/groups/')({
  component: GroupsListPage,
})

function GroupsListPage() {
  const { data: groups, isLoading } = useGroups()
  const createGroup = useCreateGroup()
  const deleteGroup = useDeleteGroup()

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

  function handleDelete(id: number) {
    if (confirm('Delete this group? This cannot be undone.')) {
      deleteGroup.mutate(id)
    }
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

      {isLoading && <p className="mt-6 text-sm text-slate-500">Loading…</p>}

      {!isLoading && groups?.length === 0 && !isCreating && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-sm text-slate-500">You're not in any groups yet.</p>
        </div>
      )}

      {groups && groups.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {groups.map((group) => (
            <GroupRow key={group.id} group={group} onDelete={() => handleDelete(group.id)} />
          ))}
        </div>
      )}
    </main>
  )
}
