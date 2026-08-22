import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/RootNavigator';
import { useRegisterMutation } from '../store/api/apiSlice';
import { parseApiError } from '../utils/apiError';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';

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

  // Android already resizes the screen for the keyboard via windowSoftInputMode="adjustResize";
  // KeyboardAvoidingView there conflicts with it and collapses the layout, so only wrap on iOS.
  const Wrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

  return (
    <Wrapper behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
      <ScrollView contentContainerClassName="justify-center px-6 py-12" keyboardShouldPersistTaps="handled">
        <View className="mb-8 h-14 w-14 items-center justify-center rounded-2xl bg-teal-600">
          <Text className="text-2xl font-bold text-white">S</Text>
        </View>

        <Text className="mb-1 text-2xl font-semibold text-gray-900">Create an account</Text>
        <Text className="mb-6 text-sm text-gray-500">Start splitting bills with your buddies.</Text>

        <View className="gap-4">
          <TextField label="Name" value={name} onChangeText={setName} placeholder="Jane Doe" accessibilityLabel="Name" />

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

          <TextField
            label="Confirm password"
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            secureTextEntry
            placeholder="••••••••"
            accessibilityLabel="Confirm password"
          />
        </View>

        {errorMessage && <Text className="mt-4 text-sm text-red-500">{errorMessage}</Text>}

        <Button label="Sign up" onPress={handleRegister} disabled={!canSubmit} loading={isLoading} className="mt-6" />

        <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-4 items-center">
          <Text className="text-sm text-teal-600">Already have an account? Log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </Wrapper>
  );
}
