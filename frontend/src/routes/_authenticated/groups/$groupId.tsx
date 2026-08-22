import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useCurrentUser } from '@/lib/auth'
import {
  useAddGroupMember,
  useDeleteGroup,
  useGroup,
  useGroupBalances,
  useRemoveGroupMember,
  useSearchUsers,
  useUpdateGroup,
} from '@/lib/groups'
import { useBills } from '@/lib/bills'
import { useBuddies } from '@/lib/buddies'
import { useCreateSettlement, useSettlements } from '@/lib/settlements'
import { money } from '@/lib/format'

export const Route = createFileRoute('/_authenticated/groups/$groupId')({
  component: GroupDetailPage,
})

function GroupDetailPage() {
  const navigate = useNavigate()
  const { groupId } = Route.useParams()
  const id = Number(groupId)

  const { data: currentUser } = useCurrentUser()
  const { data: group, isLoading } = useGroup(id)
  const { data: balances } = useGroupBalances(id)
  const { data: bills } = useBills(id)
  const updateGroup = useUpdateGroup(id)
  const deleteGroup = useDeleteGroup()
  const removeMember = useRemoveGroupMember(id)

  const isCreator = group?.created_by === currentUser?.id

  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState('')

  function startEditingName() {
    setName(group?.name ?? '')
    setIsEditingName(true)
  }

  function saveName() {
    if (name.trim() && name.trim() !== group?.name) {
      updateGroup.mutate(name.trim())
    }
    setIsEditingName(false)
  }

  function handleDeleteGroup() {
    if (confirm(`Delete "${group?.name}"? This removes all its bills and settlements.`)) {
      deleteGroup.mutate(id, { onSuccess: () => navigate({ to: '/groups' }) })
    }
  }

  function handleRemoveMember(memberId: number, memberName: string) {
    if (confirm(`Remove ${memberName} from this group?`)) {
      removeMember.mutate(memberId)
    }
  }

  if (isLoading || !group) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-slate-500">Loading…</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/groups" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← Back to groups
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        {isEditingName ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === 'Enter' && saveName()}
            className="rounded-lg border border-brand-300 px-2 py-1 text-2xl font-semibold text-ink outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        ) : (
          <h1
            onClick={() => isCreator && startEditingName()}
            className={`text-2xl font-semibold text-ink ${isCreator ? 'cursor-pointer hover:text-brand-700' : ''}`}
          >
            {group.name}
          </h1>
        )}

        {isCreator && (
          <button
            type="button"
            onClick={handleDeleteGroup}
            className="rounded-lg border border-error-200 px-3 py-1.5 text-sm font-medium text-error-600 transition hover:bg-error-50"
          >
            Delete group
          </button>
        )}
      </div>

      <BuddiesSection
        groupId={id}
        members={group.members}
        isCreator={isCreator}
        currentUserId={currentUser?.id}
        onRemove={handleRemoveMember}
      />

      <BalancesSection groupId={id} balances={balances ?? []} members={group.members} />

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-ink">Bills</h2>
        <div className="mt-3 flex flex-col gap-2">
          {bills?.length === 0 && <p className="text-sm text-slate-500">No bills in this group yet.</p>}
          {bills?.map((bill) => (
            <Link
              key={bill.id}
              to="/bills/$billId"
              params={{ billId: String(bill.id) }}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm transition hover:border-brand-200"
            >
              <span className="text-ink">{bill.merchant_name ?? 'Receipt'}</span>
              <span className="font-medium text-slate-700">{money(bill.total)}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

function BuddiesSection({
  groupId,
  members,
  isCreator,
  currentUserId,
  onRemove,
}: {
  groupId: number
  members: { id: number; name: string; user_id: number | null }[]
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
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-ink">Buddies</h2>

      <div className="mt-3 flex flex-col gap-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
            <span className="text-sm text-slate-800">{member.name}</span>
            {isCreator && member.user_id !== currentUserId && (
              <button
                type="button"
                onClick={() => onRemove(member.id, member.name)}
                aria-label={`Remove ${member.name}`}
                className="text-xs font-medium text-slate-400 transition hover:text-error-600"
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
          placeholder="Search your buddies, or type a name to add"
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

function BalancesSection({
  groupId,
  balances,
  members,
}: {
  groupId: number
  balances: { group_member_id: number; name: string; balance: number }[]
  members: { id: number; name: string }[]
}) {
  const [isSettling, setIsSettling] = useState(false)
  const { data: settlements } = useSettlements(groupId)

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Balances</h2>
        <button
          type="button"
          onClick={() => setIsSettling((open) => !open)}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          {isSettling ? 'Cancel' : 'Settle up'}
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        {balances.map((b) => (
          <Link
            key={b.group_member_id}
            to="/groups/$groupId/members/$memberId"
            params={{ groupId: String(groupId), memberId: String(b.group_member_id) }}
            className="flex items-center justify-between rounded-lg px-2 py-1 text-sm transition hover:bg-slate-50"
          >
            <span className="text-slate-700">{b.name}</span>
            <span
              className={
                b.balance > 0 ? 'font-medium text-brand-600' : b.balance < 0 ? 'font-medium text-error-600' : 'text-slate-500'
              }
            >
              {b.balance > 0 ? `+${money(b.balance)}` : money(b.balance)}
            </span>
          </Link>
        ))}
      </div>

      {isSettling && (
        <SettleUpForm groupId={groupId} members={members} balances={balances} onDone={() => setIsSettling(false)} />
      )}

      {settlements && settlements.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-xs font-medium text-slate-500">Recent settlements</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {settlements.slice(0, 5).map((s) => (
              <p key={s.id} className="text-xs text-slate-600">
                {s.payer?.name ?? 'Someone'} paid {s.payee?.name ?? 'someone'} {money(s.amount)}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SettleUpForm({
  groupId,
  members,
  balances,
  onDone,
}: {
  groupId: number
  members: { id: number; name: string }[]
  balances: { group_member_id: number; balance: number }[]
  onDone: () => void
}) {
  const createSettlement = useCreateSettlement(groupId)

  const suggestion = useMemo(() => {
    const debtor = [...balances].sort((a, b) => a.balance - b.balance)[0]
    const creditor = [...balances].sort((a, b) => b.balance - a.balance)[0]
    if (!debtor || !creditor || debtor.balance >= 0 || creditor.balance <= 0) return null
    return {
      paidBy: debtor.group_member_id,
      paidTo: creditor.group_member_id,
      amount: Math.min(Math.abs(debtor.balance), creditor.balance),
    }
  }, [balances])

  const [paidBy, setPaidBy] = useState<number | ''>(suggestion?.paidBy ?? '')
  const [paidTo, setPaidTo] = useState<number | ''>(suggestion?.paidTo ?? '')
  const [amount, setAmount] = useState(suggestion ? String(suggestion.amount.toFixed(2)) : '')

  function handleSubmit() {
    if (!paidBy || !paidTo || paidBy === paidTo || !amount || Number(amount) <= 0) return
    createSettlement.mutate(
      { paidBy, paidTo, amount: Number(amount) },
      { onSuccess: onDone },
    )
  }

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Paid by
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value ? Number(e.target.value) : '')}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
          >
            <option value="">Select…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Paid to
          <select
            value={paidTo}
            onChange={(e) => setPaidTo(e.target.value ? Number(e.target.value) : '')}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
          >
            <option value="">Select…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Amount
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
        />
      </label>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={createSettlement.isPending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {createSettlement.isPending ? 'Recording…' : 'Record settlement'}
      </button>
    </div>
  )
}
