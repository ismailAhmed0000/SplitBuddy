import { Text, View } from 'react-native';

export default function BuddiesScreen() {
  return (
    <View className="flex-1 bg-slate-50 px-6 pt-16">
      <Text className="text-2xl font-semibold text-slate-900">Buddies</Text>
      <Text className="mt-1 text-sm text-slate-500">Your go-to list for splitting bills.</Text>

      <View className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <Text className="text-sm text-slate-600">
          Buddy search, QR codes, and adding friends land here next.
        </Text>
      </View>
    </View>
  );
}
