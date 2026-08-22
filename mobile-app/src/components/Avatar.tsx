import { Text, View } from 'react-native';

const PALETTE = [
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { bg: 'bg-sky-100', text: 'text-sky-700' },
  { bg: 'bg-amber-50', text: 'text-amber-700' },
  { bg: 'bg-red-50', text: 'text-red-600' },
];

function colorsFor(name: string) {
  const code = name.charCodeAt(0) || 0;
  return PALETTE[code % PALETTE.length];
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const { bg, text } = colorsFor(name);
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View
      className={`items-center justify-center rounded-full ${bg}`}
      style={{ width: size, height: size }}
    >
      <Text className={`font-semibold ${text}`} style={{ fontSize: size * 0.4 }}>
        {initial}
      </Text>
    </View>
  );
}
