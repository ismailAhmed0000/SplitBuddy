import { useMemo, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
  useAddBuddyMutation,
  useGetBuddiesQuery,
  useGetCurrentUserQuery,
  useRemoveBuddyMutation,
  useSearchUsersQuery,
} from '../store/api/apiSlice';
import { Card } from '../components/Card';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import type { Buddy } from '../types/models';

const QR_PREFIX = 'splitbuddy:buddy:';

function buddyQrValue(username: string): string {
  return `${QR_PREFIX}${username}`;
}

function parseBuddyCode(text: string): string {
  return text.startsWith(QR_PREFIX) ? text.slice(QR_PREFIX.length) : text.trim();
}

export default function BuddiesScreen() {
  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: buddies, isLoading } = useGetBuddiesQuery();
  const [addBuddy, { isLoading: isAdding }] = useAddBuddyMutation();
  const [removeBuddy] = useRemoveBuddyMutation();

  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: searchResults } = useSearchUsersQuery(query.trim(), { skip: query.trim().length < 2 });

  const existingBuddyUserIds = useMemo(() => new Set(buddies?.map((b) => b.buddy_user_id)), [buddies]);

  async function addByUsername(username: string, label: string) {
    try {
      await addBuddy(username).unwrap();
      setFeedback({ type: 'success', message: `${label} added as a buddy.` });
      setQuery('');
      setCode('');
    } catch {
      setFeedback({ type: 'error', message: `Couldn't find a user with that username.` });
    }
  }

  function handleRemove(buddy: Buddy) {
    Alert.alert('Remove buddy?', `Remove ${buddy.user.name} from your buddies?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeBuddy(buddy.id) },
    ]);
  }

  const filteredResults = searchResults?.filter((u) => u.id !== currentUser?.id && !existingBuddyUserIds.has(u.id));

  return (
    <FlatList
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 96, paddingBottom: 112 }}
      style={{ backgroundColor: '#FFFFFF' }}
      data={buddies}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <View>
          <Text className="text-2xl font-semibold text-gray-900">Buddies</Text>
          <Text className="mt-1 text-sm text-gray-500">
            Your go-to list for splitting bills — add friends by username or code.
          </Text>

          {currentUser && (
            <Card className="mt-6 items-center">
              <View className="rounded-xl border border-gray-100 p-3">
                <QRCode value={buddyQrValue(currentUser.username)} size={140} />
              </View>
              <Text className="mt-3 text-sm font-medium text-gray-900">@{currentUser.username}</Text>
              <Text className="text-xs text-gray-500">Share this code so a buddy can add you</Text>
            </Card>
          )}

          <Card className="mt-6">
            <Text className="text-sm font-semibold text-gray-900">Add a buddy</Text>

            <View className="mt-3 gap-3">
              <TextField
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                placeholder="Search by username, name, or email"
                accessibilityLabel="Search users"
              />

              {query.trim().length >= 2 && (
                <View className="rounded-xl border border-gray-100 py-1">
                  {filteredResults?.map((u) => (
                    <TouchableOpacity key={u.id} onPress={() => addByUsername(u.username, u.name)} className="px-3 py-2">
                      <Text className="text-sm font-medium text-gray-900">{u.name}</Text>
                      <Text className="text-xs text-gray-500">@{u.username}</Text>
                    </TouchableOpacity>
                  ))}
                  {filteredResults?.length === 0 && (
                    <Text className="px-3 py-2 text-xs text-gray-400">No matching users found.</Text>
                  )}
                </View>
              )}

              <View className="flex-row items-end gap-2">
                <View className="flex-1">
                  <TextField
                    value={code}
                    onChangeText={setCode}
                    autoCapitalize="none"
                    placeholder="Or paste a buddy's code"
                    accessibilityLabel="Buddy code"
                  />
                </View>
                <Button
                  label="Add"
                  onPress={() => addByUsername(parseBuddyCode(code), `@${parseBuddyCode(code)}`)}
                  loading={isAdding}
                  disabled={!code.trim()}
                  className="px-5 py-3"
                />
              </View>

              {feedback && (
                <Text className={`text-sm ${feedback.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {feedback.message}
                </Text>
              )}
            </View>
          </Card>

          <Text className="mb-2 mt-6 text-sm font-semibold text-gray-900">Your buddies</Text>

          {!isLoading && buddies?.length === 0 && (
            <EmptyState title="No buddies yet" description="Add one above to get started." />
          )}
        </View>
      }
      renderItem={({ item }) => (
        <View className="mb-2 flex-row items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
          <View className="flex-row items-center gap-2.5">
            <Avatar name={item.user.name} size={32} />
            <View>
              <Text className="text-sm text-gray-800">{item.user.name}</Text>
              <Text className="text-xs text-gray-500">@{item.user.username}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => handleRemove(item)} accessibilityLabel={`Remove ${item.user.name}`}>
            <Text className="text-xs font-medium text-gray-400">Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}
