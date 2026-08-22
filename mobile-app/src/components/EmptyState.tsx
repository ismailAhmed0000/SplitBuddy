import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: ReactNode }) {
  return (
    <View className="items-center rounded-2xl border border-dashed border-gray-300 px-6 py-10">
      {icon}
      <Text className={`text-sm font-medium text-gray-600 ${icon ? 'mt-3' : ''}`}>{title}</Text>
      {description && <Text className="mt-1 text-center text-sm text-gray-400">{description}</Text>}
    </View>
  );
}
