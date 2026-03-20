import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as reportsApi from '../api/reportsApi'
import { message } from 'antd'

export const useMyReports = () =>
  useQuery({ queryKey: ['my-reports'], queryFn: () => reportsApi.getMyReports().then(r => r.data) })

export const useDailyStatus = (date) =>
  useQuery({
    queryKey: ['daily-status', date],
    queryFn: () => reportsApi.getDailyStatus(date).then(r => r.data),
  })

export const useReport = (id) =>
  useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsApi.getReport(id).then(r => r.data),
    enabled: !!id,
  })

export const useSearchReports = (filters) =>
  useQuery({
    queryKey: ['reports-search', filters],
    queryFn: () => reportsApi.searchReports(filters).then(r => r.data),
    enabled: !!filters,
  })

export function useSubmitReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reportsApi.submitReport,
    onSuccess: () => {
      qc.invalidateQueries(['my-reports'])
      message.success('Report submitted successfully!')
    },
    onError: (e) => {
      const detail = e.response?.data?.detail
      // Pydantic 422 returns detail as an array of error objects
      if (Array.isArray(detail)) {
        const msgs = detail.map(d => `${d.loc?.slice(-1)[0]}: ${d.msg}`).join(', ')
        message.error(msgs)
      } else {
        message.error(detail || 'Submission failed')
      }
    },
  })
}

export function useUpdateReportStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => reportsApi.updateReportStatus(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries(['report', id])
      qc.invalidateQueries(['reports-search'])
      qc.invalidateQueries(['daily-status'])
    },
  })
}