
// ── frontend/src/api/usersApi.js ─────────────────────────────────
import api from './axiosInstance'

export const getUsers = () => api.get('/users/')
export const getVisibleUsers = () => api.get('/users/visible')
export const getManagers = () => api.get('/users/managers')
export const createUser = (data) => api.post('/users/', data)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const deactivateUser = (id) => api.post(`/users/${id}/deactivate`)
export const changePassword = (data) => api.post('/users/me/change-password', data)

