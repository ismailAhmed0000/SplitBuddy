import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import { groupKeys } from './groups'
import type { GroupMember } from './groups'

export type Settlement = {
  id: number
  group_id: number
  paid_by: number
  paid_to: number
  amount: string
  note: string | null
  settled_at: string | null
  payer?: GroupMember
  payee?: GroupMember
}

export const settlementKeys = {
  list: (groupId: number) => ['settlements', groupId] as const,
}

export function useSettlements(groupId: number | undefined) {
  return useQuery({
    queryKey: settlementKeys.list(groupId ?? 0),
    queryFn: async () => {
      const { data } = await api.get<{ data: Settlement[] }>('/settlements', { params: { group_id: groupId } })
      return data.data
    },
    enabled: Boolean(groupId),
  })
}

export function useCreateSettlement(groupId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { paidBy: number; paidTo: number; amount: number; note?: string }) => {
      const { data } = await api.post<{ data: Settlement }>('/settlements', {
        group_id: groupId,
        paid_by: payload.paidBy,
        paid_to: payload.paidTo,
        amount: payload.amount,
        note: payload.note,
      })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.list(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.balances(groupId) })
    },
  })
}
