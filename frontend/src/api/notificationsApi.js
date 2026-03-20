

// ── frontend/src/api/notificationsApi.js ─────────────────────────
import api from './axiosInstance'

export const getNotifications = () => api.get('/notifications/')
export const markAllRead = () => api.post('/notifications/mark-read')
export const markOneRead = (id) => api.post(`/notifications/${id}/read`)

