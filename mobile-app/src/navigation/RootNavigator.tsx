import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { hydrateAuth } from '../store/slices/authSlice';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import BuddiesScreen from '../screens/BuddiesScreen';
import BillsScreen from '../screens/BillsScreen';
import { BottomTabBar } from './BottomTabBar';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Buddies: undefined;
  Bills: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppTab = createBottomTabNavigator<AppTabParamList>();

export function RootNavigator() {
  const dispatch = useAppDispatch();
  const { token, isHydrated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? (
        <AppTab.Navigator tabBar={BottomTabBar} screenOptions={{ headerShown: false }}>
          <AppTab.Screen name="Home" component={HomeScreen} />
          <AppTab.Screen name="Buddies" component={BuddiesScreen} />
          <AppTab.Screen name="Bills" component={BillsScreen} />
        </AppTab.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
