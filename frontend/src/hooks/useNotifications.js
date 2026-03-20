
// ── frontend/src/hooks/useNotifications.js ───────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as notifApi from '../api/notificationsApi'
import { useNotificationStore } from '../store/notificationStore'
import { useEffect } from 'react'

export function useNotifications() {
  const setCount = useNotificationStore(s => s.setUnreadCount)
  const q = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notifApi.getNotifications().then(r => r.data),
    refetchInterval: 60_000, // poll every 60s
  })
  useEffect(() => {
    if (q.data) setCount(q.data.filter(n => !n.is_read).length)
  }, [q.data, setCount])
  return q
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  const reset = useNotificationStore(s => s.reset)
  return useMutation({
    mutationFn: notifApi.markAllRead,
    onSuccess: () => { qc.invalidateQueries(['notifications']); reset() },
  })
}