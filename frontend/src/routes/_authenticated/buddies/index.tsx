import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useCurrentUser } from '@/lib/auth'
import { useAddBuddy, useBuddies, useRemoveBuddy } from '@/lib/buddies'
import { useSearchUsers } from '@/lib/groups'
import { parseApiError } from '@/lib/api'
import { BuddyQrCode } from '@/components/BuddyQrCode'
import { BuddyQrScanner } from '@/components/BuddyQrScanner'

export const Route = createFileRoute('/_authenticated/buddies/')({
  component: BuddiesPage,
})

function BuddiesPage() {
  const { data: currentUser } = useCurrentUser()
  const { data: buddies, isLoading } = useBuddies()
  const addBuddy = useAddBuddy()
  const removeBuddy = useRemoveBuddy()

  const [isScanning, setIsScanning] = useState(false)
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const { data: searchResults } = useSearchUsers(query.trim().length >= 2 ? query : '')

  const existingBuddyUserIds = useMemo(
    () => new Set(buddies?.map((b) => b.buddy_user_id)),
    [buddies],
  )

  function addByUsername(username: string, label: string) {
    addBuddy.mutate(username, {
      onSuccess: () => {
        setFeedback({ type: 'success', message: `${label} added as a buddy.` })
        setQuery('')
      },
      onError: (err) => setFeedback({ type: 'error', message: parseApiError(err).message }),
    })
  }

  function handleScan(username: string) {
    setIsScanning(false)
    addByUsername(username, `@${username}`)
  }

  function handleRemove(buddyId: number, name: string) {
    if (confirm(`Remove ${name} from your buddies?`)) {
      removeBuddy.mutate(buddyId)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Buddies</h1>
      <p className="mt-1 text-sm text-slate-500">
        Your go-to list for splitting bills — add friends by username or QR code.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr]">
        {currentUser && <BuddyQrCode user={currentUser} />}

        <div className="flex flex-col justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Add a buddy</h2>

          <button
            type="button"
            onClick={() => {
              setFeedback(null)
              setIsScanning(true)
            }}
            className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100"
          >
            Scan a QR code
          </button>

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search by username, name, or email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/50"
            />

            {isFocused && query.trim().length >= 2 && (
              <div
                onMouseDown={(e) => e.preventDefault()}
                className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
              >
                {searchResults
                  ?.filter((u) => u.id !== currentUser?.id && !existingBuddyUserIds.has(u.id))
                  .map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => addByUsername(u.username, u.name)}
                      className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-900">{u.name}</span>
                      <span className="text-xs text-slate-500">@{u.username}</span>
                    </button>
                  ))}
                {searchResults?.filter((u) => u.id !== currentUser?.id && !existingBuddyUserIds.has(u.id))
                  .length === 0 && <p className="px-3 py-2 text-xs text-slate-400">No matching users found.</p>}
              </div>
            )}
          </div>

          {feedback && (
            <p className={`text-sm ${feedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {feedback.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Your buddies</h2>

        <div className="mt-3 flex flex-col gap-2">
          {isLoading && <p className="text-sm text-slate-500">Loading…</p>}

          {!isLoading && buddies?.length === 0 && (
            <p className="text-sm text-slate-500">No buddies yet — add one above to get started.</p>
          )}

          {buddies?.map((buddy) => (
            <div key={buddy.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <div>
                <p className="text-sm text-slate-800">{buddy.user.name}</p>
                <p className="text-xs text-slate-500">@{buddy.user.username}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(buddy.id, buddy.user.name)}
                aria-label={`Remove ${buddy.user.name}`}
                className="text-xs font-medium text-slate-400 transition hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {isScanning && <BuddyQrScanner onScan={handleScan} onClose={() => setIsScanning(false)} />}
    </main>
  )
}
