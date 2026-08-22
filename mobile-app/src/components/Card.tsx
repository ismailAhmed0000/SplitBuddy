import { View, type ViewProps } from 'react-native';

export function Card({ className, style, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`rounded-2xl border border-gray-200 bg-white p-5 ${className ?? ''}`}
      style={[{ shadowColor: '#111827', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }, style]}
      {...props}
    />
  );
}
