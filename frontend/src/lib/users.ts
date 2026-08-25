import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import { authKeys, type User } from './auth'

export type UpdateUserPayload = Partial<{
  name: string
  username: string
  email: string
  phone: string | null
  bank_name: string | null
  bank_account_number: string | null
  password: string
  password_confirmation: string
}>

export function useUpdateUser(userId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateUserPayload) => {
      const { data } = await api.put<{ data: User }>(`/users/${userId}`, payload)
      return data.data
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.user, user)
    },
  })
}
