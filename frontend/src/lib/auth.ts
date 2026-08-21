import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, clearStoredToken, getStoredToken, setStoredToken } from './api'

export type User = {
  id: number
  name: string
  email: string
  phone: string | null
  created_at: string
  updated_at: string
}

type AuthResponse = {
  user: User
  token: string
}

export type RegisterPayload = {
  name: string
  email: string
  phone?: string
  password: string
  password_confirmation: string
}

export type LoginPayload = {
  email: string
  password: string
}

export const authKeys = {
  user: ['auth', 'user'] as const,
}

async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<{ data: User }>('/user')
  return data.data
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: fetchCurrentUser,
    enabled: Boolean(getStoredToken()),
    retry: false,
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await api.post<AuthResponse>('/register', payload)
      return data
    },
    onSuccess: ({ user, token }) => {
      setStoredToken(token)
      queryClient.setQueryData(authKeys.user, user)
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<AuthResponse>('/login', payload)
      return data
    },
    onSuccess: ({ user, token }) => {
      setStoredToken(token)
      queryClient.setQueryData(authKeys.user, user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.post('/logout')
    },
    onSettled: () => {
      clearStoredToken()
      queryClient.setQueryData(authKeys.user, null)
      queryClient.removeQueries({ queryKey: authKeys.user })
    },
  })
}
