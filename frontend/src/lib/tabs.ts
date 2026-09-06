import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { User } from './auth'
import type { BillStatus } from './bills'

// A "tab" is one confirmed bill's settle-up view. On the wire it is still a
// group (the mobile app and API use that name), so the payload fields below
// keep their `group_*` names.

export type TabMember = {
  id: number
  group_id: number
  user_id: number | null
  name: string
  user: User | null
}

export type Tab = {
  id: number
  name: string
  created_by: number
  members: TabMember[]
  members_count?: number
  bills_count?: number
  payer_id: number | null
  payer: TabMember | null
}

export type TabBalance = {
  group_member_id: number
  user_id: number | null
  name: string
  balance: number
  gross_balance: number
  is_payer: boolean
  status: 'pending' | 'paid'
}

export type TabMemberBill = {
  id: number
  merchant_name: string | null
  bill_date: string | null
  status: BillStatus
  items: { id: number; name: string; amount: number }[]
  total: number
}

export type TabMemberDetail = {
  id: number
  group_id: number
  name: string
  user: User | null
  balance: number
  bills: TabMemberBill[]
}

export const tabKeys = {
  list: ['tabs'] as const,
  detail: (id: number) => ['tabs', id] as const,
  balances: (id: number) => ['tabs', id, 'balances'] as const,
  member: (tabId: number, memberId: number) => ['tabs', tabId, 'members', memberId] as const,
}

async function fetchTabs(): Promise<Tab[]> {
  const { data } = await api.get<{ data: Tab[] }>('/groups', { params: { confirmed: 1 } })
  return data.data
}

export function useTabs() {
  return useQuery({
    queryKey: tabKeys.list,
    queryFn: fetchTabs,
  })
}

async function fetchTab(id: number): Promise<Tab> {
  const { data } = await api.get<{ data: Tab }>(`/groups/${id}`)
  return data.data
}

export function useTab(id: number | undefined) {
  return useQuery({
    queryKey: tabKeys.detail(id ?? 0),
    queryFn: () => fetchTab(id as number),
    enabled: Boolean(id),
  })
}

export function useTabBalances(id: number | undefined) {
  return useQuery({
    queryKey: tabKeys.balances(id ?? 0),
    queryFn: async () => {
      const { data } = await api.get<{ data: TabBalance[] }>(`/groups/${id}/balances`)
      return data.data
    },
    enabled: Boolean(id),
  })
}

export function useTabMember(tabId: number | undefined, memberId: number | undefined) {
  return useQuery({
    queryKey: tabKeys.member(tabId ?? 0, memberId ?? 0),
    queryFn: async () => {
      const { data } = await api.get<{ data: TabMemberDetail }>(`/groups/${tabId}/members/${memberId}`)
      return data.data
    },
    enabled: Boolean(tabId) && Boolean(memberId),
  })
}

export function useUpdateTab(tabId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { name?: string; payer_id?: number | null }) => {
      const { data } = await api.put<{ data: Tab }>(`/groups/${tabId}`, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tabKeys.detail(tabId) })
      queryClient.invalidateQueries({ queryKey: tabKeys.list })
    },
  })
}

export function useDeleteTab() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tabId: number) => {
      await api.delete(`/groups/${tabId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tabKeys.list })
    },
  })
}

export function useAddTabMember(tabId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { name: string; userId?: number }) => {
      const { data } = await api.post<{ data: TabMember }>(`/groups/${tabId}/members`, {
        name: payload.name,
        user_id: payload.userId,
      })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tabKeys.detail(tabId as number) })
      queryClient.invalidateQueries({ queryKey: tabKeys.list })
    },
  })
}

export function useRemoveTabMember(tabId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberId: number) => {
      await api.delete(`/groups/${tabId}/members/${memberId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tabKeys.detail(tabId) })
      queryClient.invalidateQueries({ queryKey: tabKeys.balances(tabId) })
      queryClient.invalidateQueries({ queryKey: tabKeys.list })
    },
  })
}

export type ExportedMessageItem = {
  item_name: string
  amount: number
  bill_name: string
  bill_date: string | null
  bill_date_formatted: string | null
}

export type ExportedMessage = {
  group_member_id: number
  name: string
  amount_owed: number
  items: ExportedMessageItem[]
  message: string
}

export type ExportMessagesResult = {
  data: ExportedMessage[]
  combined_message: string
}

export function useExportMessages(tabId: number) {
  return useMutation({
    mutationFn: async (memberIds: number[]) => {
      const { data } = await api.post<ExportMessagesResult>(`/groups/${tabId}/export-messages`, {
        member_ids: memberIds,
      })
      return data
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
