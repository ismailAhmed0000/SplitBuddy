import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/RootNavigator';
import { useRegisterMutation } from '../store/api/apiSlice';
import { parseApiError } from '../utils/apiError';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [register, { isLoading, error }] = useRegisterMutation();

  const canSubmit =
    name.trim().length > 0 && email.trim().length > 0 && password.length > 0 && !isLoading;

  async function handleRegister() {
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      }).unwrap();
    } catch {
      // the `error` value below already surfaces this to the user
    }
  }

  const errorMessage = error ? parseApiError(error) : null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
      <ScrollView contentContainerClassName="justify-center px-6 py-12" keyboardShouldPersistTaps="handled">
        <Text className="mb-1 text-2xl font-semibold text-slate-900">Create an account</Text>
        <Text className="mb-6 text-sm text-slate-500">Start splitting bills with your buddies.</Text>

        <Text className="mb-1 text-sm font-medium text-slate-700">Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Jane Doe"
          accessibilityLabel="Name"
          className="mb-4 rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900"
        />

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

        <Text className="mb-1 text-sm font-medium text-slate-700">Confirm password</Text>
        <TextInput
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          secureTextEntry
          placeholder="••••••••"
          accessibilityLabel="Confirm password"
          className="mb-4 rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900"
        />

        {errorMessage && <Text className="mb-4 text-sm text-red-600">{errorMessage}</Text>}

        <TouchableOpacity
          onPress={handleRegister}
          disabled={!canSubmit}
          className={`items-center rounded-lg bg-violet-600 py-3 ${canSubmit ? '' : 'opacity-50'}`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-medium text-white">Sign up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-4 items-center">
          <Text className="text-sm text-violet-600">Already have an account? Log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
