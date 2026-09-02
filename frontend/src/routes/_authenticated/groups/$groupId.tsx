import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { GroupHeader } from '@/components/GroupHeader'
import { BalancesCard } from '@/components/BalancesCard'
import { GroupBillsCard } from '@/components/GroupBillsCard'
import { MembersCard } from '@/components/MembersCard'
import { PayerCard } from '@/components/PayerCard'
import { useCurrentUser } from '@/lib/auth'
import { useDeleteGroup, useGroup, useGroupBalances, useRemoveGroupMember, useUpdateGroup } from '@/lib/groups'
import { useBills } from '@/lib/bills'

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
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-sm text-slate-500">Loading…</p>
      </main>
    )
  }

  const myMemberId = group.members.find((m) => m.user_id === currentUser?.id)?.id

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/groups" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to groups
      </Link>

      <div className="mt-4">
        <GroupHeader
          name={group.name}
          isCreator={isCreator}
          onRename={(name) => updateGroup.mutate({ name })}
          onDelete={handleDeleteGroup}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <BalancesCard
            groupId={id}
            balances={balances ?? []}
            payerId={group.payer_id}
            payerName={group.payer?.name}
            myMemberId={myMemberId}
          />
          <GroupBillsCard bills={bills} />
        </div>

        <div className="flex flex-col gap-6">
          <MembersCard
            groupId={id}
            members={group.members}
            payerId={group.payer_id}
            isCreator={isCreator}
            currentUserId={currentUser?.id}
            onRemove={handleRemoveMember}
          />
          <PayerCard groupId={id} members={group.members} payerId={group.payer_id} payer={group.payer} isCreator={isCreator} />
        </div>
      </div>
    </main>
  )
}
