import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { User } from './auth'

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
}

export type GroupBalance = {
  group_member_id: number
  user_id: number | null
  name: string
  balance: number
}

export const groupKeys = {
  list: ['groups'] as const,
  detail: (id: number) => ['groups', id] as const,
  balances: (id: number) => ['groups', id, 'balances'] as const,
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
    mutationFn: async (name: string) => {
      const { data } = await api.put<{ data: Group }>(`/groups/${groupId}`, { name })
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
