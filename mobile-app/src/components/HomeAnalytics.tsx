import { Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { money } from '../utils/format';

type Stat = { label: string; value: string; muted?: boolean };

export function HomeAnalytics({
  owed,
  owing,
  activeTabs,
  className,
}: {
  owed: number;
  owing: number;
  activeTabs: number;
  className?: string;
}) {
  const stats: Stat[] = [
    { label: "You're owed", value: money(owed) },
    { label: 'You owe', value: money(owing), muted: owing > 0 },
    { label: 'Active tabs', value: String(activeTabs) },
  ];

  return (
    <View className={`relative overflow-hidden rounded-3xl bg-[#1A1A1A] px-6 py-14 ${className ?? ''}`}>
      <View className="absolute -bottom-12 -right-10 opacity-[0.07]" pointerEvents="none">
        <Svg width={280} height={280} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={1}>
          <Rect x={2} y={6} width={20} height={12} rx={2} strokeLinejoin="round" />
          <Circle cx={12} cy={12} r={3.25} />
          <Path d="M6 9.5v5M18 9.5v5" strokeLinecap="round" />
        </Svg>
      </View>

      <View className="flex-row">
        {stats.map((stat, i) => (
          <View
            key={stat.label}
            className={`flex-1 items-center ${i > 0 ? 'border-l border-white/10 pl-2' : 'pr-2'}`}
          >
            <Text className="text-[11px] font-medium uppercase tracking-wide text-white/50">
              {stat.label}
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              className={`mt-2 text-2xl font-bold ${stat.muted ? 'text-[#E8C5B9]' : 'text-white'}`}
            >
              {stat.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
