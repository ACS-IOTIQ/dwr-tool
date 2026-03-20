
// ── frontend/src/api/leaveApi.js ─────────────────────────────────
import api from './axiosInstance'

export const getLeaves = () => api.get('/leave/')
export const markLeave = (data) => api.post('/leave/', data)
export const removeLeave = (id) => api.delete(`/leave/${id}`)
