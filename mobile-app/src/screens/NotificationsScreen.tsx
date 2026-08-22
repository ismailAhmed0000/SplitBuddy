import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/HomeStack';
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from '../store/api/apiSlice';
import { ScreenHeader } from '../components/ScreenHeader';
import { EmptyState } from '../components/EmptyState';
import type { AppNotification } from '../types/models';

type Props = NativeStackScreenProps<HomeStackParamList, 'Notifications'>;

export default function NotificationsScreen({ navigation }: Props) {
  const { data: notifications, isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />

      <FlatList
        className="mt-6"
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="gap-2 pb-28"
        ListEmptyComponent={!isLoading ? <EmptyState title="You're all caught up." /> : undefined}
        renderItem={({ item }) => <NotificationRow notification={item} onPress={() => !item.read && markRead(item.id)} />}
      />
    </View>
  );
}

function NotificationRow({ notification, onPress }: { notification: AppNotification; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-start gap-2 rounded-xl border p-4 ${notification.read ? 'border-gray-100 bg-white' : 'border-teal-100 bg-teal-50'}`}
    >
      {!notification.read && <View className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />}
      <Text className={`flex-1 text-sm ${notification.read ? 'text-gray-500' : 'font-medium text-gray-900'}`}>
        {notification.message}
      </Text>
    </TouchableOpacity>
  );
}
