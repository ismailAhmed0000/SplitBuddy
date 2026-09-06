import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { TabMember } from './tabs'

export type BillStatus = 'processing' | 'parsed' | 'confirmed' | 'failed'
export type ShareType = 'equal' | 'percentage' | 'exact_amount'

export type Assignment = {
  id: number
  item_id: number
  group_member_id: number
  share_type: ShareType
  share_value: string | null
  group_member?: TabMember
}

export type BillItem = {
  id: number
  bill_id: number
  name: string
  quantity: string
  unit_price: string
  total_price: string
  final_price: string
  assignments: Assignment[]
}

export type Bill = {
  id: number
  group_id: number
  uploaded_by: number
  image_url: string | null
  merchant_name: string | null
  bill_date: string | null
  subtotal: string | null
  tax_amount: string | null
  tax_label: string | null
  discount_amount: string | null
  discount_type: 'flat' | 'percentage' | null
  service_charge: string | null
  tip_amount: string | null
  total: string | null
  status: BillStatus
  items: BillItem[]
  participants: TabMember[]
}

export const billKeys = {
  list: (groupId?: number) => ['bills', { groupId }] as const,
  detail: (id: number) => ['bills', id] as const,
}

export function useBills(groupId?: number) {
  return useQuery({
    queryKey: billKeys.list(groupId),
    queryFn: async () => {
      const { data } = await api.get<{ data: Bill[] }>('/bills', {
        params: groupId ? { group_id: groupId } : undefined,
      })
      return data.data
    },
  })
}

export function useDeleteBill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/bills/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
  })
}

async function fetchBill(id: number): Promise<Bill> {
  const { data } = await api.get<{ data: Bill }>(`/bills/${id}`)
  return data.data
}

export function useBill(id: number | undefined) {
  return useQuery({
    queryKey: billKeys.detail(id ?? 0),
    queryFn: () => fetchBill(id as number),
    enabled: Boolean(id),
    refetchInterval: (query) => (query.state.data?.status === 'processing' ? 2000 : false),
  })
}

export function useUploadBill() {
  return useMutation({
    // No tab/group is chosen up front — the backend opens a fresh tab for
    // this bill and adds the uploader as its first member + collector.
    mutationFn: async ({ file }: { file: File }) => {
      const formData = new FormData()
      formData.append('image', file)

      const { data } = await api.post<{ data: Bill }>('/bills', formData)
      return data.data
    },
  })
}

export function useConfirmBill(billId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.put<{ data: Bill }>(`/bills/${billId}`, { status: 'confirmed' })
      return data.data
    },
    onSuccess: (bill) => {
      queryClient.setQueryData(billKeys.detail(bill.id), bill)
      // Confirming is what makes the tab real, so refresh its balances and
      // the tabs list where it now appears.
      queryClient.invalidateQueries({ queryKey: ['tabs', bill.group_id, 'balances'] })
      queryClient.invalidateQueries({ queryKey: ['tabs'] })
    },
  })
}

export function useRetryExtraction(billId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ data: Bill }>(`/bills/${billId}/extract`)
      return data.data
    },
    onSuccess: (bill) => {
      queryClient.setQueryData(billKeys.detail(bill.id), bill)
    },
  })
}

export function useCreateAssignment(billId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ itemId, groupMemberId }: { itemId: number; groupMemberId: number }) => {
      const { data } = await api.post<{ data: Assignment }>(`/items/${itemId}/assignments`, {
        group_member_id: groupMemberId,
        share_type: 'equal',
      })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.detail(billId) })
    },
  })
}

export function useDeleteAssignment(billId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (assignmentId: number) => {
      await api.delete(`/assignments/${assignmentId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.detail(billId) })
    },
  })
}

export function useAddBillParticipant(billId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (groupMemberId: number) => {
      const { data } = await api.post<{ data: TabMember }>(`/bills/${billId}/participants`, {
        group_member_id: groupMemberId,
      })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.detail(billId as number) })
    },
  })
}

export function useRemoveBillParticipant(billId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (groupMemberId: number) => {
      await api.delete(`/bills/${billId}/participants/${groupMemberId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.detail(billId as number) })
    },
  })
}
