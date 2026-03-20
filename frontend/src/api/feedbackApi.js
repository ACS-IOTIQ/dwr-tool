
// ── frontend/src/api/feedbackApi.js ──────────────────────────────
import api from './axiosInstance'

export const getFeedback = (reportId) => api.get(`/feedback/report/${reportId}`)
export const postFeedback = (reportId, data) =>
  api.post(`/feedback/report/${reportId}`, data)

