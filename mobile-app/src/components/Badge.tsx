import { Text, View } from 'react-native';
import type { BillStatus } from '../types/models';

const STATUS_STYLES: Record<BillStatus, { container: string; text: string }> = {
  processing: { container: 'bg-amber-50', text: 'text-amber-700' },
  parsed: { container: 'bg-sky-100', text: 'text-sky-700' },
  confirmed: { container: 'bg-emerald-50', text: 'text-emerald-600' },
  failed: { container: 'bg-red-50', text: 'text-red-600' },
};

export function StatusBadge({ status }: { status: BillStatus }) {
  const styles = STATUS_STYLES[status] ?? { container: 'bg-gray-100', text: 'text-gray-700' };

  return (
    <View className={`shrink-0 rounded-full px-2.5 py-1 ${styles.container}`}>
      <Text className={`text-xs font-medium capitalize ${styles.text}`}>{status}</Text>
    </View>
  );
}

export function Pill({ label, className, textClassName }: { label: string; className?: string; textClassName?: string }) {
  return (
    <View className={`rounded-full bg-gray-100 px-3 py-1 ${className ?? ''}`}>
      <Text className={`text-xs font-medium text-gray-700 ${textClassName ?? ''}`}>{label}</Text>
    </View>
  );
}
