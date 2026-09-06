import { useQuery } from '@tanstack/react-query'
import { api } from './api'

// One row per tab the user belongs to. Wire field names stay `group_*` /
// `groups` — the API and mobile app still call these groups.
export type TabBalanceSummary = {
  group_id: number
  group_name: string
  group_member_id: number
  balance: number
  status: 'pending' | 'paid'
  is_payer: boolean
  payer_id: number | null
  payer_name: string | null
}

export type UserBalances = {
  groups: TabBalanceSummary[]
  overall_balance: number
}

export function useUserBalances(userId: number | undefined) {
  return useQuery({
    queryKey: ['balances', 'user', userId],
    queryFn: async () => {
      const { data } = await api.get<{ data: UserBalances }>(`/users/${userId}/balances`)
      return data.data
    },
    enabled: Boolean(userId),
  })
}
