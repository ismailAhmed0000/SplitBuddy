import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { User } from './auth'

export type Buddy = {
  id: number
  buddy_user_id: number
  user: User
  created_at: string
}

export const buddyKeys = {
  list: ['buddies'] as const,
}

async function fetchBuddies(): Promise<Buddy[]> {
  const { data } = await api.get<{ data: Buddy[] }>('/buddies')
  return data.data
}

export function useBuddies() {
  return useQuery({
    queryKey: buddyKeys.list,
    queryFn: fetchBuddies,
  })
}

export function useAddBuddy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (username: string) => {
      const { data } = await api.post<{ data: Buddy }>('/buddies', { username })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buddyKeys.list })
    },
  })
}

export function useRemoveBuddy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (buddyId: number) => {
      await api.delete(`/buddies/${buddyId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buddyKeys.list })
    },
  })
}
