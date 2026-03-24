
// ── frontend/src/api/reportsApi.js ───────────────────────────────
import api from './axiosInstance'

export const submitReport = (data) => api.post('/reports/', data)
export const getMyReports = () => api.get('/reports/my')
export const getDailyStatus = (date) =>
  api.get('/reports/daily-status', { params: date ? { target_date: date } : {} })
export const searchReports = (filters) => api.post('/reports/search', filters)
export const getReport = (id) => api.get(`/reports/${id}`)
export const updateReportStatus = (id, status) =>
  api.patch(`/reports/${id}/status`, null, { params: { review_status: status } })

