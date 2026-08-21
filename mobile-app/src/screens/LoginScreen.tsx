import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/RootNavigator';
import { useLoginMutation } from '../store/api/apiSlice';

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 justify-center bg-white px-6"
    >
      <Text className="mb-1 text-2xl font-semibold text-slate-900">Welcome back</Text>
      <Text className="mb-6 text-sm text-slate-500">Log in to split bills with your buddies.</Text>

      <Text className="mb-1 text-sm font-medium text-slate-700">Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
        accessibilityLabel="Email"
        className="mb-4 rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900"
      />

      <Text className="mb-1 text-sm font-medium text-slate-700">Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
        accessibilityLabel="Password"
        className="mb-4 rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900"
      />

      {isError && <Text className="mb-4 text-sm text-red-600">Incorrect email or password.</Text>}

      <TouchableOpacity
        onPress={handleLogin}
        disabled={!canSubmit}
        className={`items-center rounded-lg bg-violet-600 py-3 ${canSubmit ? '' : 'opacity-50'}`}
      >
        {isLoading ? <ActivityIndicator color="white" /> : <Text className="font-medium text-white">Log in</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} className="mt-4 items-center">
        <Text className="text-sm text-violet-600">Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
