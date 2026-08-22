import { Text, View } from 'react-native';

export default function BillsScreen() {
  return (
    <View className="flex-1 bg-slate-50 px-6 pt-16">
      <Text className="text-2xl font-semibold text-slate-900">Bills</Text>
      <Text className="mt-1 text-sm text-slate-500">Everything you've split with your groups.</Text>

      <View className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <Text className="text-sm text-slate-600">
          Bill uploads, item assignment, and balances land here next.
        </Text>
      </View>
    </View>
  );
}
