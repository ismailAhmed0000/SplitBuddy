import { Text, TouchableOpacity, View } from 'react-native';
import { useCreateAssignmentMutation, useDeleteAssignmentMutation } from '../store/api/apiSlice';
import { money } from '../utils/format';
import type { BillItem, GroupMember } from '../types/models';

export function ItemAssignmentRow({
  billId,
  item,
  members,
}: {
  billId: number;
  item: BillItem;
  members: GroupMember[];
}) {
  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
  const [deleteAssignment, { isLoading: isDeleting }] = useDeleteAssignmentMutation();

  const assignedCount = item.assignments.length;
  const loadedPrice = Number(item.final_price);
  const hasLoadedCharges = Math.abs(loadedPrice - Number(item.total_price)) >= 0.005;
  const share = assignedCount > 0 ? loadedPrice / assignedCount : 0;
  const isPending = isCreating || isDeleting;

  function toggle(member: GroupMember, checked: boolean) {
    if (checked) {
      createAssignment({ billId, itemId: item.id, groupMemberId: member.id });
    } else {
      const assignment = item.assignments.find((a) => a.group_member_id === member.id);
      if (assignment) deleteAssignment({ billId, assignmentId: assignment.id });
    }
  }

  return (
    <View className="rounded-xl border border-gray-200 p-4">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-900">{item.name}</Text>
          <Text className="text-xs text-gray-500">
            {item.quantity} × {money(item.unit_price)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-sm font-semibold text-gray-900">{money(loadedPrice)}</Text>
          {hasLoadedCharges && <Text className="text-xs text-gray-400 line-through">{money(item.total_price)}</Text>}
          {assignedCount > 0 && <Text className="text-xs text-gray-500">{money(share)} / person</Text>}
        </View>
      </View>

      <View className="mt-3 flex-row flex-wrap gap-2">
        {members.map((member) => {
          const checked = item.assignments.some((a) => a.group_member_id === member.id);
          return (
            <TouchableOpacity
              key={member.id}
              onPress={() => toggle(member, !checked)}
              disabled={isPending}
              className={`rounded-full border px-3 py-1.5 ${checked ? 'border-teal-500 bg-teal-50' : 'border-gray-300'} ${isPending ? 'opacity-60' : ''}`}
            >
              <Text className={`text-xs font-medium ${checked ? 'text-teal-700' : 'text-gray-600'}`}>{member.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
