
// ── frontend/src/hooks/useFeedback.js ────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as feedbackApi from '../api/feedbackApi'
import { message } from 'antd'

export const useFeedback = (reportId) =>
  useQuery({
    queryKey: ['feedback', reportId],
    queryFn: () => feedbackApi.getFeedback(reportId).then(r => r.data),
    enabled: !!reportId,
  })

export function usePostFeedback(reportId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => feedbackApi.postFeedback(reportId, data),
    onSuccess: () => {
      qc.invalidateQueries(['feedback', reportId])
      qc.invalidateQueries(['report', reportId])
      message.success('Feedback posted')
    },
  })
}

