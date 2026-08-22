import { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
import { EditIcon } from '../components/icons';
import { money } from '../utils/format';
import type { GroupBalance, GroupMember } from '../types/models';

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

      <BuddiesSection groupId={groupId} members={group.members} isCreator={isCreator} onRemove={handleRemoveMember} />

      <BalancesSection groupId={groupId} balances={balances ?? []} members={group.members} />

      <Card className="mt-6">
        <Text className="text-sm font-semibold text-gray-900">Bills</Text>
        <View className="mt-3 gap-2">
          {bills?.length === 0 && <Text className="text-sm text-gray-500">No bills in this group yet.</Text>}
          {bills?.map((bill) => (
            <TouchableOpacity
              key={bill.id}
              onPress={() => navigation.navigate('BillDetail', { billId: bill.id })}
              className="flex-row items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5"
            >
              <Text className="flex-1 text-sm text-gray-900" numberOfLines={1}>
                {bill.merchant_name ?? 'Receipt'}
              </Text>
              <Text className="text-sm font-medium text-gray-700">{money(bill.total)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {isCreator && (
        <TouchableOpacity onPress={handleDeleteGroup} className="mt-6 items-center rounded-xl border border-red-200 bg-red-50 py-3">
          <Text className="text-sm font-medium text-red-500">Delete group</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function BuddiesSection({
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
    <Card className="mt-6">
      <Text className="text-sm font-semibold text-gray-900">Buddies</Text>

      <View className="mt-3 gap-2">
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
    </Card>
  );
}

function BalancesSection({
  groupId,
  balances,
  members,
}: {
  groupId: number;
  balances: GroupBalance[];
  members: GroupMember[];
}) {
  const [isSettling, setIsSettling] = useState(false);
  const { data: settlements } = useGetSettlementsQuery(groupId);

  return (
    <Card className="mt-6">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-gray-900">Balances</Text>
        <TouchableOpacity onPress={() => setIsSettling((open) => !open)}>
          <Text className="text-sm font-medium text-teal-600">{isSettling ? 'Cancel' : 'Settle up'}</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-3 gap-1.5">
        {balances.map((b) => (
          <View key={b.group_member_id} className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-700">{b.name}</Text>
            <Text
              className={`text-sm ${b.balance > 0 ? 'font-medium text-emerald-500' : b.balance < 0 ? 'font-medium text-red-500' : 'text-gray-500'}`}
            >
              {b.balance > 0 ? `+${money(b.balance)}` : money(b.balance)}
            </Text>
          </View>
        ))}
      </View>

      {isSettling && <SettleUpForm groupId={groupId} members={members} balances={balances} onDone={() => setIsSettling(false)} />}

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

function SettleUpForm({
  groupId,
  members,
  balances,
  onDone,
}: {
  groupId: number;
  members: GroupMember[];
  balances: GroupBalance[];
  onDone: () => void;
}) {
  const [createSettlement, { isLoading }] = useCreateSettlementMutation();

  const suggestion = useMemo(() => {
    const debtor = [...balances].sort((a, b) => a.balance - b.balance)[0];
    const creditor = [...balances].sort((a, b) => b.balance - a.balance)[0];
    if (!debtor || !creditor || debtor.balance >= 0 || creditor.balance <= 0) return null;
    return {
      paidBy: debtor.group_member_id,
      paidTo: creditor.group_member_id,
      amount: Math.min(Math.abs(debtor.balance), creditor.balance),
    };
  }, [balances]);

  const [paidBy, setPaidBy] = useState<number | undefined>(suggestion?.paidBy);
  const [paidTo, setPaidTo] = useState<number | undefined>(suggestion?.paidTo);
  const [amount, setAmount] = useState(suggestion ? suggestion.amount.toFixed(2) : '');

  const memberOptions = members.map((m) => ({ label: m.name, value: m.id }));

  async function handleSubmit() {
    if (!paidBy || !paidTo || paidBy === paidTo || !amount || Number(amount) <= 0) return
    await createSettlement({ groupId, paidBy, paidTo, amount: Number(amount) }).unwrap();
    onDone();
  }

  return (
    <View className="mt-4 gap-3 rounded-xl border border-teal-100 bg-teal-50/50 p-4">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <SelectField label="Paid by" options={memberOptions} value={paidBy} onChange={setPaidBy} />
        </View>
        <View className="flex-1">
          <SelectField label="Paid to" options={memberOptions} value={paidTo} onChange={setPaidTo} />
        </View>
      </View>

      <TextField label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />

      <Button label="Record settlement" onPress={handleSubmit} loading={isLoading} />
    </View>
  );
}
