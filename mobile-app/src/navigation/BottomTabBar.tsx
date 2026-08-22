import { TouchableOpacity, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BillsIcon, BuddiesIcon, HomeIcon } from '../components/icons';

const TAB_ICONS = {
  Home: HomeIcon,
  Buddies: BuddiesIcon,
  Bills: BillsIcon,
} as const;

export function BottomTabBar({ state, navigation, insets }: BottomTabBarProps) {
  return (
    <View
      className="w-full flex-row items-center justify-center gap-16 bg-white"
      style={{ paddingBottom: insets.bottom || 20, paddingTop: 18 }}
    >
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
            className="items-center justify-center py-1"
          >
            <Icon size={28} color={isFocused ? '#111827' : '#9CA3AF'} filled={isFocused} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
