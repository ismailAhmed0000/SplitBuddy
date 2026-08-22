import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/HomeStack';
import type { BillsStackParamList } from '../navigation/BillsStack';
import {
  useAddGroupMemberMutation,
  useConfirmBillMutation,
  useGetBillQuery,
  useGetGroupQuery,
  useRetryExtractionMutation,
} from '../store/api/apiSlice';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { Pill, StatusBadge } from '../components/Badge';
import { CloseIcon, WarningIcon } from '../components/icons';
import { ItemAssignmentRow } from '../components/ItemAssignmentRow';
import { money } from '../utils/format';

type Props =
  | NativeStackScreenProps<HomeStackParamList, 'BillDetail'>
  | NativeStackScreenProps<BillsStackParamList, 'BillDetail'>;

export default function BillDetailScreen({ route, navigation }: Props) {
  const { billId } = route.params;

  const [pollingInterval, setPollingInterval] = useState(2000);
  const { data: bill, isLoading } = useGetBillQuery(billId, { pollingInterval });
  const { data: group } = useGetGroupQuery(bill?.group_id ?? 0, { skip: !bill });
  const [retryExtraction, { isLoading: isRetrying }] = useRetryExtractionMutation();
  const [confirmBill, { isLoading: isConfirming }] = useConfirmBillMutation();
  const [addMember, { isLoading: isAddingMember }] = useAddGroupMemberMutation();

  const [newMemberName, setNewMemberName] = useState('');
  const [isImageOpen, setIsImageOpen] = useState(false);

  useEffect(() => {
    if (bill && bill.status !== 'processing') setPollingInterval(0);
  }, [bill]);

  function handleAddMember() {
    if (!newMemberName.trim() || !bill) return;
    addMember({ groupId: bill.group_id, name: newMemberName.trim() });
    setNewMemberName('');
  }

  if (isLoading || !bill) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6 pt-16">
        <Text className="text-sm text-gray-500">Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-6" contentContainerClassName="pt-16 pb-28">
      <ScreenHeader
        onBack={() => navigation.goBack()}
        title={bill.merchant_name ?? 'Receipt'}
        subtitle={bill.bill_date ?? undefined}
        right={<StatusBadge status={bill.status} />}
      />

      {bill.image_url && (
        <TouchableOpacity onPress={() => setIsImageOpen(true)} className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
          <Image source={{ uri: bill.image_url }} className="h-56 w-full" resizeMode="contain" />
          <View className="border-t border-gray-200 bg-white py-2">
            <Text className="text-center text-xs font-medium text-gray-500">Tap to view full size</Text>
          </View>
        </TouchableOpacity>
      )}

      {bill.status === 'processing' && (
        <View className="mt-6 items-center gap-3 rounded-2xl border border-gray-200 bg-white p-10">
          <ActivityIndicator size="large" color="#0D9488" />
          <Text className="text-sm font-medium text-gray-700">Reading your receipt…</Text>
          <Text className="text-sm text-gray-500">This usually takes a few seconds.</Text>
        </View>
      )}

      {bill.status === 'failed' && (
        <View className="mt-6 items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-10">
          <WarningIcon />
          <Text className="text-center text-sm font-medium text-red-600">We couldn't read this receipt.</Text>
          <Text className="text-center text-sm text-red-500">Try a clearer photo, or retry with the same image.</Text>
          <Button label="Retry extraction" onPress={() => retryExtraction(bill.id)} loading={isRetrying} className="mt-2 bg-red-500" />
        </View>
      )}

      {(bill.status === 'parsed' || bill.status === 'confirmed') && (
        <>
          <Card className="mt-6">
            <View className="flex-row flex-wrap gap-y-3">
              <SummaryField label="Subtotal" value={money(bill.subtotal)} />
              <SummaryField label={bill.tax_label ?? 'Tax'} value={money(bill.tax_amount)} />
              <SummaryField label="Discount" value={bill.discount_amount ? `-${money(bill.discount_amount)}` : money(0)} />
              <SummaryField label="Service" value={money(bill.service_charge)} />
              <SummaryField label="Tip" value={money(bill.tip_amount)} />
              <SummaryField label="Total" value={money(bill.total)} emphasize />
            </View>
            <Text className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
              Tax, discount, service, and tip are already folded into each item's price below — splitting an item splits its
              full share of all of these too.
            </Text>
          </Card>

          {bill.status === 'parsed' && (
            <View className="mt-6 flex-row items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <Text className="flex-1 text-sm text-amber-800">
                Assign items below, then confirm so this bill counts toward balances.
              </Text>
              <Button label={isConfirming ? 'Confirming…' : 'Confirm'} onPress={() => confirmBill(bill.id)} loading={isConfirming} className="bg-amber-500 px-4 py-2.5" />
            </View>
          )}

          <Card className="mt-6">
            <Text className="text-sm font-semibold text-gray-900">Buddies</Text>
            <View className="mt-3 flex-row flex-wrap items-center gap-2">
              {group?.members.map((member) => (
                <Pill key={member.id} label={member.name} />
              ))}
            </View>
            <View className="mt-3 flex-row gap-2">
              <View className="flex-1">
                <TextField
                  value={newMemberName}
                  onChangeText={setNewMemberName}
                  placeholder="Add a buddy not on the app"
                  onSubmitEditing={handleAddMember}
                />
              </View>
              <Button label="Add" onPress={handleAddMember} loading={isAddingMember} disabled={!newMemberName.trim()} className="px-5" />
            </View>
          </Card>

          <View className="mt-6 gap-3">
            <Text className="text-sm font-semibold text-gray-900">Items — tap a buddy to split</Text>
            {bill.items.map((item) => (
              <ItemAssignmentRow key={item.id} billId={bill.id} item={item} members={group?.members ?? []} />
            ))}
          </View>
        </>
      )}

      <Modal visible={isImageOpen} transparent animationType="fade" onRequestClose={() => setIsImageOpen(false)}>
        <View className="flex-1 items-center justify-center bg-black/90 p-4">
          {bill.image_url && <Image source={{ uri: bill.image_url }} className="h-full w-full" resizeMode="contain" />}
          <TouchableOpacity
            onPress={() => setIsImageOpen(false)}
            accessibilityLabel="Close"
            className="absolute right-5 top-14 h-9 w-9 items-center justify-center rounded-full bg-white/10"
          >
            <CloseIcon color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

function SummaryField({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <View className="w-1/2">
      <Text className="text-xs text-gray-500">{label}</Text>
      <Text className={emphasize ? 'font-semibold text-gray-900' : 'text-gray-700'}>{value}</Text>
    </View>
  );
}
