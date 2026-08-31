import { StatusBar, Text, View } from 'react-native';

/** Shown while auth state is hydrating, bridging the native splash to the first real screen. */
export function SplashScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-teal-900">
      <StatusBar barStyle="light-content" />
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-teal-600">
        <Text className="text-3xl font-bold text-white">S</Text>
      </View>
      <Text className="mt-4 text-2xl font-bold text-white">SplitBuddy</Text>
    </View>
  );
}
