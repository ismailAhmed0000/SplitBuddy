import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { CollectorBadge } from '@/components/CollectorBadge'
import { ItemAssignmentRow } from '@/components/ItemAssignmentRow'
import { money } from '@/lib/format'
import { parseApiError } from '@/lib/api'
import { useCurrentUser } from '@/lib/auth'
import { useAddBillParticipant, useBill, useConfirmBill, useRemoveBillParticipant, useRetryExtraction } from '@/lib/bills'
import { useBuddies } from '@/lib/buddies'
import { useAddGroupMember, useGroup, useRemoveGroupMember, useUpdateGroup } from '@/lib/groups'

export const Route = createFileRoute('/_authenticated/bills/$billId')({
  component: BillReviewPage,
})

function BillReviewPage() {
  const { billId } = Route.useParams()
  const id = Number(billId)

  const { data: bill, isLoading } = useBill(id)
  const { data: group } = useGroup(bill?.group_id)
  const { data: buddies } = useBuddies()
  const { data: currentUser } = useCurrentUser()
  const retryExtraction = useRetryExtraction(id)
  const confirmBill = useConfirmBill(id)
  const addMember = useAddGroupMember(bill?.group_id)
  const addParticipant = useAddBillParticipant(bill?.id)
  const removeParticipant = useRemoveBillParticipant(bill?.id)
  const removeGroupMember = useRemoveGroupMember(bill?.group_id ?? 0)
  const updateGroup = useUpdateGroup(bill?.group_id ?? 0)

  const isGroupCreator = group?.created_by === currentUser?.id

  const [newMemberName, setNewMemberName] = useState('')
  const [buddyError, setBuddyError] = useState<string | null>(null)

  function handleAddMember() {
    if (!newMemberName.trim()) return
    setBuddyError(null)
    addMember.mutate(
      { name: newMemberName.trim() },
      {
        onSuccess: (member) => {
          setNewMemberName('')
          addParticipant.mutate(member.id, { onError: (err) => setBuddyError(parseApiError(err).message) })
        },
        onError: (err) => setBuddyError(parseApiError(err).message),
      }
    )
  }

  function handleAddParticipant(memberId: number) {
    setBuddyError(null)
    addParticipant.mutate(memberId, { onError: (err) => setBuddyError(parseApiError(err).message) })
  }

  function handleAddRegisteredBuddy(buddyUserId: number, name: string) {
    setBuddyError(null)
    addMember.mutate(
      { name, userId: buddyUserId },
      {
        onSuccess: (member) => {
          addParticipant.mutate(member.id, { onError: (err) => setBuddyError(parseApiError(err).message) })
        },
        onError: (err) => setBuddyError(parseApiError(err).message),
      }
    )
  }

  function handleRemoveParticipant(memberId: number) {
    setBuddyError(null)
    removeParticipant.mutate(memberId, { onError: (err) => setBuddyError(parseApiError(err).message) })
  }

  function handleRemoveFromGroup(memberId: number, memberName: string) {
    if (!confirm(`Remove ${memberName} from this group? This removes them from every bill in this group.`)) return
    setBuddyError(null)
    removeGroupMember.mutate(memberId, { onError: (err) => setBuddyError(parseApiError(err).message) })
  }

  function handleSetPayer(memberId: number) {
    updateGroup.mutate({ payer_id: memberId })
  }

  const participantIds = new Set(bill?.participants.map((p) => p.id))
  const availableMembers = group?.members.filter((m) => !participantIds.has(m.id)) ?? []

  const groupMemberUserIds = new Set(group?.members.map((m) => m.user_id).filter((uid): uid is number => uid !== null))
  const availableBuddies = buddies?.filter((b) => !groupMemberUserIds.has(b.user.id)) ?? []

  if (isLoading || !bill) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-slate-500">Loading…</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← Back to dashboard
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            {bill.merchant_name ?? 'Receipt'}
          </h1>
          {bill.bill_date && <p className="mt-1 text-sm text-slate-500">{bill.bill_date}</p>}
        </div>
        <StatusBadge status={bill.status} />
      </div>

      {bill.image_url && <ReceiptImage url={bill.image_url} />}

      {bill.status === 'processing' && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          <p className="text-sm font-medium text-slate-700">Reading your receipt…</p>
          <p className="text-sm text-slate-500">This usually takes a few seconds.</p>
        </div>
      )}

      {bill.status === 'failed' && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-error-200 bg-error-50 p-10 text-center">
          <p className="text-sm font-medium text-error-700">We couldn't read this receipt.</p>
          <p className="text-sm text-error-600">Try a clearer photo, or retry with the same image.</p>
          <button
            type="button"
            onClick={() => retryExtraction.mutate()}
            disabled={retryExtraction.isPending}
            className="mt-2 rounded-lg bg-error-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-error-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {retryExtraction.isPending ? 'Retrying…' : 'Retry extraction'}
          </button>
        </div>
      )}

      {(bill.status === 'parsed' || bill.status === 'confirmed') && (
        <>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <dl className="grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-4">
              <SummaryField label="Subtotal" value={money(bill.subtotal)} />
              <SummaryField label={bill.tax_label ?? 'Tax'} value={money(bill.tax_amount)} />
              <SummaryField label="Discount" value={bill.discount_amount ? `-${money(bill.discount_amount)}` : money(0)} />
              <SummaryField label="Service" value={money(bill.service_charge)} />
              <SummaryField label="Tip" value={money(bill.tip_amount)} />
              <SummaryField label="Total" value={money(bill.total)} emphasize />
            </dl>
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
              Tax, discount, service, and tip are already folded into each item's price below —
              splitting an item splits its full share of all of these too.
            </p>
          </div>

          {bill.status === 'parsed' && (
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                Assign items below, then confirm so this bill counts toward balances.
              </p>
              <button
                type="button"
                onClick={() => confirmBill.mutate()}
                disabled={confirmBill.isPending}
                className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {confirmBill.isPending ? 'Confirming…' : 'Confirm bill'}
              </button>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Buddies</h2>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {bill.participants.length === 0 && (
                <p className="text-xs text-slate-500">Add who's splitting this bill.</p>
              )}
              {bill.participants.map((member) => (
                <span
                  key={member.id}
                  className="flex items-center gap-1.5 rounded-full bg-brand-100 py-1 pl-3 pr-1.5 text-xs font-medium text-brand-700"
                >
                  {member.name}
                  <CollectorBadge
                    isPayer={group?.payer_id === member.id}
                    canSet={isGroupCreator}
                    onSetPayer={() => handleSetPayer(member.id)}
                    pending={updateGroup.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(member.id)}
                    disabled={removeParticipant.isPending}
                    aria-label={`Remove ${member.name} from this bill`}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-brand-700 transition hover:bg-brand-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {availableBuddies.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">Your buddies:</span>
                {availableBuddies.map((buddy) => (
                  <button
                    key={buddy.id}
                    type="button"
                    onClick={() => handleAddRegisteredBuddy(buddy.user.id, buddy.user.name)}
                    disabled={addMember.isPending || addParticipant.isPending}
                    className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    + {buddy.user.name}
                  </button>
                ))}
              </div>
            )}

            {availableMembers.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">From this group:</span>
                {availableMembers.map((member) => (
                  <span
                    key={member.id}
                    className="flex items-center gap-1 rounded-full border border-dashed border-slate-300 py-1 pl-1 pr-1.5 text-xs font-medium text-slate-600"
                  >
                    <button
                      type="button"
                      onClick={() => handleAddParticipant(member.id)}
                      disabled={addParticipant.isPending}
                      className="rounded-full px-2 py-0.5 transition hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      + {member.name}
                    </button>
                    {isGroupCreator && member.user_id !== currentUser?.id && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFromGroup(member.id, member.name)}
                        disabled={removeGroupMember.isPending}
                        aria-label={`Remove ${member.name} from this group`}
                        className="flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition hover:bg-error-100 hover:text-error-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                placeholder="Add a buddy not on the app"
                className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs outline-none placeholder:text-slate-400 focus:border-brand-500"
              />
              <button
                type="button"
                onClick={handleAddMember}
                disabled={addMember.isPending || !newMemberName.trim()}
                className="rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add
              </button>
            </div>
            {buddyError && <p className="mt-2 text-xs text-error-600">{buddyError}</p>}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-ink">Items — tap a buddy to split</h2>
            {bill.items.map((item) => (
              <ItemAssignmentRow key={item.id} billId={bill.id} item={item} members={bill.participants} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}

function ReceiptImage({ url }: { url: string }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-6 block w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
      >
        <img src={url} alt="Uploaded receipt" className="mx-auto max-h-72 w-full object-contain" />
        <span className="block border-t border-slate-200 bg-white px-4 py-2 text-center text-xs font-medium text-slate-500">
          Tap to view full size
        </span>
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <img src={url} alt="Uploaded receipt, full size" className="max-h-full max-w-full rounded-lg object-contain" />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}

function SummaryField({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={emphasize ? 'font-semibold text-ink' : 'text-slate-700'}>{value}</dd>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    processing: 'bg-amber-100 text-amber-700',
    parsed: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-brand-100 text-brand-700',
    failed: 'bg-error-100 text-error-700',
  }

  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  )
}
