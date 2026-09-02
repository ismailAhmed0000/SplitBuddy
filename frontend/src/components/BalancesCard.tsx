import { useState } from 'react'
import { BalanceRow } from './BalanceRow'
import { GenerateMessageModal } from './GenerateMessageModal'
import { useCreateSettlement, useSettlements } from '@/lib/settlements'
import { money } from '@/lib/format'
import type { GroupBalance } from '@/lib/groups'

export function BalancesCard({
  groupId,
  balances,
  payerId,
  payerName,
  myMemberId,
}: {
  groupId: number
  balances: GroupBalance[]
  payerId: number | null
  payerName: string | undefined
  myMemberId: number | undefined
}) {
  const { data: settlements } = useSettlements(groupId)
  const createSettlement = useCreateSettlement(groupId)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)

  const myBalance = balances.find((b) => b.group_member_id === myMemberId)
  const canSettleUp = Boolean(payerId) && myBalance && !myBalance.is_payer && myBalance.status === 'pending'

  function handlePay(member: GroupBalance) {
    if (!payerId) return
    const amount = Math.abs(member.balance)
    const isSelf = member.group_member_id === myMemberId
    const message = isSelf
      ? `Pay ${money(amount)} to ${payerName ?? 'the payer'}?`
      : `Mark ${member.name} as paid ${money(amount)}?`
    if (!confirm(message)) return
    createSettlement.mutate({ paidBy: member.group_member_id, paidTo: payerId, amount })
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
          const canMarkPaid =
            !member.is_payer &&
            member.status === 'pending' &&
            payerId &&
            (member.group_member_id === myMemberId || myMemberId === payerId)

          return (
            <BalanceRow
              key={member.group_member_id}
              groupId={groupId}
              member={member}
              canMarkPaid={Boolean(canMarkPaid)}
              onMarkPaid={() => handlePay(member)}
              pending={createSettlement.isPending}
            />
          )
        })}
      </div>

      {canSettleUp && myBalance && (
        <button
          type="button"
          onClick={() => handlePay(myBalance)}
          disabled={createSettlement.isPending}
          className="mt-4 w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createSettlement.isPending ? 'Settling up…' : 'Settle up'}
        </button>
      )}

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
    </div>
  )
}
