import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BillsStackParamList } from '../navigation/BillsStack';
import { useDeleteBillMutation, useGetBillsQuery, useGetGroupsQuery } from '../store/api/apiSlice';
import { StatusBadge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { ReceiptEmptyIcon, TrashIcon } from '../components/icons';
import { money } from '../utils/format';
import type { Bill } from '../types/models';

type Props = NativeStackScreenProps<BillsStackParamList, 'BillsList'>;

export default function BillsScreen({ navigation }: Props) {
  const { data: bills, isLoading } = useGetBillsQuery();
  const { data: groups } = useGetGroupsQuery();
  const [deleteBill] = useDeleteBillMutation();

  const groupNames = new Map(groups?.map((g) => [g.id, g.name]));

  function handleDelete(bill: Bill) {
    Alert.alert('Delete this bill?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBill(bill.id) },
    ]);
  }

  return (
    <View className="flex-1 bg-white px-6 pt-24">
      <Text className="text-2xl font-semibold text-gray-900">Bills</Text>
      <Text className="mt-1 text-sm text-gray-500">Every receipt you've uploaded, across all your groups.</Text>

      <FlatList
        className="mt-6"
        data={bills}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ gap: 16, paddingBottom: 112 }}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon={<ReceiptEmptyIcon />}
              title="No bills yet"
              description="Upload one from the Home tab to get started."
            />
          ) : undefined
        }
        renderItem={({ item }) => (
          <BillRow
            bill={item}
            groupName={groupNames.get(item.group_id)}
            onPress={() => navigation.navigate('BillDetail', { billId: item.id })}
            onDelete={() => handleDelete(item)}
          />
        )}
      />
    </View>
  );
}

function BillRow({
  bill,
  groupName,
  onPress,
  onDelete,
}: {
  bill: Bill;
  groupName: string | undefined;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-5">
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
          {bill.merchant_name ?? 'Receipt'}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
          {groupName ?? 'Unknown group'}
          {bill.bill_date ? ` · ${bill.bill_date}` : ''}
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        <Text className="text-sm font-semibold text-gray-900">{money(bill.total)}</Text>
        <StatusBadge status={bill.status} />
        <TouchableOpacity onPress={onDelete} accessibilityLabel="Delete bill" className="p-1">
          <TrashIcon size={16} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
