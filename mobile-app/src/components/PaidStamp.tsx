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
    return <Seal fill="#1A1A1A" stroke="#000000" textColor="#ffffff" label="PAID" />;
  }

  if (!canMark) return null;

  return (
    <TouchableOpacity onPress={onMarkPaid} disabled={pending} accessibilityLabel="Mark as paid" activeOpacity={0.7}>
      <Seal fill="#8E8E93" stroke="#6A6A6E" textColor="#ffffff" label="PAID" />
    </TouchableOpacity>
  );
}
