import { Text, View } from 'react-native';

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View
      className="items-center justify-center rounded-full bg-gray-100"
      style={{ width: size, height: size }}
    >
      <Text className="font-semibold text-gray-900" style={{ fontSize: size * 0.4 }}>
        {initial}
      </Text>
    </View>
  );
}
