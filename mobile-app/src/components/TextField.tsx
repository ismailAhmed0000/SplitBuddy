import { Text, TextInput, View, type TextInputProps } from 'react-native';

type TextFieldProps = {
  label?: string;
  error?: string;
} & TextInputProps;

export function TextField({ label, error, className, ...props }: TextFieldProps) {
  return (
    <View className="gap-1.5">
      {label && <Text className="text-sm font-medium text-gray-700">{label}</Text>}
      <TextInput
        placeholderTextColor="#9CA3AF"
        className={`rounded-xl border bg-gray-50 px-3.5 py-3 text-base text-gray-900 ${error ? 'border-red-400' : 'border-gray-200'} ${className ?? ''}`}
        {...props}
      />
      {error && <Text className="text-xs text-red-500">{error}</Text>}
    </View>
  );
}
