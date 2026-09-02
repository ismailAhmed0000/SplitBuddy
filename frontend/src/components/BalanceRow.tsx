import { Link } from '@tanstack/react-router'
import { MemberAvatar } from './MemberAvatar'
import { money } from '@/lib/format'
import type { GroupBalance } from '@/lib/groups'

export function BalanceRow({
  groupId,
  member,
  canMarkPaid,
  onMarkPaid,
  pending,
}: {
  groupId: number
  member: GroupBalance
  canMarkPaid: boolean
  onMarkPaid: () => void
  pending: boolean
}) {
  const isPaidOff = !member.is_payer && member.status === 'paid'

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <Link
        to="/groups/$groupId/members/$memberId"
        params={{ groupId: String(groupId), memberId: String(member.group_member_id) }}
        className="flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-80"
      >
        <MemberAvatar name={member.name} isCollector={member.is_payer} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="max-w-full truncate text-sm font-semibold text-ink">{member.name}</span>
            {member.is_payer && (
              <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-700 uppercase">
                Collector
              </span>
            )}
          </div>
          <p className="truncate text-sm text-slate-500">{member.is_payer ? 'is owed' : 'owes'}</p>
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        {isPaidOff ? (
          <>
            <span className="text-sm text-slate-400 line-through">{money(member.gross_balance)}</span>
            <span className="-rotate-6 rounded-full border-2 border-brand-500 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-brand-600 uppercase">
              Paid
            </span>
          </>
        ) : (
          <span className={`text-lg font-bold ${member.is_payer ? 'text-brand-700' : 'text-ink'}`}>
            {money(Math.abs(member.balance))}
          </span>
        )}

        {!member.is_payer && !isPaidOff && canMarkPaid && (
          <button
            type="button"
            onClick={onMarkPaid}
            disabled={pending}
            className="rounded-full border border-slate-300 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-500 uppercase transition hover:border-brand-400 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mark paid
          </button>
        )}
      </div>
    </div>
  )
}
