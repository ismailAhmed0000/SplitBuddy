import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import GroupsListScreen from '../screens/GroupsListScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import UploadBillScreen from '../screens/UploadBillScreen';
import BillDetailScreen from '../screens/BillDetailScreen';
import type { PickedImage } from '../store/api/apiSlice';

export type HomeStackParamList = {
  HomeMain: undefined;
  Notifications: undefined;
  GroupsList: undefined;
  GroupDetail: { groupId: number };
  UploadBill: { initialImage?: PickedImage } | undefined;
  BillDetail: { billId: number };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="GroupsList" component={GroupsListScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="UploadBill" component={UploadBillScreen} />
      <Stack.Screen name="BillDetail" component={BillDetailScreen} />
    </Stack.Navigator>
  );
}
