import { TouchableOpacity } from 'react-native';
import { Seal } from './CollectorBadge';

export function PaidStamp({
  isPaid,
  canMark,
  onMarkPaid,
  pending,
}: {
  isPaid: boolean;
  canMark?: boolean;
  onMarkPaid?: () => void;
  pending?: boolean;
}) {
  if (isPaid) {
    return <Seal fill="#00a86b" stroke="#006b44" textColor="#ffffff" label="PAID" />;
  }

  if (!canMark) return null;

  return (
    <TouchableOpacity onPress={onMarkPaid} disabled={pending} accessibilityLabel="Mark as paid" activeOpacity={0.7}>
      <Seal fill="#94a3b8" stroke="#64748b" textColor="#ffffff" label="PAID" />
    </TouchableOpacity>
  );
}
