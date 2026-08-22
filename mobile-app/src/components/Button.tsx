import { ActivityIndicator, Text, TouchableOpacity, type GestureResponderEvent } from 'react-native';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

const VARIANT_STYLES: Record<Variant, { container: string; text: string }> = {
  primary: { container: 'bg-teal-600', text: 'text-white' },
  secondary: { container: 'border border-gray-300 bg-white', text: 'text-gray-700' },
  danger: { container: 'border border-red-200 bg-red-50', text: 'text-red-500' },
  ghost: { container: 'bg-transparent', text: 'text-teal-600' },
};

export function Button({ label, onPress, variant = 'primary', disabled, loading, className }: ButtonProps) {
  const styles = VARIANT_STYLES[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      className={`items-center justify-center rounded-xl px-4 py-3 ${styles.container} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#0D9488'} />
      ) : (
        <Text className={`text-sm font-semibold ${styles.text}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
