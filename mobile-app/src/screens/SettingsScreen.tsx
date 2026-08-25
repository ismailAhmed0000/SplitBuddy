import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/HomeStack';
import {
  useGetCurrentUserQuery,
  useLogoutMutation,
  useUpdateUserMutation,
} from '../store/api/apiSlice';
import { useAppSelector } from '../store/hooks';
import { parseApiError } from '../utils/apiError';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import type { User } from '../types/user';

type Props = NativeStackScreenProps<HomeStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const cachedUser = useAppSelector(state => state.auth.user);
  const { data: user } = useGetCurrentUserQuery();
  const displayUser = user ?? cachedUser;

  if (!displayUser) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6 pt-16">
        <Text className="text-sm text-gray-500">Loading…</Text>
      </View>
    );
  }

  return (
    <SettingsForm
      key={displayUser.id}
      user={displayUser}
      onBack={() => navigation.goBack()}
    />
  );
}

function SettingsForm({ user, onBack }: { user: User; onBack: () => void }) {
  const [updateUser, { isLoading, error }] = useUpdateUserMutation();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [bankName, setBankName] = useState(user.bank_name ?? '');
  const [bankAccountNumber, setBankAccountNumber] = useState(
    user.bank_account_number ?? '',
  );
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaved(false);
    try {
      await updateUser({
        userId: user.id,
        name,
        username,
        email,
        phone: phone || null,
        bank_name: bankName || null,
        bank_account_number: bankAccountNumber || null,
      }).unwrap();
      setSaved(true);
    } catch {}
  }

  const errorMessage = error ? parseApiError(error) : null;

  return (
    <ScrollView
      className="flex-1 bg-white px-6"
      contentContainerClassName="pt-16 pb-28"
    >
      <ScreenHeader
        onBack={onBack}
        title="Settings"
        subtitle="Manage your profile and how buddies pay you back."
      />

      {errorMessage && (
        <View className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5">
          <Text className="text-sm text-red-500">{errorMessage}</Text>
        </View>
      )}
      {saved && (
        <View className="mt-4 rounded-xl bg-teal-50 px-3.5 py-2.5">
          <Text className="text-sm text-teal-700">Saved.</Text>
        </View>
      )}

      <Card className="mt-6">
        <Text className="text-sm font-semibold text-gray-900">Profile</Text>
        <View className="mt-4 gap-4">
          <TextField
            label="Name"
            value={name}
            onChangeText={setName}
            accessibilityLabel="Name"
          />
          <TextField
            label="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            accessibilityLabel="Username"
          />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            accessibilityLabel="Email"
          />
          <TextField
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            accessibilityLabel="Phone"
          />
        </View>
      </Card>

      <Card className="mt-6">
        <Text className="text-sm font-semibold text-gray-900">
          Bank details
        </Text>
        <Text className="mt-1 text-xs text-gray-500">
          Shown to your group buddies so they know where to send money —
          SplitBuddy doesn't process payments.
        </Text>
        <View className="mt-4 gap-4">
          <TextField
            label="Bank name"
            value={bankName}
            onChangeText={setBankName}
            placeholder="BML , MIB"
            accessibilityLabel="Bank name"
          />
          <TextField
            label="Account number"
            value={bankAccountNumber}
            onChangeText={setBankAccountNumber}
            keyboardType="number-pad"
            accessibilityLabel="Account number"
          />
        </View>
      </Card>

      <Button
        label={isLoading ? 'Saving…' : 'Save changes'}
        onPress={handleSave}
        loading={isLoading}
        className="mt-6"
      />

      <Button
        label={isLoggingOut ? 'Logging out…' : 'Log out'}
        onPress={() => logout()}
        loading={isLoggingOut}
        variant="danger"
        className="mt-4"
      />
    </ScrollView>
  );
}
