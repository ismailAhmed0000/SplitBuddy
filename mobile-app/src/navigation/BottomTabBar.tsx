import { Text, TouchableOpacity, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BillsIcon, BuddiesIcon, HomeIcon, PlusIcon } from '../components/icons';

const TAB_ICONS = {
  Home: HomeIcon,
  Buddies: BuddiesIcon,
  Bills: BillsIcon,
} as const;

export function BottomTabBar({ state, navigation, insets }: BottomTabBarProps) {
  return (
    <View
      className="flex-row justify-center border-t border-slate-200 bg-white"
      style={{ paddingBottom: insets.bottom || 14, paddingTop: 14 }}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('Bills')}
        accessibilityRole="button"
        accessibilityLabel="Add bill"
        className="absolute h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg"
        style={{ top: -28, right: 20 }}
      >
        <PlusIcon size={22} color="#6B7280" />
      </TouchableOpacity>

      <View className="flex-row items-center gap-12">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const Icon = TAB_ICONS[route.name as keyof typeof TAB_ICONS];

          function handlePress() {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={handlePress}
              accessibilityRole="button"
              accessibilityLabel={route.name}
              accessibilityState={isFocused ? { selected: true } : {}}
              className="items-center gap-1"
            >
              <View
                className={`h-12 w-12 items-center justify-center rounded-2xl ${
                  isFocused ? 'bg-violet-600' : 'bg-transparent'
                }`}
              >
                <Icon size={21} color={isFocused ? '#FFFFFF' : '#94A3B8'} />
              </View>
              <Text className={`text-xs font-medium ${isFocused ? 'text-violet-600' : 'text-slate-400'}`}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
