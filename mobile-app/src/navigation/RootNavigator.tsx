import { NavigationContainer, type NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { hydrateAuth } from '../store/slices/authSlice';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import BuddiesScreen from '../screens/BuddiesScreen';
import { HomeStack, type HomeStackParamList } from './HomeStack';
import { BillsStack, type BillsStackParamList } from './BillsStack';
import { BottomTabBar } from './BottomTabBar';
import { SplashScreen } from '../components/SplashScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Buddies: undefined;
  Bills: NavigatorScreenParams<BillsStackParamList>;
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
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {token ? (
        <AppTab.Navigator tabBar={BottomTabBar} screenOptions={{ headerShown: false }}>
          <AppTab.Screen name="Home" component={HomeStack} />
          <AppTab.Screen name="Buddies" component={BuddiesScreen} />
          <AppTab.Screen name="Bills" component={BillsStack} />
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
