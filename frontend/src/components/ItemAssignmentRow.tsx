import type { BillItem } from '@/lib/bills'
import { useCreateAssignment, useDeleteAssignment } from '@/lib/bills'
import type { GroupMember } from '@/lib/groups'
import { money } from '@/lib/format'

export function ItemAssignmentRow({
  billId,
  item,
  members,
}: {
  billId: number
  item: BillItem
  members: GroupMember[]
}) {
  const createAssignment = useCreateAssignment(billId)
  const deleteAssignment = useDeleteAssignment(billId)

  const assignedCount = item.assignments.length
  const loadedPrice = Number(item.final_price)
  const hasLoadedCharges = Math.abs(loadedPrice - Number(item.total_price)) >= 0.005
  const share = assignedCount > 0 ? loadedPrice / assignedCount : 0

  function toggle(member: GroupMember, checked: boolean) {
    if (checked) {
      createAssignment.mutate({ itemId: item.id, groupMemberId: member.id })
    } else {
      const assignment = item.assignments.find((a) => a.group_member_id === member.id)
      if (assignment) deleteAssignment.mutate(assignment.id)
    }
  }

  const isPending = createAssignment.isPending || deleteAssignment.isPending

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink">{item.name}</p>
          <p className="text-xs text-slate-500">
            {item.quantity} × {money(item.unit_price)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-ink">{money(loadedPrice)}</p>
          {hasLoadedCharges && (
            <p className="text-xs text-slate-400 line-through">{money(item.total_price)}</p>
          )}
          {assignedCount > 0 && (
            <p className="text-xs text-slate-500">{money(share)} / person</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {members.map((member) => {
          const checked = item.assignments.some((a) => a.group_member_id === member.id)
          return (
            <label
              key={member.id}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                checked
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              } ${isPending ? 'opacity-60' : ''}`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={isPending}
                onChange={(e) => toggle(member, e.target.checked)}
                className="sr-only"
              />
              {member.name}
            </label>
          )
        })}
      </div>
    </div>
  )
}
