import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { CollectorBadge } from '@/components/CollectorBadge'
import { PaidStamp } from '@/components/PaidStamp'
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
      updateGroup.mutate({ name: name.trim() })
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

  const myMemberId = group.members.find((m) => m.user_id === currentUser?.id)?.id

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

      <BuddiesAndBillsSection
        groupId={id}
        members={group.members}
        isCreator={isCreator}
        currentUserId={currentUser?.id}
        onRemove={handleRemoveMember}
        bills={bills}
      />

      <PayerSection
        groupId={id}
        members={group.members}
        payerId={group.payer_id}
        payer={group.payer}
        isCreator={isCreator}
      />

      <BalancesSection
        groupId={id}
        balances={balances ?? []}
        payerId={group.payer_id}
        myMemberId={myMemberId}
        payerName={group.payer?.name}
      />

    </main>
  )
}

function BuddiesAndBillsSection({
  groupId,
  members,
  isCreator,
  currentUserId,
  onRemove,
  bills,
}: {
  groupId: number
  members: { id: number; name: string; user_id: number | null }[]
  isCreator: boolean
  currentUserId: number | undefined
  onRemove: (memberId: number, name: string) => void
  bills: { id: number; merchant_name: string | null; total: number }[] | undefined
}) {
  const [tab, setTab] = useState<'buddies' | 'bills'>('buddies')

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex justify-center">
        <div className="inline-flex rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab('buddies')}
            className={`rounded-full px-5 py-1.5 text-sm font-medium transition ${
              tab === 'buddies' ? 'bg-white text-ink shadow-sm' : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            Buddies
          </button>
          <button
            type="button"
            onClick={() => setTab('bills')}
            className={`rounded-full px-5 py-1.5 text-sm font-medium transition ${
              tab === 'bills' ? 'bg-white text-ink shadow-sm' : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            Bills
          </button>
        </div>
      </div>

      <div className="mt-4">
        {tab === 'buddies' ? (
          <BuddiesPanel
            groupId={groupId}
            members={members}
            isCreator={isCreator}
            currentUserId={currentUserId}
            onRemove={onRemove}
          />
        ) : (
          <BillsPanel bills={bills} />
        )}
      </div>
    </div>
  )
}

function BillsPanel({ bills }: { bills: { id: number; merchant_name: string | null; total: number }[] | undefined }) {
  return (
    <div className="flex flex-col gap-2">
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
  )
}

function BuddiesPanel({
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
    <div>
      <div className="flex flex-col gap-2">
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

function PayerSection({
  groupId,
  members,
  payerId,
  payer,
  isCreator,
}: {
  groupId: number
  members: { id: number; name: string }[]
  payerId: number | null
  payer: { name: string; user: { bank_name: string | null; bank_account_number: string | null } | null } | null
  isCreator: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">Payer</h2>
          <p className="mt-1 text-xs text-slate-500">Everyone in this group pays their share to whoever is set here.</p>
        </div>

        {isCreator && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label="Edit payer"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-ink"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-8.5 8.5a1 1 0 0 1-.464.263l-3 .75a.5.5 0 0 1-.606-.606l.75-3a1 1 0 0 1 .263-.464l8.5-8.5a2 2 0 0 1 .229-.271Z" />
            </svg>
          </button>
        )}
      </div>

      {payer ? (
        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
          <p className="text-ink">
            Pay <span className="font-medium">{payer.name}</span>
          </p>
          {payer.user?.bank_name || payer.user?.bank_account_number ? (
            <p className="mt-1 text-xs text-slate-500">
              {payer.user.bank_name} {payer.user.bank_account_number && `— ${payer.user.bank_account_number}`}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">No bank details added yet.</p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          {isCreator ? 'No payer set yet — tap the pencil to choose one.' : 'No payer has been set for this group yet.'}
        </p>
      )}

      {isEditing && (
        <EditPayerModal
          groupId={groupId}
          members={members}
          payerId={payerId}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  )
}

function EditPayerModal({
  groupId,
  members,
  payerId,
  onClose,
}: {
  groupId: number
  members: { id: number; name: string }[]
  payerId: number | null
  onClose: () => void
}) {
  const updateGroup = useUpdateGroup(groupId)
  const [selected, setSelected] = useState<number | ''>(payerId ?? '')

  function handleSave() {
    updateGroup.mutate({ payer_id: selected === '' ? null : selected }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Edit payer</h3>
          <button type="button" onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600">
            Close
          </button>
        </div>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value ? Number(e.target.value) : '')}
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">No payer set</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateGroup.isPending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateGroup.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BalancesSection({
  groupId,
  balances,
  payerId,
  myMemberId,
  payerName,
}: {
  groupId: number
  balances: {
    group_member_id: number
    name: string
    balance: number
    gross_balance: number
    is_payer: boolean
    status: 'pending' | 'paid'
  }[]
  payerId: number | null
  myMemberId: number | undefined
  payerName: string | undefined
}) {
  const { data: settlements } = useSettlements(groupId)
  const createSettlement = useCreateSettlement(groupId)

  function handlePay(b: { group_member_id: number; name: string; balance: number }) {
    if (!payerId) return
    const amount = Math.abs(b.balance)
    const isSelf = b.group_member_id === myMemberId
    const message = isSelf
      ? `Pay ${money(amount)} to ${payerName ?? 'the payer'}?`
      : `Mark ${b.name} as paid ${money(amount)}?`
    if (!confirm(message)) return
    createSettlement.mutate({ paidBy: b.group_member_id, paidTo: payerId, amount })
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-ink">Balances</h2>

      <div className="mt-3 flex flex-col gap-1.5">
        {balances.map((b) => {
          const canMarkPaid =
            !b.is_payer && b.status === 'pending' && payerId && (b.group_member_id === myMemberId || myMemberId === payerId)

          return (
            <div key={b.group_member_id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-sm">
              <Link
                to="/groups/$groupId/members/$memberId"
                params={{ groupId: String(groupId), memberId: String(b.group_member_id) }}
                className="flex flex-1 items-center gap-2 transition hover:text-brand-700"
              >
                <span className="text-slate-700">{b.name}</span>
                {b.is_payer && <CollectorBadge isPayer />}
              </Link>

              {!b.is_payer &&
                (b.status === 'paid' || canMarkPaid ? (
                  <PaidStamp
                    isPaid={b.status === 'paid'}
                    canMark={Boolean(canMarkPaid)}
                    onMarkPaid={() => handlePay(b)}
                    pending={createSettlement.isPending}
                  />
                ) : (
                  <span className="rounded-full bg-error-50 px-2 py-0.5 text-xs font-medium text-error-600">Pending</span>
                ))}

              <span className="text-slate-500">{money(Math.abs(b.gross_balance))}</span>
            </div>
          )
        })}
      </div>

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
