import { useMemo, useState } from 'react'
import { useBuddies } from '@/lib/buddies'
import { useSearchUsers } from '@/lib/groups'

export function AddBuddyModal({
  existingUserIds,
  onAddBuddy,
  onAddName,
  isAdding,
  onClose,
}: {
  existingUserIds: Set<number>
  onAddBuddy: (userId: number, name: string) => void
  onAddName: (name: string) => void
  isAdding: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const { data: myBuddies } = useBuddies()
  const { data: searchResults } = useSearchUsers(query.trim().length >= 2 ? query : '')

  const matchingBuddies = useMemo(() => {
    const term = query.trim().toLowerCase()
    return (myBuddies ?? [])
      .filter((b) => !existingUserIds.has(b.buddy_user_id))
      .filter(
        (b) => !term || b.user.name.toLowerCase().includes(term) || b.user.username.toLowerCase().includes(term),
      )
  }, [myBuddies, existingUserIds, query])

  const otherResults = useMemo(
    () =>
      (searchResults ?? []).filter(
        (u) => !existingUserIds.has(u.id) && !matchingBuddies.some((b) => b.buddy_user_id === u.id),
      ),
    [searchResults, existingUserIds, matchingBuddies],
  )

  const trimmed = query.trim()
  const hasExactMatch =
    matchingBuddies.some((b) => b.user.username.toLowerCase() === trimmed.toLowerCase()) ||
    otherResults.some((u) => u.username.toLowerCase() === trimmed.toLowerCase())

  function selectBuddy(userId: number, name: string) {
    onAddBuddy(userId, name)
    onClose()
  }

  function addUnregisteredName() {
    if (!trimmed) return
    onAddName(trimmed)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Add a buddy</h3>
          <button type="button" onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600">
            Close
          </button>
        </div>

        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or username…"
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50"
        />

        <div className="mt-3 max-h-64 overflow-y-auto">
          {matchingBuddies.length > 0 && (
            <div className="mb-2">
              <p className="px-1 pb-1 text-[11px] font-medium tracking-wide text-slate-400 uppercase">Your buddies</p>
              {matchingBuddies.map((b) => (
                <button
                  key={b.buddy_user_id}
                  type="button"
                  onClick={() => selectBuddy(b.buddy_user_id, b.user.name)}
                  disabled={isAdding}
                  className="flex w-full flex-col rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="font-medium text-ink">{b.user.name}</span>
                  <span className="text-xs text-slate-500">@{b.user.username}</span>
                </button>
              ))}
            </div>
          )}

          {otherResults.length > 0 && (
            <div className="mb-2">
              <p className="px-1 pb-1 text-[11px] font-medium tracking-wide text-slate-400 uppercase">Other users</p>
              {otherResults.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => selectBuddy(u.id, u.name)}
                  disabled={isAdding}
                  className="flex w-full flex-col rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="font-medium text-ink">{u.name}</span>
                  <span className="text-xs text-slate-500">@{u.username}</span>
                </button>
              ))}
            </div>
          )}

          {trimmed.length >= 2 && !hasExactMatch && matchingBuddies.length === 0 && otherResults.length === 0 && (
            <p className="px-1 py-2 text-sm text-slate-400">No one on SplitBuddy matches "{trimmed}".</p>
          )}
        </div>

        {trimmed && (
          <button
            type="button"
            onClick={addUnregisteredName}
            disabled={isAdding}
            className="mt-3 flex w-full items-center gap-1.5 rounded-lg border-t border-slate-100 px-2 py-2 text-left text-sm text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add "{trimmed}" — not on the app
          </button>
        )}
      </div>
    </div>
  )
}
