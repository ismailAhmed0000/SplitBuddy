import { Text, TouchableOpacity, View } from 'react-native';
import { Card } from './Card';
import { ImageIcon } from './icons';

function CornerBracket({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const positions = {
    tl: 'top-1.5 left-1.5 rounded-tl-md border-l-2 border-t-2',
    tr: 'top-1.5 right-1.5 rounded-tr-md border-r-2 border-t-2',
    bl: 'bottom-1.5 left-1.5 rounded-bl-md border-l-2 border-b-2',
    br: 'bottom-1.5 right-1.5 rounded-br-md border-r-2 border-b-2',
  } as const;

  return <View className={`absolute h-4 w-4 border-teal-300 ${positions[position]}`} />;
}

export function UploadBillCard({ onPress, className }: { onPress: () => void; className?: string }) {
  return (
    <Card className={`items-center ${className ?? ''}`}>
      <View className="h-20 w-20 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
        <CornerBracket position="tl" />
        <CornerBracket position="tr" />
        <CornerBracket position="bl" />
        <CornerBracket position="br" />
        <ImageIcon size={28} />
      </View>
      <Text className="mt-4 text-base font-semibold text-gray-900">Upload a bill</Text>
      <Text className="mt-1 text-center text-sm text-gray-500">
        Snap or upload a receipt and we'll read the items for you.
      </Text>
      <TouchableOpacity onPress={onPress} className="mt-4 w-full items-center rounded-xl bg-teal-600 py-3">
        <Text className="text-sm font-semibold text-white">Get started</Text>
      </TouchableOpacity>
    </Card>
  );
}
