import { useEffect } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { useGetCurrentUserQuery, useLogoutMutation } from '../store/api/apiSlice';
import { requestNotificationPermission, setupPushNotifications } from '../services/pushNotifications';
import { BellIcon } from '../components/icons';

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
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-2xl font-semibold text-slate-900">Hey {displayUser?.name ?? 'there'} 👋</Text>
          <Text className="mt-1 text-sm text-slate-500">@{displayUser?.username}</Text>
        </View>
        <TouchableOpacity
          accessibilityLabel="Notifications"
          className="h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <BellIcon size={26} />
        </TouchableOpacity>
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
