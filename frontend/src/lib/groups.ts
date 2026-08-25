import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { User } from './auth'
import type { BillStatus } from './bills'

export type GroupMember = {
  id: number
  group_id: number
  user_id: number | null
  name: string
  user: User | null
}

export type Group = {
  id: number
  name: string
  created_by: number
  members: GroupMember[]
  members_count?: number
  payer_id: number | null
  payer: GroupMember | null
}

export type GroupBalance = {
  group_member_id: number
  user_id: number | null
  name: string
  balance: number
  gross_balance: number
  is_payer: boolean
  status: 'pending' | 'paid'
}

export type GroupMemberBill = {
  id: number
  merchant_name: string | null
  bill_date: string | null
  status: BillStatus
  items: { id: number; name: string; amount: number }[]
  total: number
}

export type GroupMemberDetail = {
  id: number
  group_id: number
  name: string
  user: User | null
  balance: number
  bills: GroupMemberBill[]
}

export const groupKeys = {
  list: ['groups'] as const,
  detail: (id: number) => ['groups', id] as const,
  balances: (id: number) => ['groups', id, 'balances'] as const,
  member: (groupId: number, memberId: number) => ['groups', groupId, 'members', memberId] as const,
}

async function fetchGroups(): Promise<Group[]> {
  const { data } = await api.get<{ data: Group[] }>('/groups')
  return data.data
}

export function useGroups() {
  return useQuery({
    queryKey: groupKeys.list,
    queryFn: fetchGroups,
  })
}

async function fetchGroup(id: number): Promise<Group> {
  const { data } = await api.get<{ data: Group }>(`/groups/${id}`)
  return data.data
}

export function useGroup(id: number | undefined) {
  return useQuery({
    queryKey: groupKeys.detail(id ?? 0),
    queryFn: () => fetchGroup(id as number),
    enabled: Boolean(id),
  })
}

export function useGroupBalances(id: number | undefined) {
  return useQuery({
    queryKey: groupKeys.balances(id ?? 0),
    queryFn: async () => {
      const { data } = await api.get<{ data: GroupBalance[] }>(`/groups/${id}/balances`)
      return data.data
    },
    enabled: Boolean(id),
  })
}

export function useGroupMember(groupId: number | undefined, memberId: number | undefined) {
  return useQuery({
    queryKey: groupKeys.member(groupId ?? 0, memberId ?? 0),
    queryFn: async () => {
      const { data } = await api.get<{ data: GroupMemberDetail }>(`/groups/${groupId}/members/${memberId}`)
      return data.data
    },
    enabled: Boolean(groupId) && Boolean(memberId),
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post<{ data: Group }>('/groups', { name })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.list })
    },
  })
}

export function useUpdateGroup(groupId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { name?: string; payer_id?: number | null }) => {
      const { data } = await api.put<{ data: Group }>(`/groups/${groupId}`, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.list })
    },
  })
}

export function useDeleteGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (groupId: number) => {
      await api.delete(`/groups/${groupId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.list })
    },
  })
}

export function useAddGroupMember(groupId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { name: string; userId?: number }) => {
      const { data } = await api.post<{ data: GroupMember }>(`/groups/${groupId}/members`, {
        name: payload.name,
        user_id: payload.userId,
      })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId as number) })
      queryClient.invalidateQueries({ queryKey: groupKeys.list })
    },
  })
}

export function useRemoveGroupMember(groupId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberId: number) => {
      await api.delete(`/groups/${groupId}/members/${memberId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.balances(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.list })
    },
  })
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: async () => {
      const { data } = await api.get<{ data: User[] }>('/users/search', { params: { q: query } })
      return data.data
    },
    enabled: query.trim().length > 0,
  })
}
