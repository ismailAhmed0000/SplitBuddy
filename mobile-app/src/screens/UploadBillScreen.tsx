import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { HomeStackParamList } from '../navigation/HomeStack';
import { useCreateGroupMutation, useGetGroupsQuery, useUploadBillMutation, type PickedImage } from '../store/api/apiSlice';
import { parseApiError } from '../utils/apiError';
import { pickBillImage } from '../utils/pickImage';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { SelectField } from '../components/SelectField';
import { CameraIcon, ImageIcon } from '../components/icons';

type Props = NativeStackScreenProps<HomeStackParamList, 'UploadBill'>;

export default function UploadBillScreen({ navigation, route }: Props) {
  const { data: groups, isLoading: groupsLoading } = useGetGroupsQuery();
  const [createGroup, { isLoading: isCreatingGroup }] = useCreateGroupMutation();
  const [uploadBill, { isLoading: isUploading }] = useUploadBillMutation();

  const [image, setImage] = useState<PickedImage | null>(route.params?.initialImage ?? null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(undefined);
  const [newGroupName, setNewGroupName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const hasGroups = (groups?.length ?? 0) > 0;
  const effectiveGroupId = groups?.length === 1 ? groups[0].id : selectedGroupId;
  const isSubmitting = isCreatingGroup || isUploading;

  async function pickImage(source: 'camera' | 'library') {
    const picked = await pickBillImage(source);
    if (picked) setImage(picked);
  }

  async function handleContinue() {
    if (!image) return;
    setError(null);

    try {
      let groupId = effectiveGroupId;

      if (!groupId) {
        if (!newGroupName.trim()) {
          setError('Give your group a name first.');
          return;
        }
        const group = await createGroup(newGroupName.trim()).unwrap();
        groupId = group.id;
      }

      const bill = await uploadBill({ groupId, image }).unwrap();
      navigation.replace('BillDetail', { billId: bill.id });
    } catch (err) {
      setError(parseApiError(err as FetchBaseQueryError | SerializedError));
    }
  }

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <ScreenHeader title="Upload a bill" onBack={() => navigation.goBack()} />

      <Text className="mt-1 text-sm text-gray-500">Snap or upload a receipt and we'll read the items for you.</Text>

      {image ? (
        <View className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
          <Image source={{ uri: image.uri }} className="h-56 w-full" resizeMode="cover" />
          <TouchableOpacity onPress={() => setImage(null)} className="items-center border-t border-gray-200 bg-white py-2.5">
            <Text className="text-sm font-medium text-gray-500">Remove photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mt-6 flex-row gap-3">
          <TouchableOpacity
            onPress={() => pickImage('camera')}
            className="flex-1 items-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-8"
          >
            <CameraIcon />
            <Text className="text-sm font-medium text-gray-700">Take photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => pickImage('library')}
            className="flex-1 items-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-8"
          >
            <ImageIcon />
            <Text className="text-sm font-medium text-gray-700">Choose photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {image && !groupsLoading && (
        <View className="mt-6 gap-3">
          {(groups?.length ?? 0) > 1 && (
            <SelectField
              label="Group"
              placeholder="Select a group…"
              options={groups?.map((g) => ({ label: g.name, value: g.id })) ?? []}
              value={selectedGroupId}
              onChange={setSelectedGroupId}
            />
          )}

          {!hasGroups && (
            <TextField
              label="New group name"
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="Name your group (e.g. Trip to Bali)"
            />
          )}

          {error && <Text className="text-sm text-red-500">{error}</Text>}

          <Button label={isSubmitting ? 'Reading your receipt…' : 'Continue'} onPress={handleContinue} loading={isSubmitting} />
        </View>
      )}
    </View>
  );
}
