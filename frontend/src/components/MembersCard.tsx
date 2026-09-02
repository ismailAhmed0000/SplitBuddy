import { useMemo, useState } from 'react'
import { MemberAvatar } from './MemberAvatar'
import { useAddGroupMember } from '@/lib/groups'
import { useBuddies } from '@/lib/buddies'
import { useSearchUsers } from '@/lib/groups'
import type { GroupMember } from '@/lib/groups'

export function MembersCard({
  groupId,
  members,
  payerId,
  isCreator,
  currentUserId,
  onRemove,
}: {
  groupId: number
  members: GroupMember[]
  payerId: number | null
  isCreator: boolean
  currentUserId: number | undefined
  onRemove: (memberId: number, name: string) => void
}) {
  const addMember = useAddGroupMember(groupId)
  const { data: myBuddies } = useBuddies()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { data: searchResults } = useSearchUsers(query.trim().length >= 2 ? query : '')

  const existingUserIds = useMemo(() => new Set(members.map((m) => m.user_id).filter(Boolean)), [members])

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

  function addByName(memberName: string) {
    addMember.mutate({ name: memberName })
    setQuery('')
  }

  function addByUser(user: { id: number; name: string }) {
    addMember.mutate({ name: user.name, userId: user.id })
    setQuery('')
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Members</h2>
        <span className="text-sm text-slate-400">{members.length}</span>
      </div>

      <div className="mt-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0">
            <div className="flex min-w-0 items-center gap-3">
              <MemberAvatar name={member.name} isCollector={member.id === payerId} />
              <span className="truncate text-sm font-semibold text-ink">{member.name}</span>
            </div>
            {isCreator && member.user_id !== currentUserId && (
              <button
                type="button"
                onClick={() => onRemove(member.id, member.name)}
                aria-label={`Remove ${member.name}`}
                className="shrink-0 text-sm text-slate-400 transition hover:text-error-600"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="relative mt-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Add a buddy…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50"
        />

        {isFocused && query.trim() && (
          <div
            onMouseDown={(e) => e.preventDefault()}
            className="absolute z-10 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            {matchingBuddies.length > 0 && (
              <>
                <p className="px-3 pt-1 text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                  Your buddies
                </p>
                {matchingBuddies.map((b) => (
                  <button
                    key={b.buddy_user_id}
                    type="button"
                    onClick={() => addByUser({ id: b.buddy_user_id, name: b.user.name })}
                    className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <span className="font-medium text-ink">{b.user.name}</span>
                    <span className="text-xs text-slate-500">@{b.user.username}</span>
                  </button>
                ))}
              </>
            )}

            {otherResults.length > 0 && (
              <>
                <p className="px-3 pt-1 text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                  Other users
                </p>
                {otherResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => addByUser(u)}
                    className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <span className="font-medium text-ink">{u.name}</span>
                    <span className="text-xs text-slate-500">{u.email}</span>
                  </button>
                ))}
              </>
            )}
            <button
              type="button"
              onClick={() => addByName(query.trim())}
              className="flex w-full items-center gap-1.5 border-t border-slate-100 px-3 py-2 text-left text-sm text-brand-700 hover:bg-brand-50"
            >
              + Add "{query.trim()}" as a new buddy
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
