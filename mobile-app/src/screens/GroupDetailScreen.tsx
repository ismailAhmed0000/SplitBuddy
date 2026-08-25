import { useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/HomeStack';
import {
  useAddGroupMemberMutation,
  useCreateSettlementMutation,
  useDeleteGroupMutation,
  useGetBillsQuery,
  useGetBuddiesQuery,
  useGetCurrentUserQuery,
  useGetGroupBalancesQuery,
  useGetGroupQuery,
  useGetSettlementsQuery,
  useRemoveGroupMemberMutation,
  useSearchUsersQuery,
  useUpdateGroupMutation,
} from '../store/api/apiSlice';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { SelectField } from '../components/SelectField';
import { Avatar } from '../components/Avatar';
import { CollectorBadge } from '../components/CollectorBadge';
import { PaidStamp } from '../components/PaidStamp';
import { EditIcon } from '../components/icons';
import { money } from '../utils/format';
import type { Bill, GroupBalance, GroupMember } from '../types/models';

type Props = NativeStackScreenProps<HomeStackParamList, 'GroupDetail'>;

export default function GroupDetailScreen({ route, navigation }: Props) {
  const { groupId } = route.params;

  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: group, isLoading } = useGetGroupQuery(groupId);
  const { data: balances } = useGetGroupBalancesQuery(groupId);
  const { data: bills } = useGetBillsQuery(groupId);
  const [updateGroup] = useUpdateGroupMutation();
  const [deleteGroup] = useDeleteGroupMutation();
  const [removeMember] = useRemoveGroupMemberMutation();

  const isCreator = group?.created_by === currentUser?.id;

  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState('');

  function startEditingName() {
    setName(group?.name ?? '');
    setIsEditingName(true);
  }

  function saveName() {
    if (name.trim() && name.trim() !== group?.name) {
      updateGroup({ groupId, name: name.trim() });
    }
    setIsEditingName(false);
  }

  function handleDeleteGroup() {
    Alert.alert('Delete group?', `Delete "${group?.name}"? This removes all its bills and settlements.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteGroup(groupId).unwrap();
          navigation.goBack();
        },
      },
    ]);
  }

  function handleRemoveMember(member: GroupMember) {
    Alert.alert('Remove buddy?', `Remove ${member.name} from this group?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMember({ groupId, memberId: member.id }) },
    ]);
  }

  if (isLoading || !group) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6 pt-16">
        <Text className="text-sm text-gray-500">Loading…</Text>
      </View>
    );
  }

  const myMemberId = group.members.find((m) => m.user_id === currentUser?.id)?.id;

  return (
    <ScrollView className="flex-1 bg-white px-6" contentContainerClassName="pt-16 pb-28">
      <ScreenHeader
        onBack={() => navigation.goBack()}
        title={group.name}
        right={
          isCreator && (
            <TouchableOpacity
              onPress={isEditingName ? saveName : startEditingName}
              className="mt-1 h-8 w-8 items-center justify-center rounded-full bg-gray-50"
            >
              <EditIcon size={15} />
            </TouchableOpacity>
          )
        }
      />

      {isEditingName && (
        <TextInput
          autoFocus
          value={name}
          onChangeText={setName}
          onBlur={saveName}
          onSubmitEditing={saveName}
          className="mt-2 rounded-xl border border-teal-300 px-3.5 py-2.5 text-base text-gray-900"
        />
      )}

      <BuddiesAndBillsSection
        groupId={groupId}
        members={group.members}
        isCreator={isCreator}
        onRemove={handleRemoveMember}
        bills={bills}
        onPressBill={(billId) => navigation.navigate('BillDetail', { billId })}
      />

      <PayerSection groupId={groupId} members={group.members} payerId={group.payer_id} payer={group.payer} isCreator={isCreator} />

      <BalancesSection
        groupId={groupId}
        balances={balances ?? []}
        payerId={group.payer_id}
        myMemberId={myMemberId}
        payerName={group.payer?.name}
      />

      {isCreator && (
        <TouchableOpacity onPress={handleDeleteGroup} className="mt-6 items-center rounded-xl border border-red-200 bg-red-50 py-3">
          <Text className="text-sm font-medium text-red-500">Delete group</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function BuddiesAndBillsSection({
  groupId,
  members,
  isCreator,
  onRemove,
  bills,
  onPressBill,
}: {
  groupId: number;
  members: GroupMember[];
  isCreator: boolean;
  onRemove: (member: GroupMember) => void;
  bills: Bill[] | undefined;
  onPressBill: (billId: number) => void;
}) {
  const [tab, setTab] = useState<'buddies' | 'bills'>('buddies');

  return (
    <Card className="mt-6">
      <View className="flex-row justify-center">
        <View className="flex-row rounded-full bg-gray-100 p-1">
          <TouchableOpacity
            onPress={() => setTab('buddies')}
            style={tab === 'buddies' ? { shadowColor: '#111827', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 } : undefined}
            className={`rounded-full px-5 py-1.5 ${tab === 'buddies' ? 'bg-white' : ''}`}
          >
            <Text className={`text-sm font-medium ${tab === 'buddies' ? 'text-gray-900' : 'text-gray-400'}`}>Buddies</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab('bills')}
            style={tab === 'bills' ? { shadowColor: '#111827', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 } : undefined}
            className={`rounded-full px-5 py-1.5 ${tab === 'bills' ? 'bg-white' : ''}`}
          >
            <Text className={`text-sm font-medium ${tab === 'bills' ? 'text-gray-900' : 'text-gray-400'}`}>Bills</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-4">
        {tab === 'buddies' ? (
          <BuddiesPanel groupId={groupId} members={members} isCreator={isCreator} onRemove={onRemove} />
        ) : (
          <BillsPanel bills={bills} onPressBill={onPressBill} />
        )}
      </View>
    </Card>
  );
}

function BillsPanel({ bills, onPressBill }: { bills: Bill[] | undefined; onPressBill: (billId: number) => void }) {
  return (
    <View className="gap-2">
      {bills?.length === 0 && <Text className="text-sm text-gray-500">No bills in this group yet.</Text>}
      {bills?.map((bill) => (
        <TouchableOpacity
          key={bill.id}
          onPress={() => onPressBill(bill.id)}
          className="flex-row items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5"
        >
          <Text className="flex-1 text-sm text-gray-900" numberOfLines={1}>
            {bill.merchant_name ?? 'Receipt'}
          </Text>
          <Text className="text-sm font-medium text-gray-700">{money(bill.total)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function BuddiesPanel({
  groupId,
  members,
  isCreator,
  onRemove,
}: {
  groupId: number;
  members: GroupMember[];
  isCreator: boolean;
  onRemove: (member: GroupMember) => void;
}) {
  const [addMember, { isLoading: isAdding }] = useAddGroupMemberMutation();
  const { data: myBuddies } = useGetBuddiesQuery();
  const [query, setQuery] = useState('');
  const { data: searchResults } = useSearchUsersQuery(query.trim(), { skip: query.trim().length < 2 });

  const existingUserIds = useMemo(() => new Set(members.map((m) => m.user_id).filter(Boolean)), [members]);

  const matchingBuddies = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (myBuddies ?? [])
      .filter((b) => !existingUserIds.has(b.buddy_user_id))
      .filter((b) => !term || b.user.name.toLowerCase().includes(term) || b.user.username.toLowerCase().includes(term));
  }, [myBuddies, existingUserIds, query]);

  const otherResults = useMemo(
    () => (searchResults ?? []).filter((u) => !existingUserIds.has(u.id) && !matchingBuddies.some((b) => b.buddy_user_id === u.id)),
    [searchResults, existingUserIds, matchingBuddies],
  );

  function addByUser(id: number, memberName: string) {
    addMember({ groupId, name: memberName, userId: id });
    setQuery('');
  }

  function addByName(memberName: string) {
    addMember({ groupId, name: memberName });
    setQuery('');
  }

  return (
    <View>
      <View className="gap-2">
        {members.map((member) => (
          <View key={member.id} className="flex-row items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
            <View className="flex-row items-center gap-2">
              <Avatar name={member.name} size={28} />
              <Text className="text-sm text-gray-800">{member.name}</Text>
            </View>
            {isCreator && (
              <TouchableOpacity onPress={() => onRemove(member)} accessibilityLabel={`Remove ${member.name}`}>
                <Text className="text-xs font-medium text-gray-400">Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <TextField
        className="mt-4"
        value={query}
        onChangeText={setQuery}
        placeholder="Search your buddies, or type a name to add"
        accessibilityLabel="Search buddies to add"
      />

      {query.trim().length > 0 && (
        <View className="mt-2 rounded-xl border border-gray-100 bg-white py-1">
          {matchingBuddies.length > 0 && (
            <>
              <Text className="px-3 pt-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">Your buddies</Text>
              {matchingBuddies.map((b) => (
                <TouchableOpacity key={b.buddy_user_id} onPress={() => addByUser(b.buddy_user_id, b.user.name)} className="px-3 py-2">
                  <Text className="text-sm font-medium text-gray-900">{b.user.name}</Text>
                  <Text className="text-xs text-gray-500">@{b.user.username}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {otherResults.length > 0 && (
            <>
              <Text className="px-3 pt-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">Other users</Text>
              {otherResults.map((u) => (
                <TouchableOpacity key={u.id} onPress={() => addByUser(u.id, u.name)} className="px-3 py-2">
                  <Text className="text-sm font-medium text-gray-900">{u.name}</Text>
                  <Text className="text-xs text-gray-500">{u.email}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          <TouchableOpacity
            onPress={() => addByName(query.trim())}
            disabled={isAdding}
            className="border-t border-gray-100 px-3 py-2.5"
          >
            <Text className="text-sm text-teal-700">+ Add "{query.trim()}" as a new buddy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function PayerSection({
  groupId,
  members,
  payerId,
  payer,
  isCreator,
}: {
  groupId: number;
  members: GroupMember[];
  payerId: number | null;
  payer: GroupMember | null;
  isCreator: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card className="mt-6">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900">Payer</Text>
          <Text className="mt-1 text-xs text-gray-500">Everyone in this group pays their share to whoever is set here.</Text>
        </View>

        {isCreator && (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            accessibilityLabel="Edit payer"
            className="h-8 w-8 items-center justify-center rounded-full bg-gray-50"
          >
            <EditIcon size={15} />
          </TouchableOpacity>
        )}
      </View>

      {payer ? (
        <View className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
          <Text className="text-sm text-gray-900">
            Pay <Text className="font-medium">{payer.name}</Text>
          </Text>
          {payer.user?.bank_name || payer.user?.bank_account_number ? (
            <Text className="mt-1 text-xs text-gray-500">
              {payer.user.bank_name} {payer.user.bank_account_number ? `— ${payer.user.bank_account_number}` : ''}
            </Text>
          ) : (
            <Text className="mt-1 text-xs text-gray-400">No bank details added yet.</Text>
          )}
        </View>
      ) : (
        <Text className="mt-3 text-sm text-gray-500">
          {isCreator ? 'No payer set yet — tap the pencil to choose one.' : 'No payer has been set for this group yet.'}
        </Text>
      )}

      <EditPayerModal visible={isEditing} groupId={groupId} members={members} payerId={payerId} onClose={() => setIsEditing(false)} />
    </Card>
  );
}

function EditPayerModal({
  visible,
  groupId,
  members,
  payerId,
  onClose,
}: {
  visible: boolean;
  groupId: number;
  members: GroupMember[];
  payerId: number | null;
  onClose: () => void;
}) {
  const [updateGroup, { isLoading }] = useUpdateGroupMutation();
  const [selected, setSelected] = useState<number>(payerId ?? 0);

  function handleOpenChange(next: boolean) {
    if (next) setSelected(payerId ?? 0);
  }

  async function handleSave() {
    await updateGroup({ groupId, payer_id: selected === 0 ? null : selected }).unwrap();
    onClose();
  }

  const options = [{ label: 'No payer set', value: 0 }, ...members.map((m) => ({ label: m.name, value: m.id }))];

  return (
    <Modal visible={visible} transparent animationType="fade" onShow={() => handleOpenChange(true)} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-gray-900/40 p-4">
        <View className="w-full max-w-sm rounded-2xl bg-white p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-gray-900">Edit payer</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-sm text-gray-400">Close</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-4">
            <SelectField options={options} value={selected} onChange={setSelected} />
          </View>

          <View className="mt-4 flex-row justify-end gap-2">
            <TouchableOpacity onPress={onClose} className="items-center justify-center rounded-xl px-4 py-3">
              <Text className="text-sm font-medium text-gray-500">Cancel</Text>
            </TouchableOpacity>
            <Button label={isLoading ? 'Saving…' : 'Save'} onPress={handleSave} loading={isLoading} className="px-5" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function BalancesSection({
  groupId,
  balances,
  payerId,
  myMemberId,
  payerName,
}: {
  groupId: number;
  balances: GroupBalance[];
  payerId: number | null;
  myMemberId: number | undefined;
  payerName: string | undefined;
}) {
  const { data: settlements } = useGetSettlementsQuery(groupId);
  const [createSettlement, { isLoading: isPaying }] = useCreateSettlementMutation();

  function handlePay(b: GroupBalance) {
    if (!payerId) return;
    const amount = Math.abs(b.balance);
    const isSelf = b.group_member_id === myMemberId;

    Alert.alert(
      isSelf ? 'Pay' : 'Mark as paid',
      isSelf ? `Pay ${money(amount)} to ${payerName ?? 'the payer'}?` : `Mark ${b.name} as paid ${money(amount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isSelf ? 'Pay' : 'Mark paid',
          onPress: () => createSettlement({ groupId, paidBy: b.group_member_id, paidTo: payerId, amount }),
        },
      ],
    );
  }

  return (
    <Card className="mt-6">
      <Text className="text-sm font-semibold text-gray-900">Balances</Text>

      <View className="mt-3 gap-2">
        {balances.map((b) => {
          const canMarkPaid = !b.is_payer && b.status === 'pending' && payerId && (b.group_member_id === myMemberId || myMemberId === payerId);

          return (
            <View key={b.group_member_id} className="flex-row items-center justify-between gap-2">
              <View className="flex-1 flex-row items-center gap-2">
                <Text className="text-sm text-gray-700">{b.name}</Text>
                {b.is_payer ? (
                  <CollectorBadge isPayer />
                ) : b.status === 'paid' || canMarkPaid ? (
                  <PaidStamp isPaid={b.status === 'paid'} canMark={Boolean(canMarkPaid)} onMarkPaid={() => handlePay(b)} pending={isPaying} />
                ) : (
                  <View className="rounded-full bg-red-50 px-2 py-0.5">
                    <Text className="text-xs font-medium text-red-500">Pending</Text>
                  </View>
                )}
              </View>

              <Text className="text-sm text-gray-500">{money(Math.abs(b.gross_balance))}</Text>
            </View>
          );
        })}
      </View>

      {settlements && settlements.length > 0 && (
        <View className="mt-4 border-t border-gray-100 pt-3">
          <Text className="text-xs font-medium text-gray-500">Recent settlements</Text>
          <View className="mt-2 gap-1.5">
            {settlements.slice(0, 5).map((s) => (
              <Text key={s.id} className="text-xs text-gray-600">
                {s.payer?.name ?? 'Someone'} paid {s.payee?.name ?? 'someone'} {money(s.amount)}
              </Text>
            ))}
          </View>
        </View>
      )}
    </Card>
  );
}
