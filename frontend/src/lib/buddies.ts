import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { User } from './auth'
import type { BillStatus } from './bills'

export type Buddy = {
  id: number
  buddy_user_id: number
  user: User
  created_at: string
}

export type BuddyBill = {
  id: number
  merchant_name: string | null
  bill_date: string | null
  status: BillStatus
  items: { id: number; name: string; amount: number }[]
  total: number
  group_id: number
  group_name: string
}

export type BuddyDetail = {
  id: number
  user: User
  balance: number
  bills: BuddyBill[]
}

export const buddyKeys = {
  list: ['buddies'] as const,
  detail: (id: number) => ['buddies', id] as const,
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

export function useBuddyDetail(id: number | undefined) {
  return useQuery({
    queryKey: buddyKeys.detail(id ?? 0),
    queryFn: async () => {
      const { data } = await api.get<{ data: BuddyDetail }>(`/buddies/${id}`)
      return data.data
    },
    enabled: Boolean(id),
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
