import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BillsScreen from '../screens/BillsScreen';
import BillDetailScreen from '../screens/BillDetailScreen';

export type BillsStackParamList = {
  BillsList: undefined;
  BillDetail: { billId: number };
};

const Stack = createNativeStackNavigator<BillsStackParamList>();

export function BillsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BillsList" component={BillsScreen} />
      <Stack.Screen name="BillDetail" component={BillDetailScreen} />
    </Stack.Navigator>
  );
}
