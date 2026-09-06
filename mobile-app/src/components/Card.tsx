import { View, type ViewProps } from 'react-native';

export function Card({ className, style, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`rounded-2xl border border-gray-200 bg-white p-5 ${className ?? ''}`}
      style={[{ shadowColor: '#1A1A1A', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 }, style]}
      {...props}
    />
  );
}
