import { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/HomeStack';
import { useCreateGroupMutation, useGetGroupsQuery } from '../store/api/apiSlice';
import { ScreenHeader } from '../components/ScreenHeader';
import { EmptyState } from '../components/EmptyState';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { ChevronRightIcon, GroupIcon } from '../components/icons';
import type { Group } from '../types/models';

type Props = NativeStackScreenProps<HomeStackParamList, 'GroupsList'>;

export default function GroupsListScreen({ navigation }: Props) {
  const { data: groups, isLoading } = useGetGroupsQuery();
  const [createGroup, { isLoading: isCreating }] = useCreateGroupMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');

  async function handleCreate() {
    if (!name.trim()) return;
    await createGroup(name.trim()).unwrap();
    setName('');
    setIsAdding(false);
  }

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <ScreenHeader
        title="Groups"
        subtitle="Where you and your buddies split bills."
        onBack={() => navigation.goBack()}
        right={
          !isAdding && (
            <TouchableOpacity onPress={() => setIsAdding(true)} className="rounded-xl bg-teal-600 px-4 py-2.5">
              <Text className="text-sm font-semibold text-white">New</Text>
            </TouchableOpacity>
          )
        }
      />

      {isAdding && (
        <View className="mt-4 flex-row items-end gap-2">
          <View className="flex-1">
            <TextField
              autoFocus
              value={name}
              onChangeText={setName}
              placeholder="Group name (e.g. Trip to Bali)"
              accessibilityLabel="Group name"
            />
          </View>
          <Button label="Add" onPress={handleCreate} loading={isCreating} disabled={!name.trim()} className="px-5 py-3" />
        </View>
      )}

      <FlatList
        data={groups}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingTop: 40, gap: 16, paddingBottom: 112 }}
        ListEmptyComponent={
          !isLoading ? <EmptyState title="You're not in any groups yet." /> : undefined
        }
        renderItem={({ item }) => <GroupRow group={item} onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })} />}
      />
    </View>
  );
}

function GroupRow({ group, onPress }: { group: Group; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-teal-100">
            <GroupIcon size={19} color="#0D9488" />
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-900">{group.name}</Text>
            <Text className="mt-1 text-xs text-gray-500">{group.members_count ?? group.members?.length ?? 0} buddies</Text>
          </View>
        </View>
        <ChevronRightIcon size={18} color="#D1D5DB" />
      </Card>
    </TouchableOpacity>
  );
}
