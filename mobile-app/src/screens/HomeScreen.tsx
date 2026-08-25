import { useEffect } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/HomeStack';
import { useAppSelector } from '../store/hooks';
import { useGetCurrentUserQuery, useGetNotificationsQuery, useGetUserBalancesQuery } from '../store/api/apiSlice';
import { requestNotificationPermission, setupPushNotifications } from '../services/pushNotifications';
import { pickBillImage } from '../utils/pickImage';
import { BellIcon, ChevronRightIcon, GroupIcon } from '../components/icons';
import { UploadBillCard } from '../components/UploadBillCard';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { money } from '../utils/format';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

export default function HomeScreen({ navigation }: Props) {
  const cachedUser = useAppSelector((state) => state.auth.user);
  const { data: user } = useGetCurrentUserQuery();
  const { data: balances, isLoading: balancesLoading } = useGetUserBalancesQuery(user?.id ?? 0, {
    skip: !user,
  });
  const { data: notifications } = useGetNotificationsQuery(undefined, { pollingInterval: 30000 });

  const displayUser = user ?? cachedUser;
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  useEffect(() => {
    requestNotificationPermission();
    return setupPushNotifications();
  }, []);

  const groupBalances = balances?.groups ?? [];
  const totalOwed = groupBalances.filter((g) => g.balance > 0).reduce((sum, g) => sum + g.balance, 0);
  const totalOwing = groupBalances.filter((g) => g.balance < 0).reduce((sum, g) => sum + Math.abs(g.balance), 0);

  async function pickAndUpload(source: 'camera' | 'library') {
    const image = await pickBillImage(source);
    if (!image) return;
    navigation.navigate('UploadBill', { initialImage: image });
  }

  function handleUploadPress() {
    Alert.alert('Upload a bill', 'How would you like to add your receipt?', [
      { text: 'Take Photo', onPress: () => pickAndUpload('camera') },
      { text: 'Choose from Library', onPress: () => pickAndUpload('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 pt-24 pb-28">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-2xl font-semibold text-gray-900">Hello {displayUser?.name ?? 'there'}</Text>
          <Text className="mt-1 text-sm text-gray-500">@{displayUser?.username}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            accessibilityLabel="Notifications"
            className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <BellIcon size={22} />
            {unreadCount > 0 && (
              <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} accessibilityLabel="Settings">
            <Avatar name={displayUser?.name ?? '?'} size={44} />
          </TouchableOpacity>
        </View>
      </View>

      {balancesLoading ? (
        <View className="mt-6 h-36 rounded-2xl bg-gray-100" />
      ) : (
        <View className="mt-6 flex-row rounded-2xl border border-gray-200 bg-white p-7">
          <View className="flex-1 pr-3">
            <Text className="text-base font-medium text-gray-500">You're owed</Text>
            <Text className="mt-2 text-2xl font-bold text-emerald-500">{money(totalOwed)}</Text>
          </View>
          <View className="w-px bg-gray-100" />
          <View className="flex-1 pl-3">
            <Text className="text-base font-medium text-gray-500">You owe</Text>
            <Text className="mt-2 text-2xl font-bold text-red-500">{money(totalOwing)}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('GroupsList')} accessibilityLabel="Groups" className="mt-6">
        <Card className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-teal-100">
              <GroupIcon size={19} color="#0D9488" />
            </View>
            <View>
              <Text className="text-sm font-semibold text-gray-900">Groups</Text>
              <Text className="mt-0.5 text-xs text-gray-500">See your groups and balances</Text>
            </View>
          </View>
          <ChevronRightIcon size={18} color="#D1D5DB" />
        </Card>
      </TouchableOpacity>

      <UploadBillCard className="mt-6" onPress={handleUploadPress} />
    </ScrollView>
  );
}
