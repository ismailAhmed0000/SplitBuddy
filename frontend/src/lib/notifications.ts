import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'

export type Notification = {
  id: number
  user_id: number
  type: string
  message: string
  read: boolean
  read_at: string | null
  created_at: string
}

export const notificationKeys = {
  list: ['notifications'] as const,
}

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list,
    queryFn: async () => {
      const { data } = await api.get<{ data: Notification[] }>('/notifications')
      return data.data
    },
    refetchInterval: 30000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<{ data: Notification }>(`/notifications/${id}/read`)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list })
    },
  })
}
