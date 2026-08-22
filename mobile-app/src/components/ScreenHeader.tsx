import type { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeftIcon } from './icons';

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <View className="flex-row items-start justify-between">
      <View className="flex-1 flex-row items-start gap-2">
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mt-0.5 h-8 w-8 items-center justify-center rounded-full"
          >
            <ChevronLeftIcon size={22} />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <Text className="text-2xl font-semibold text-gray-900">{title}</Text>
          {subtitle && <Text className="mt-1 text-sm text-gray-500">{subtitle}</Text>}
        </View>
      </View>
      {right}
    </View>
  );
}
