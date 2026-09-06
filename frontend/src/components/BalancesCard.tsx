import { useState } from 'react'
import { BalanceRow } from './BalanceRow'
import { ConfirmDialog } from './ConfirmDialog'
import { GenerateMessageModal } from './GenerateMessageModal'
import { useCreateSettlement, useSettlements } from '@/lib/settlements'
import { money } from '@/lib/format'
import type { TabBalance } from '@/lib/tabs'

export function BalancesCard({
  groupId,
  balances,
  payerId,
  payerName,
  myMemberId,
}: {
  groupId: number
  balances: TabBalance[]
  payerId: number | null
  payerName: string | undefined
  myMemberId: number | undefined
}) {
  const { data: settlements } = useSettlements(groupId)
  const createSettlement = useCreateSettlement(groupId)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [pendingPay, setPendingPay] = useState<TabBalance | null>(null)

  const payIsSelf = pendingPay?.group_member_id === myMemberId
  const payAmount = pendingPay ? Math.abs(pendingPay.balance) : 0

  function confirmPay() {
    if (!pendingPay || !payerId) return
    createSettlement.mutate(
      { paidBy: pendingPay.group_member_id, paidTo: payerId, amount: Math.abs(pendingPay.balance) },
      { onSettled: () => setPendingPay(null) },
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Balances</h2>
        <button
          type="button"
          onClick={() => setIsMessageModalOpen(true)}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-400 hover:text-brand-700"
        >
          Generate message
        </button>
      </div>

      <div className="mt-2">
        {balances.map((member) => {
          // Anyone who still owes gets a Pay button — the collector never does.
          const canPay = !member.is_payer && member.status === 'pending' && Boolean(payerId)

          return (
            <BalanceRow
              key={member.group_member_id}
              tabId={groupId}
              member={member}
              isSelf={member.group_member_id === myMemberId}
              canPay={canPay}
              onPay={() => setPendingPay(member)}
              pending={createSettlement.isPending}
            />
          )
        })}
      </div>

      {settlements && settlements.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Recent settlements</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {settlements.slice(0, 5).map((s) => (
              <p key={s.id} className="text-sm text-ink">
                {s.payer?.name ?? 'Someone'} paid {s.payee?.name ?? 'someone'} {money(s.amount)}
              </p>
            ))}
          </div>
        </div>
      )}

      {isMessageModalOpen && (
        <GenerateMessageModal
          groupId={groupId}
          members={balances.map((b) => ({ id: b.group_member_id, name: b.name }))}
          onClose={() => setIsMessageModalOpen(false)}
        />
      )}

      {pendingPay && (
        <ConfirmDialog
          title={payIsSelf ? 'Settle up' : `Mark ${pendingPay.name} as paid`}
          message={
            payIsSelf ? (
              <>
                Record that you paid <span className="font-semibold text-ink">{money(payAmount)}</span> to{' '}
                {payerName ?? 'the collector'}?
              </>
            ) : (
              <>
                Record that <span className="font-semibold text-ink">{pendingPay.name}</span> paid{' '}
                <span className="font-semibold text-ink">{money(payAmount)}</span> to {payerName ?? 'the collector'}?
              </>
            )
          }
          confirmLabel={payIsSelf ? 'I paid' : 'Mark paid'}
          isPending={createSettlement.isPending}
          onConfirm={confirmPay}
          onCancel={() => setPendingPay(null)}
        />
      )}
    </div>
  )
}
