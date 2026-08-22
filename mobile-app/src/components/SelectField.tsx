import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { ChevronDownIcon } from './icons';

export type SelectOption<T> = { label: string; value: T };

export function SelectField<T extends string | number>({
  label,
  placeholder = 'Select…',
  options,
  value,
  onChange,
}: {
  label?: string;
  placeholder?: string;
  options: SelectOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View className="gap-1.5">
      {label && <Text className="text-sm font-medium text-gray-700">{label}</Text>}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3"
      >
        <Text className={`text-base ${selected ? 'text-gray-900' : 'text-gray-400'}`}>
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDownIcon />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable className="flex-1 justify-end bg-gray-900/40" onPress={() => setIsOpen(false)}>
          <Pressable className="max-h-96 rounded-t-3xl bg-white pb-8 pt-2">
            <View className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-gray-200" />
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item.value);
                    setIsOpen(false);
                  }}
                  className={`px-6 py-3.5 ${item.value === value ? 'bg-teal-50' : ''}`}
                >
                  <Text className={`text-base ${item.value === value ? 'font-semibold text-teal-700' : 'text-gray-800'}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
