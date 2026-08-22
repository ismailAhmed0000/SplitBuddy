import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import type { PickedImage } from '../store/api/apiSlice';

export async function pickBillImage(source: 'camera' | 'library'): Promise<PickedImage | null> {
  const options = { mediaType: 'photo' as const, quality: 0.8 as const };
  const result = source === 'camera' ? await launchCamera(options) : await launchImageLibrary(options);

  const asset = result.assets?.[0];
  if (!asset?.uri) return null;

  return { uri: asset.uri, type: asset.type ?? 'image/jpeg', name: asset.fileName ?? 'receipt.jpg' };
}
