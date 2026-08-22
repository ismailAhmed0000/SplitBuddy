import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/RootNavigator';
import { useLoginMutation } from '../store/api/apiSlice';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, isError }] = useLoginMutation();

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isLoading;

  async function handleLogin() {
    try {
      await login({ email: email.trim(), password }).unwrap();
    } catch {
      // isError below already surfaces this to the user
    }
  }

  // Android already resizes the screen for the keyboard via windowSoftInputMode="adjustResize";
  // KeyboardAvoidingView there conflicts with it and collapses the layout, so only wrap on iOS.
  const Wrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

  return (
    <Wrapper behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6">
        <View className="mb-8 h-14 w-14 items-center justify-center rounded-2xl bg-teal-600">
          <Text className="text-2xl font-bold text-white">S</Text>
        </View>

        <Text className="mb-1 text-2xl font-semibold text-gray-900">Welcome back</Text>
        <Text className="mb-6 text-sm text-gray-500">Log in to split bills with your buddies.</Text>

        <View className="gap-4">
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            accessibilityLabel="Email"
          />

          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            accessibilityLabel="Password"
          />
        </View>

        {isError && <Text className="mt-4 text-sm text-red-500">Incorrect email or password.</Text>}

        <Button label="Log in" onPress={handleLogin} disabled={!canSubmit} loading={isLoading} className="mt-6" />

        <TouchableOpacity onPress={() => navigation.navigate('Register')} className="mt-4 items-center">
          <Text className="text-sm text-teal-600">Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </Wrapper>
  );
}
