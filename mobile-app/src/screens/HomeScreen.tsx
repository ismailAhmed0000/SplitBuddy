import { useEffect } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { useGetCurrentUserQuery, useLogoutMutation } from '../store/api/apiSlice';
import { requestNotificationPermission, setupPushNotifications } from '../services/pushNotifications';

export default function HomeScreen() {
  const cachedUser = useAppSelector((state) => state.auth.user);
  const { data: user } = useGetCurrentUserQuery();
  const [logout, { isLoading }] = useLogoutMutation();

  const displayUser = user ?? cachedUser;

  useEffect(() => {
    requestNotificationPermission();
    return setupPushNotifications();
  }, []);

  return (
    <View className="flex-1 bg-slate-50 px-6 pt-16">
      <Text className="text-2xl font-semibold text-slate-900">Hey {displayUser?.name ?? 'there'} 👋</Text>
      <Text className="mt-1 text-sm text-slate-500">@{displayUser?.username}</Text>

      <View className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <Text className="text-sm text-slate-600">
          This is the SplitBuddy mobile scaffold — groups, bills, and buddies screens plug in here next.
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => logout()}
        disabled={isLoading}
        className="mt-8 items-center rounded-lg border border-slate-300 py-3"
      >
        {isLoading ? <ActivityIndicator /> : <Text className="font-medium text-slate-700">Log out</Text>}
      </TouchableOpacity>
    </View>
  );
}
